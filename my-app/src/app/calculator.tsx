import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function CalculatorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      {/* Header */}
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
            <Text className="text-xs text-gray-700">🌐 Telugu | తెలుగు</Text>
          </View>
          <View className="w-8 h-8 bg-[#0B3B24] rounded-full items-center justify-center">
            <Text className="text-white text-xs">👤</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-24">
        
        {/* Title */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">స్మార్ట్ అమ్మకం కాలిక్యులేటర్</Text>
        </View>

        <View className="bg-orange-100 rounded-full py-1.5 px-4 self-start mb-4">
          <Text className="text-orange-800 text-xs">ఆడియో గైడ్</Text>
        </View>

        {/* Inputs */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-xs font-bold mb-2">పంట ఎంచుకోండి (Crop)</Text>
          <View className="bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">🍅</Text>
              <Text className="font-bold text-gray-800 text-sm">టమాటా (Tomato)</Text>
            </View>
            <Text className="text-gray-400">⌄</Text>
          </View>

          <Text className="text-gray-500 text-xs font-bold mb-2">అంచనా దిగుబడి / Estimated Quantity (kg)</Text>
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity className="w-10 h-10 border border-gray-200 rounded-lg items-center justify-center bg-[#FDFBF7]">
              <Text className="text-gray-600 text-lg">-</Text>
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-[#0B3B24]">500 Kg</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 border border-gray-200 rounded-lg items-center justify-center bg-[#FDFBF7]">
              <Text className="text-gray-600 text-lg">+</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 text-xs font-bold mb-2">సమీప మార్కెట్ (Mandi Location)</Text>
          <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-2">📍</Text>
              <View>
                <Text className="font-bold text-green-900 text-sm">గుంటూరు మార్కెట్ (Guntur)</Text>
                <Text className="text-green-700 text-xs">Mangalagiri Rd, 12km</Text>
              </View>
            </View>
            <Text className="text-green-600">⌄</Text>
          </View>
        </View>

        {/* Big Results Card */}
        <View className="bg-[#0B3B24] rounded-2xl p-4 mb-4 shadow-md">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-orange-300 text-xs font-bold">₹ అంచనా నికర రాబడి</Text>
            <Text className="text-white text-xs">Top Mandi</Text>
          </View>
          <Text className="text-white font-bold text-xl mb-1">గుంటూరు మార్కెట్ యార్డ్</Text>
          <Text className="text-green-300 text-xs mb-4">Guntur APMC Market (Mangalagiri Rd)</Text>

          <View className="bg-green-900/50 rounded-xl p-4 mb-3 border border-green-800">
            <Text className="text-green-100 text-xs mb-1">అంచనా నికర రాబడి (ESTIMATED NET RETURN)</Text>
            <View className="flex-row items-end">
              <Text className="text-white text-3xl font-bold mr-2">₹15,700</Text>
              <Text className="text-green-300 text-xs mb-1">అన్ని ఖర్చులు పోను</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Text className="text-green-400 mr-2">↗</Text>
            <Text className="text-green-100 text-xs flex-1">నిన్నటి మార్కెట్ కంటే ₹2,000 ఎక్కువ లాభం!</Text>
          </View>
        </View>

        {/* Expense Breakdown */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="font-bold text-gray-800 text-sm mb-4">వివరణాత్మక అంచనా (Price Breakdown)</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Text className="text-gray-400 mr-2">💰</Text>
              <View>
                <Text className="text-gray-800 text-xs font-bold">మార్కెట్ ధర (Gross Revenue)</Text>
                <Text className="text-gray-500 text-[10px]">500kg x ₹35 (Average Price)</Text>
              </View>
            </View>
            <Text className="font-bold text-gray-800 text-sm">₹17,500</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Text className="text-red-400 mr-2">🚚</Text>
              <View>
                <Text className="text-gray-800 text-xs font-bold">రవాణా ఖర్చు (Transport Cost)</Text>
                <Text className="text-gray-500 text-[10px]">12km x ₹150 (Mini Truck)</Text>
              </View>
            </View>
            <Text className="font-bold text-red-600 text-sm">- ₹1,800</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Text className="text-gray-400 mr-2">📦</Text>
              <View>
                <Text className="text-gray-800 text-xs font-bold">ఇతర ఖర్చులు (Handling/Commission)</Text>
                <Text className="text-gray-500 text-[10px]">10% మార్కెట్ కమీషన్</Text>
              </View>
            </View>
            <Text className="font-bold text-red-600 text-sm">- ₹0</Text>
          </View>

          <View className="h-[1px] bg-gray-200 my-2" />

          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-[#0B3B24] text-sm">నికర రాబడి (Net Return)</Text>
            <Text className="font-bold text-[#0B3B24] text-lg">₹15,700</Text>
          </View>
        </View>
        
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-xs">అంచనా రాబడి</Text>
          <Text className="text-[#0B3B24] text-xl font-bold">₹15,700</Text>
        </View>
        <TouchableOpacity className="bg-[#0B3B24] py-3 px-6 rounded-xl flex-row items-center">
          <Text className="text-white font-bold mr-2">మార్కెట్ కు పంపండి</Text>
          <Text className="text-white">→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
