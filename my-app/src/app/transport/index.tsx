import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { postTransportRequest } from '@/lib/api/endpoints';
import { useIsOnline } from '@/lib/network/connectivity';
import { useOutboxStore } from '@/stores/outboxStore';
import { useSessionStore } from '@/stores/sessionStore';

export default function TransportRequestScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const session = useSessionStore();
  const enqueueTransport = useOutboxStore((s) => s.enqueueTransport);
  const params = useLocalSearchParams<{
    commodity?: string;
    quantity?: string;
    pickupLat?: string;
    pickupLng?: string;
    destinationName?: string;
  }>();

  const [commodity, setCommodity] = useState(params.commodity || session.commodity || '');
  const [quantityText, setQuantityText] = useState(params.quantity || (session.quantityKg ? String(session.quantityKg) : ''));
  const [pickupLocation, setPickupLocation] = useState(
    params.pickupLat && params.pickupLng ? `${params.pickupLat}, ${params.pickupLng}` : '',
  );
  const [deliveryLocation, setDeliveryLocation] = useState(params.destinationName || '');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const quantityKg = Number(quantityText);
  const isValid =
    commodity.trim().length > 0 &&
    quantityKg > 0 &&
    pickupLocation.trim().length > 0 &&
    deliveryLocation.trim().length > 0 &&
    preferredSchedule.trim().length > 0;

  const onSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    const input = { commodity, quantityKg, pickupLocation, deliveryLocation, preferredSchedule };
    try {
      if (isOnline) {
        const result = await postTransportRequest(input);
        router.replace({
          pathname: '/transport/confirmation',
          params: { referenceNumber: result.referenceNumber, submittedOffline: '0' },
        });
      } else {
        await enqueueTransport(input);
        router.replace({ pathname: '/transport/confirmation', params: { submittedOffline: '1' } });
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('home.tileTransport')} subtitle={t('home.tileTransportSub')} onBack={() => router.back()} />

      <ScrollView contentContainerClassName="gap-4 px-4 pb-12">
        {!isOnline && (
          <View className="rounded-xl bg-state-warning-bg p-3">
            <Text className="text-xs font-sans-bold text-state-warning">
              {t('connectivity.offlineBadge')} — {t('transport.offlineQueueNote')}
            </Text>
          </View>
        )}

        <View className="gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <Field
            label={t('transport.commodityLabel')}
            value={commodity}
            onChangeText={setCommodity}
            placeholder={t('transport.commodityPlaceholder')}
          />
          <Field
            label={`${t('transport.quantityLabel')} (${t('common.kg')})`}
            value={quantityText}
            onChangeText={setQuantityText}
            keyboardType="numeric"
            placeholder="500"
          />
          <Field
            label={t('transport.pickupLabel')}
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder={t('transport.pickupPlaceholder')}
          />
          <Field
            label={t('transport.deliveryLabel')}
            value={deliveryLocation}
            onChangeText={setDeliveryLocation}
            placeholder={t('transport.deliveryPlaceholder')}
          />
          <Field
            label={t('transport.scheduleLabel')}
            value={preferredSchedule}
            onChangeText={setPreferredSchedule}
            placeholder={t('transport.schedulePlaceholder')}
          />
        </View>

        {submitError && (
          <Text className="text-sm font-sans-bold text-state-danger">
            {t('treatment.offlineNotCached')}
          </Text>
        )}

        <TouchableOpacity
          className={`min-h-[52px] items-center justify-center rounded-full ${
            isValid ? 'bg-brand-primary' : 'bg-surface-muted'
          }`}
          onPress={onSubmit}
          disabled={!isValid || submitting}
          accessibilityRole="button"
        >
          <Text className={`font-sans-bold text-base ${isValid ? 'text-white' : 'text-ink-muted'}`}>
            {submitting ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric';
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-bold text-xs text-ink-secondary">{label}</Text>
      <TextInput
        className="min-h-[48px] rounded-xl border border-border bg-surface-app px-4 text-base text-ink-primary"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A938D"
        keyboardType={keyboardType}
      />
    </View>
  );
}
