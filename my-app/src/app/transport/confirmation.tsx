import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransportConfirmationScreen() {
  const router = useRouter();
  const { referenceNumber, submittedOffline } = useLocalSearchParams<{
    referenceNumber?: string;
    submittedOffline?: string;
  }>();
  const isOffline = submittedOffline === '1';

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-surface-app px-6">
      <Text className="mb-4 text-6xl">{isOffline ? '⏳' : '✅'}</Text>
      {isOffline ? (
        <>
          <Text className="mb-2 text-center font-sans-bold text-xl text-ink-primary">Pending</Text>
          <Text className="mb-8 text-center text-sm leading-5 text-ink-secondary">
            Will send when back online — you'll get a reference number once it's confirmed.
          </Text>
        </>
      ) : (
        <>
          <Text className="mb-2 text-center text-sm text-ink-secondary">Reference number</Text>
          <Text className="mb-8 text-center font-sans-bold text-3xl text-brand-primary">
            {referenceNumber}
          </Text>
        </>
      )}
      <TouchableOpacity
        className="min-h-[52px] w-full items-center justify-center rounded-full bg-brand-primary"
        onPress={() => router.replace('/home')}
        accessibilityRole="button"
      >
        <Text className="font-sans-bold text-base text-white">Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
