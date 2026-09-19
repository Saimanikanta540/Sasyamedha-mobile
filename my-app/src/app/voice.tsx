import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

function useVoiceInputStub() {
  const [listening, setListening] = useState(false);
  const toggle = () => setListening((v) => !v);
  return { listening, toggle };
}

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { listening, toggle } = useVoiceInputStub();
  
  // Simple pulse animation
  const [pulse] = useState(new Animated.Value(1));

  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [listening]);

  return (
    <View className="flex-1 bg-surface-app">
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-row items-center gap-3 px-4 py-4 justify-between">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Text className="text-xl text-white">✕</Text>
            </TouchableOpacity>
            <View className="bg-white/20 px-4 py-1.5 rounded-full">
               <Text className="font-sans-bold text-sm text-white uppercase tracking-widest">{t('home.voiceAssistant')}</Text>
            </View>
            <View className="w-12 h-12" />
          </View>

          <View className="flex-1 items-center justify-center gap-12 px-8">
            <View className="h-40 justify-end">
               <Text className="text-center font-sans-bold text-3xl text-white leading-[42px]">
                 {listening ? 'Listening to you...' : 'How can I help you today?'}
               </Text>
               <Text className="text-center text-lg text-white/70 mt-4">
                 {listening ? 'Speak clearly into the microphone.' : 'Ask about mandi rates, crops, or treatments.'}
               </Text>
            </View>

            <View className="items-center justify-center h-48 w-48">
              {listening && (
                <Animated.View 
                   style={{ transform: [{ scale: pulse }] }}
                   className="absolute h-40 w-40 rounded-full bg-white/20" 
                />
              )}
              {listening && (
                <Animated.View 
                   style={{ transform: [{ scale: Animated.multiply(pulse, 1.1) }] }}
                   className="absolute h-48 w-48 rounded-full bg-white/10" 
                />
              )}
              <TouchableOpacity
                className={`h-28 w-28 items-center justify-center rounded-full shadow-lg ${listening ? 'bg-white' : 'bg-brand-accent'}`}
                style={{ elevation: 10 }}
                onPress={toggle}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('home.voiceAssistant')}
              >
                <Text className="text-5xl">{listening ? '⏹' : '🎙️'}</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row gap-3 flex-wrap justify-center mt-8">
               {!listening && ['"Tomato rates in Guntur?"', '"What is early blight?"', '"Best logistics to Tenali?"'].map((prompt) => (
                 <View key={prompt} className="bg-white/15 px-4 py-2 rounded-full border border-white/20">
                    <Text className="text-white text-sm font-sans-bold">{prompt}</Text>
                 </View>
               ))}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
