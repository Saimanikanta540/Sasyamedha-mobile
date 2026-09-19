import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DiagnosisScreen() {
  const router = useRouter();
  const [hasScanned, setHasScanned] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-3"
          onPress={() => router.back()}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">AI Crop Diagnosis</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {!hasScanned ? (
          <View className="flex-1 items-center justify-center pt-20">
            <View className="w-64 h-64 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 items-center justify-center mb-8">
              <Text className="text-6xl mb-4">📷</Text>
              <Text className="text-gray-500 font-semibold text-center px-4">
                Take a photo or upload an image of the affected plant leaf
              </Text>
            </View>

            <TouchableOpacity 
              className="bg-green-600 w-full py-4 rounded-2xl items-center shadow-md mb-4"
              activeOpacity={0.8}
              onPress={() => setHasScanned(true)}
            >
              <Text className="text-white text-lg font-semibold">Scan with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white w-full py-4 rounded-2xl items-center border border-green-600"
              activeOpacity={0.8}
              onPress={() => setHasScanned(true)}
            >
              <Text className="text-green-600 text-lg font-semibold">Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {/* Image Preview Mock */}
            <View className="w-full h-56 bg-green-50 rounded-2xl border border-green-200 items-center justify-center mb-6 overflow-hidden">
               <View className="absolute inset-0 bg-black/10" />
               <Text className="text-8xl">🌿</Text>
               <View className="absolute bottom-4 bg-white/90 px-4 py-2 rounded-lg">
                 <Text className="font-bold text-green-900">Analyzed Image</Text>
               </View>
            </View>

            {/* Diagnosis Result */}
            <View className="bg-red-50 p-5 rounded-2xl border border-red-100 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-red-800 font-bold text-lg">Disease Detected</Text>
                <View className="bg-red-200 px-3 py-1 rounded-full">
                  <Text className="text-red-900 text-xs font-bold">98% Match</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-red-900 mb-2">Late Blight</Text>
              <Text className="text-red-800 leading-5">
                A destructive fungal disease that causes dark lesions on leaves and can quickly ruin the entire crop if left untreated.
              </Text>
            </View>

            {/* Treatment Recommendation */}
            <Text className="text-xl font-bold text-gray-800 mb-4">Recommended Treatment</Text>
            <View className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <View className="flex-row items-start mb-4">
                <Text className="text-2xl mr-3">🧪</Text>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-base">Chemical Control</Text>
                  <Text className="text-gray-600 mt-1">Apply a copper-based fungicide or Chlorothalonil immediately. Repeat every 7-10 days.</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">✂️</Text>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-base">Cultural Control</Text>
                  <Text className="text-gray-600 mt-1">Remove and destroy infected plant parts. Ensure adequate spacing for air circulation.</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity 
                className="flex-1 bg-white border border-gray-300 py-4 rounded-xl items-center"
                onPress={() => setHasScanned(false)}
              >
                <Text className="text-gray-700 font-semibold">Rescan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-green-600 py-4 rounded-xl items-center"
                onPress={() => router.push('/home')}
              >
                <Text className="text-white font-semibold">Back to Home</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
