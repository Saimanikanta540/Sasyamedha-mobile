import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function FarmerDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-6">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-900">Ramesh Kumar</Text>
          </View>
          <View className="w-12 h-12 bg-green-200 rounded-full items-center justify-center">
            <Text className="text-xl">👨‍🌾</Text>
          </View>
        </View>

        {/* Weather & Location Widget */}
        <View className="bg-blue-50 p-4 rounded-2xl mb-6 flex-row items-center justify-between border border-blue-100 shadow-sm">
          <View>
            <Text className="text-blue-900 font-semibold text-lg">Pune, Maharashtra</Text>
            <Text className="text-blue-700">Partly Cloudy • 28°C</Text>
          </View>
          <Text className="text-4xl">⛅</Text>
        </View>

        {/* Quick Actions Grid */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Quick Services</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          
          {/* Card 1: AI Diagnosis */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center"
            activeOpacity={0.7}
            onPress={() => router.push('/diagnosis')}
          >
            <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl">📸</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">AI Crop Diagnosis</Text>
          </TouchableOpacity>

          {/* Card 2: Market Access */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center"
            activeOpacity={0.7}
            onPress={() => console.log('Navigate to Calculator')}
          >
            <View className="w-14 h-14 bg-orange-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl">📈</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">Sell Smart Return</Text>
          </TouchableOpacity>

          {/* Card 3: Live Mandi Rates */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center"
            activeOpacity={0.7}
          >
            <View className="w-14 h-14 bg-purple-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl">💰</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">Live Mandi Prices</Text>
          </TouchableOpacity>

          {/* Card 4: Ask Expert */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center"
            activeOpacity={0.7}
          >
            <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl">👨‍🔬</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">Ask an Expert</Text>
          </TouchableOpacity>
        </View>

        {/* Market Alerts */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Latest Alerts</Text>
        <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-8 flex-row items-start">
          <Text className="text-xl mr-3">⚠️</Text>
          <View className="flex-1">
            <Text className="font-bold text-yellow-900">Price Surge: Wheat</Text>
            <Text className="text-yellow-800 text-sm mt-1">
              Wheat prices in APMC Pune have gone up by 5% today. Consider listing your harvest.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
