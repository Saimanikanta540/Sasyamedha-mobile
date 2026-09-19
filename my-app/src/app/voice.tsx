import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Voice input/output is out of scope for this pass — this wires the affordance to a
 * stub so the Home mic button isn't a dead end, without implementing recognition. */
function useVoiceInputStub() {
  const [listening, setListening] = useState(false);
  const toggle = () => setListening((v) => !v);
  return { listening, toggle };
}

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { listening, toggle } = useVoiceInputStub();

  return (
    <SafeAreaView className="flex-1 bg-brand-primary" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 px-4 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text className="text-xl text-white">←</Text>
        </TouchableOpacity>
        <Text className="font-sans-bold text-lg text-white">{t('home.voiceAssistant')}</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-6 px-8">
        <Text className="text-center text-base text-white/80">
          {listening ? 'Listening…' : 'Tap the mic and ask about prices, treatment or selling.'}
        </Text>
        <TouchableOpacity
          className={`h-24 w-24 items-center justify-center rounded-full ${listening ? 'bg-brand-accent' : 'bg-white/15'}`}
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={t('home.voiceAssistant')}
        >
          <Text className="text-4xl">{listening ? '⏹' : '🎙️'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
