import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('telugu');
  const [selectedCrops, setSelectedCrops] = useState(['tomato']);

  const toggleCrop = (crop) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Header */}
        <View className="items-center mb-6 mt-4">
          <View className="w-14 h-14 bg-white rounded-full shadow-sm items-center justify-center mb-3">
            <Text className="text-3xl">🌿</Text>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-full mb-2">
            <Text className="text-green-800 text-xs font-semibold">✓ ఆంధ్రప్రదేశ్ వ్యవసాయ వేదిక</Text>
          </View>
          <Text className="text-2xl font-bold text-[#0B3B24]">రైతు మిత్ర</Text>
          <Text className="text-gray-500 text-sm">Smart Crop Care & Direct Market Access</Text>
        </View>

        {/* Voice Banner */}
        <View className="bg-[#F58220] rounded-xl p-4 flex-row items-center justify-between mb-8 shadow-sm">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 bg-black/10 rounded-full items-center justify-center mr-3">
              <Text className="text-white">🎤</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-sm">మీ భాషలో మాట్లాడండి...</Text>
              <Text className="text-white/80 text-xs">Voice-guided setup...</Text>
            </View>
          </View>
          <TouchableOpacity className="bg-[#8A3B00] px-4 py-2 rounded-lg">
            <Text className="text-white text-xs font-bold">▶ ప్రారంభించు</Text>
          </TouchableOpacity>
        </View>

        {/* Step 1: Language */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-[#0B3B24] rounded-full items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <View>
              <Text className="font-bold text-gray-800 text-sm">భాషను ఎంచుకోండి / Select</Text>
              <Text className="font-bold text-gray-800 text-sm">Language</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[#F58220] font-bold text-xs">1 / 2</Text>
            <Text className="text-[#F58220] text-xs">దశలు</Text>
          </View>
        </View>

        {/* Language Options */}
        <View className="space-y-3 mb-8 gap-y-3">
          {/* Telugu */}
          <TouchableOpacity 
            onPress={() => setSelectedLanguage('telugu')}
            className={`p-4 rounded-xl flex-row items-center justify-between ${selectedLanguage === 'telugu' ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
          >
            <View className="flex-row items-center">
              <View className="w-5 h-5 rounded-full border-2 border-white items-center justify-center mr-3">
                {selectedLanguage === 'telugu' && <View className="w-2.5 h-2.5 bg-white rounded-full" />}
              </View>
              <View>
                <Text className={`font-bold text-base ${selectedLanguage === 'telugu' ? 'text-white' : 'text-gray-800'}`}>తెలుగు <Text className={selectedLanguage === 'telugu' ? 'text-white/80 font-normal' : 'text-gray-500 font-normal'}>(Telugu)</Text></Text>
                <Text className={`text-xs mt-0.5 ${selectedLanguage === 'telugu' ? 'text-white/80' : 'text-gray-500'}`}>ఆంధ్రప్రదేశ్ రైతుల కోసం</Text>
              </View>
            </View>
            <TouchableOpacity className={`px-3 py-1.5 rounded-full flex-row items-center ${selectedLanguage === 'telugu' ? 'bg-white/20' : 'bg-gray-100'}`}>
              <Text className={selectedLanguage === 'telugu' ? 'text-white text-xs' : 'text-gray-600 text-xs'}>🔊 వినండి</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* English */}
          <TouchableOpacity 
            onPress={() => setSelectedLanguage('english')}
            className={`p-4 rounded-xl flex-row items-center justify-between ${selectedLanguage === 'english' ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
          >
            <View className="flex-row items-center">
              <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center mr-3" />
              <View>
                <Text className="font-bold text-gray-800 text-base">English <Text className="text-gray-500 font-normal">(ఇంగ్లీష్)</Text></Text>
                <Text className="text-gray-500 text-xs mt-0.5">For all agricultural regions</Text>
              </View>
            </View>
            <TouchableOpacity className="px-3 py-1.5 rounded-full bg-gray-100 flex-row items-center">
              <Text className="text-gray-600 text-xs">🔊 Listen</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Hindi */}
          <TouchableOpacity 
            onPress={() => setSelectedLanguage('hindi')}
            className={`p-4 rounded-xl flex-row items-center justify-between ${selectedLanguage === 'hindi' ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
          >
            <View className="flex-row items-center">
              <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center mr-3" />
              <View>
                <Text className="font-bold text-gray-800 text-base">हिन्दी <Text className="text-gray-500 font-normal">(Hindi)</Text></Text>
                <Text className="text-gray-500 text-xs mt-0.5">किसान भाइयों और बहनों के लिए</Text>
              </View>
            </View>
            <TouchableOpacity className="px-3 py-1.5 rounded-full bg-gray-100 flex-row items-center">
              <Text className="text-gray-600 text-xs">🔊 सुनें</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Step 2: Quick Profile */}
        <View className="flex-row items-center mb-4">
          <View className="w-6 h-6 bg-[#0B3B24] rounded-full items-center justify-center mr-2">
            <Text className="text-white text-xs font-bold">2</Text>
          </View>
          <View>
            <Text className="font-bold text-gray-800 text-sm">రైతు వివరాలు / Quick Profile</Text>
            <Text className="text-gray-500 text-xs">మార్కెట్ & పంట సలహాల కోసం</Text>
          </View>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-gray-700 text-xs font-bold">మీ పేరు / Farmer Name</Text>
            <Text className="text-gray-400 text-xs">ఐచ్ఛికం</Text>
          </View>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-gray-400 mr-2">👤</Text>
              <TextInput 
                className="flex-1 text-gray-800 text-base font-medium"
                value="వెంకటేశ్వరరావు"
                placeholder="Enter Name"
              />
            </View>
            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
              <Text className="text-orange-600">🎤</Text>
            </View>
          </View>
        </View>

        {/* District & State Input */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-gray-700 text-xs font-bold">జిల్లా & రాష్ట్రం / District & State</Text>
            <Text className="text-gray-400 text-xs">AP Mandals</Text>
          </View>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-orange-500 mr-2 text-lg">📍</Text>
              <View>
                <Text className="text-gray-800 font-bold">గుంటూరు (Guntur)</Text>
                <Text className="text-gray-500 text-xs">ఆంధ్రప్రదేశ్ (Andhra Pradesh)</Text>
              </View>
            </View>
            <Text className="text-gray-400">⌄</Text>
          </View>
        </View>

        {/* Crops Grown */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-gray-700 text-xs font-bold">మీరు పండించే పంటలు / Crops Grown</Text>
            <Text className="text-gray-400 text-xs">బహుళ ఎంపిక</Text>
          </View>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {/* Tomato */}
            <TouchableOpacity 
              onPress={() => toggleCrop('tomato')}
              className={`w-[48%] py-2.5 px-3 rounded-xl flex-row items-center justify-between ${selectedCrops.includes('tomato') ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">🍅</Text>
                <View>
                  <Text className={`font-bold text-sm ${selectedCrops.includes('tomato') ? 'text-white' : 'text-gray-800'}`}>టమాటా</Text>
                  <Text className={`text-[10px] ${selectedCrops.includes('tomato') ? 'text-white/70' : 'text-gray-500'}`}>Tomato</Text>
                </View>
              </View>
              <Text className={selectedCrops.includes('tomato') ? 'text-white text-xs' : 'text-gray-400 text-xs'}>{selectedCrops.includes('tomato') ? '✓' : '+'}</Text>
            </TouchableOpacity>

            {/* Chilli */}
            <TouchableOpacity 
              onPress={() => toggleCrop('chilli')}
              className={`w-[48%] py-2.5 px-3 rounded-xl flex-row items-center justify-between ${selectedCrops.includes('chilli') ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">🌶️</Text>
                <View>
                  <Text className={`font-bold text-sm ${selectedCrops.includes('chilli') ? 'text-white' : 'text-gray-800'}`}>మిరప</Text>
                  <Text className={`text-[10px] ${selectedCrops.includes('chilli') ? 'text-white/70' : 'text-gray-500'}`}>Chilli</Text>
                </View>
              </View>
              <Text className={selectedCrops.includes('chilli') ? 'text-white text-xs' : 'text-gray-400 text-xs'}>{selectedCrops.includes('chilli') ? '✓' : '+'}</Text>
            </TouchableOpacity>

            {/* Paddy */}
            <TouchableOpacity 
              onPress={() => toggleCrop('paddy')}
              className={`w-[48%] py-2.5 px-3 rounded-xl flex-row items-center justify-between ${selectedCrops.includes('paddy') ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">🌾</Text>
                <View>
                  <Text className={`font-bold text-sm ${selectedCrops.includes('paddy') ? 'text-white' : 'text-gray-800'}`}>వరి</Text>
                  <Text className={`text-[10px] ${selectedCrops.includes('paddy') ? 'text-white/70' : 'text-gray-500'}`}>Paddy</Text>
                </View>
              </View>
              <Text className={selectedCrops.includes('paddy') ? 'text-white text-xs' : 'text-gray-400 text-xs'}>{selectedCrops.includes('paddy') ? '✓' : '+'}</Text>
            </TouchableOpacity>

            {/* Cotton */}
            <TouchableOpacity 
              onPress={() => toggleCrop('cotton')}
              className={`w-[48%] py-2.5 px-3 rounded-xl flex-row items-center justify-between ${selectedCrops.includes('cotton') ? 'bg-[#0B3B24]' : 'bg-white border border-gray-200'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">🌱</Text>
                <View>
                  <Text className={`font-bold text-sm ${selectedCrops.includes('cotton') ? 'text-white' : 'text-gray-800'}`}>పత్తి</Text>
                  <Text className={`text-[10px] ${selectedCrops.includes('cotton') ? 'text-white/70' : 'text-gray-500'}`}>Cotton</Text>
                </View>
              </View>
              <Text className={selectedCrops.includes('cotton') ? 'text-white text-xs' : 'text-gray-400 text-xs'}>{selectedCrops.includes('cotton') ? '✓' : '+'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Badge */}
        <View className="bg-gray-100 rounded-xl p-3 flex-row items-center mb-6">
          <View className="w-8 h-8 bg-green-200 rounded-full items-center justify-center mr-3">
            <Text className="text-green-800 text-xs">🛡️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-800">రైతు భరోసా గుర్తింపు పొందిన</Text>
            <Text className="text-[10px] text-gray-500">ఉచిత మార్కెట్ ధరల సమాచారం & నిపుణుల సలహాలు</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          className="bg-[#0B3B24] py-4 rounded-xl items-center mb-3 flex-row justify-center"
          onPress={() => router.push('/home')}
        >
          <Text className="text-white font-bold text-base mr-2">ప్రారంభించండి / Get Started</Text>
          <Text className="text-white font-bold">→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-gray-200 py-4 rounded-xl items-center mb-10">
          <Text className="text-gray-700 font-bold text-sm">తరువాత చేయండి / Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
