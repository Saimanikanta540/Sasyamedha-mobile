import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'हिंदी' },
    { id: 'te', name: 'తెలుగు' },
    { id: 'mr', name: 'मराठी' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <View className="flex-1 px-6 justify-center">
        {/* Header / Logo Area */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-green-600 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">🌱</Text>
          </View>
          <Text className="text-3xl font-bold text-green-900 text-center mb-2">
            Smart Crop & Market Access
          </Text>
          <Text className="text-base text-green-700 text-center px-4">
            AI Crop Diagnosis & Market Insights to empower your farming
          </Text>
        </View>

        {/* Language Selection */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-green-100">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Select Your Language
          </Text>
          
          <View className="space-y-3 gap-3">
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setSelectedLanguage(lang.name)}
                className={`p-4 rounded-xl border flex-row items-center justify-between ${
                  selectedLanguage === lang.name 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text className={`text-base ${
                  selectedLanguage === lang.name ? 'font-bold text-green-800' : 'text-gray-700'
                }`}>
                  {lang.name}
                </Text>
                {selectedLanguage === lang.name && (
                  <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View className="mt-auto mb-8 pt-6">
          <TouchableOpacity 
            className="bg-green-600 py-4 rounded-2xl items-center shadow-md"
            activeOpacity={0.8}
            onPress={() => router.push('/home')}
          >
            <Text className="text-white text-lg font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
