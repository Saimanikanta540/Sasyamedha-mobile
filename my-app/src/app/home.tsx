import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function FarmerDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-[#0B3B24] rounded-full items-center justify-center mr-2">
            <Text className="text-white">🚜</Text>
          </View>
          <View>
            <Text className="font-bold text-gray-800 text-base">Rythu Mitra <Text className="text-orange-500 text-xs">AP</Text></Text>
            <Text className="text-xs text-gray-500">Rythu Mitra • Kisan Care</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 flex-row items-center">
            <Text className="text-xs text-gray-700">🌐 EN | English</Text>
          </View>
          <View className="w-8 h-8 bg-[#0B3B24] rounded-full items-center justify-center">
            <Text className="text-white text-xs">👤</Text>
          </View>
        </View>
      </View>

      {/* Sync Status */}
      <View className="bg-gray-200 px-4 py-2 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-black rounded-full mr-2" />
          <Text className="text-xs text-gray-700">Offline Ready</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-500 mr-1">Synced 10m ago</Text>
          <Text className="text-gray-500 text-xs">↻</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-20">
        
        {/* Welcome Section */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="text-orange-600 text-xs font-bold mb-1">Farmer Desk</Text>
              <Text className="text-2xl font-bold text-[#0B3B24] leading-7 mb-1">Welcome,</Text>
              <Text className="text-2xl font-bold text-[#0B3B24] leading-7 mb-2">Venkateswara Rao!</Text>
              <Text className="text-gray-600 text-xs mb-3">Good morning, hope your harvest goes well today</Text>
            </View>
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Text className="text-orange-800 text-lg">☀️</Text>
            </View>
          </View>
          
          <View className="flex-row gap-2">
            <View className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
              <Text className="text-xs text-gray-600 mr-1">📍</Text>
              <Text className="text-xs text-gray-700">Guntur Rural</Text>
            </View>
            <View className="bg-orange-100 px-3 py-1.5 rounded-full flex-row items-center">
              <Text className="text-xs text-orange-800 mr-1">🌤️</Text>
              <Text className="text-xs text-orange-800">28°C Sunny</Text>
            </View>
          </View>
          <View className="bg-teal-50 px-3 py-1.5 rounded-full flex-row items-center self-start mt-2">
            <Text className="text-xs text-teal-700 mr-1">💧</Text>
            <Text className="text-xs text-teal-700">64% Humidity</Text>
          </View>
        </View>

        {/* Active Crop Batch */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <View className="bg-black px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-white text-xs mr-1">⚙️</Text>
              <Text className="text-white text-xs font-bold">Active Crop Batch</Text>
            </View>
            <Text className="text-orange-700 text-xs font-bold">Batch #AP-GNT-402</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-red-100 rounded-xl mr-3 items-center justify-center overflow-hidden">
              <Text className="text-4xl">🍅</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-800">Tomato <Text className="text-gray-500 font-normal text-sm">(Grade A)</Text></Text>
              <Text className="text-orange-700 font-bold text-base">500 kg <Text className="text-gray-500 font-normal text-xs">(20 Crates)</Text></Text>
            </View>
          </View>

          <View className="bg-[#FDFBF7] rounded-xl p-3 mb-4">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-gray-400 text-xs mr-2">◇</Text>
              <Text className="text-gray-600 text-xs">Farm: Mangalagiri Rd</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-xs mr-2">📅</Text>
              <Text className="text-gray-600 text-xs">Harvest Date: Harvested Today 06:30 AM</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-[#0B3B24] py-3.5 rounded-xl flex-row items-center justify-center">
            <Text className="text-green-300 mr-2">📈</Text>
            <Text className="text-white font-bold mr-2">Check Mandi Prices</Text>
            <Text className="text-white font-bold">→</Text>
          </TouchableOpacity>
        </View>

        {/* Farmer Services Header */}
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-lg font-bold text-gray-800">Farmer Services</Text>
            <Text className="text-gray-500 text-xs">Essential Farming Tools & Services</Text>
          </View>
          <View className="bg-orange-100 px-3 py-1 rounded-full">
            <Text className="text-orange-800 text-xs font-bold">6 Tools</Text>
          </View>
        </View>

        {/* Services Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          
          {/* Card 1: Check Crop */}
          <TouchableOpacity 
            className="w-[48%] bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100"
            activeOpacity={0.7}
            onPress={() => router.push('/diagnosis')}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-[#0B3B24] rounded-xl items-center justify-center">
                <Text className="text-white text-lg">📷</Text>
              </View>
              <View className="bg-black px-2 py-0.5 rounded-full">
                <Text className="text-white text-[9px] font-bold">AI TOOL</Text>
              </View>
            </View>
            <Text className="font-bold text-[#0B3B24] mb-1">Check Crop...</Text>
            <Text className="text-[#0B3B24]/80 text-xs font-bold mb-1">Scan leaf with AI</Text>
            <Text className="text-[#0B3B24]/60 text-[10px]">Scan leaf with AI to diagnose crop illness</Text>
          </TouchableOpacity>

          {/* Card 2: Market Prices */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                <Text className="text-orange-800 text-lg">📊</Text>
              </View>
              <View className="w-2 h-2 bg-red-500 rounded-full" />
            </View>
            <Text className="font-bold text-gray-800 mb-1">Market Prices</Text>
            <Text className="text-gray-600 text-xs mb-1">Live Mandi Rates</Text>
            <Text className="text-gray-400 text-[10px]">Today's Guntur & Vijayawada mandi...</Text>
          </TouchableOpacity>

          {/* Card 3: Sell Smart */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
            onPress={() => router.push('/calculator')}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-gray-600 text-lg">💵</Text>
              </View>
              <Text className="text-gray-400">↗</Text>
            </View>
            <Text className="font-bold text-gray-800 mb-1">Sell Smart</Text>
            <Text className="text-gray-600 text-xs mb-1">Net Profit Analysis</Text>
            <Text className="text-gray-400 text-[10px]">Calculate net return after deductions...</Text>
          </TouchableOpacity>

          {/* Card 4: Cold Storage */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center">
                <Text className="text-orange-600 text-lg">❄️</Text>
              </View>
              <View className="bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                <Text className="text-orange-800 text-[9px] font-bold">4 Units Free</Text>
              </View>
            </View>
            <Text className="font-bold text-gray-800 mb-1">Cold Storage</Text>
            <Text className="text-gray-600 text-xs mb-1">Nearby Capacity</Text>
            <Text className="text-gray-400 text-[10px]">Available capacity in nearby cold facilities</Text>
          </TouchableOpacity>

          {/* Card 5: Book Transport */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center">
                <Text className="text-red-700 text-lg">🚚</Text>
              </View>
              <Text className="text-gray-400">☁</Text>
            </View>
            <Text className="font-bold text-gray-800 mb-1">Book Transport</Text>
            <Text className="text-gray-600 text-xs mb-1">Freight & Tempo</Text>
            <Text className="text-gray-400 text-[10px]">Hire tempo / mini-truck (Rates per km)</Text>
          </TouchableOpacity>

          {/* Card 6: Farmer Assistant */}
          <TouchableOpacity 
            className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 bg-orange-400 rounded-xl items-center justify-center">
                <Text className="text-white text-lg">🎙️</Text>
              </View>
              <Text className="text-orange-400">🍃</Text>
            </View>
            <Text className="font-bold text-gray-800 mb-1">Farmer...</Text>
            <Text className="text-gray-600 text-xs mb-1">Interactive Voice AI</Text>
            <Text className="text-gray-400 text-[10px]">Voice assistant: Speak or ask questions in...</Text>
          </TouchableOpacity>
        </View>

        {/* Tip of the day */}
        <View className="bg-white rounded-2xl p-3 flex-row items-center shadow-sm border border-gray-100 mb-12">
          <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-green-100">
            {/* Mock crop image */}
            <View className="flex-1 bg-green-200" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-gray-500 text-xs mr-1">💡</Text>
              <Text className="text-gray-800 font-bold text-xs">Today's Agronomy Tip</Text>
            </View>
            <Text className="text-gray-700 text-xs font-bold mb-1">Dry chilli and tomato crops in the ...</Text>
            <Text className="text-gray-500 text-[10px]">Keep harvested crop in shade for 20% longer shelf life</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Tab Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around py-3 px-2">
        <TouchableOpacity className="items-center">
          <Text className="text-[#0B3B24] text-xl mb-1">🏠</Text>
          <Text className="text-[#0B3B24] text-[10px] font-bold">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xl mb-1">📈</Text>
          <Text className="text-gray-500 text-[10px]">Prices</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xl mb-1">🏪</Text>
          <Text className="text-gray-500 text-[10px]">Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xl mb-1">🗺️</Text>
          <Text className="text-gray-500 text-[10px]">Storage & Map</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xl mb-1">🤖</Text>
          <Text className="text-gray-500 text-[10px]">Assistant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
