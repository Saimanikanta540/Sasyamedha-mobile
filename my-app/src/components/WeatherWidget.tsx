import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View, ActivityIndicator } from 'react-native';

const WEATHER_CODES: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: 'Clear sky' },
  1: { icon: '🌤️', label: 'Mainly clear' },
  2: { icon: '⛅', label: 'Partly cloudy' },
  3: { icon: '☁️', label: 'Overcast' },
  45: { icon: '🌫️', label: 'Fog' },
  48: { icon: '🌫️', label: 'Depositing rime fog' },
  51: { icon: '🌧️', label: 'Light drizzle' },
  53: { icon: '🌧️', label: 'Moderate drizzle' },
  55: { icon: '🌧️', label: 'Dense drizzle' },
  61: { icon: '🌦️', label: 'Slight rain' },
  63: { icon: '🌧️', label: 'Moderate rain' },
  65: { icon: '🌧️', label: 'Heavy rain' },
  71: { icon: '🌨️', label: 'Slight snow' },
  73: { icon: '🌨️', label: 'Moderate snow' },
  75: { icon: '❄️', label: 'Heavy snow' },
  95: { icon: '⛈️', label: 'Thunderstorm' },
  96: { icon: '⛈️', label: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️', label: 'Thunderstorm with heavy hail' },
};

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=16.3067&longitude=80.4365&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FKolkata';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

export function WeatherWidget() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', 'guntur'],
    queryFn: fetchWeather,
    refetchInterval: 1000 * 60 * 15, // 15 mins
  });

  if (isLoading) {
    return (
      <View className="mb-4 rounded-3xl bg-white/10 p-4 min-h-[90px] justify-center items-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (error || !data || !data.current) {
    return null; // degrade gracefully
  }

  const temp = Math.round(data.current.temperature_2m);
  const humidity = data.current.relative_humidity_2m;
  const code = data.current.weather_code;
  const weather = WEATHER_CODES[code] || { icon: '🌡️', label: 'Unknown' };

  return (
    <View className="mb-6 rounded-3xl bg-white/15 p-4 flex-row items-center justify-between border border-white/20">
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Text className="text-3xl">{weather.icon}</Text>
        </View>
        <View>
          <Text className="font-sans-bold text-2xl text-white">{temp}°C</Text>
          <Text className="text-xs text-white/80">{weather.label}</Text>
        </View>
      </View>
      <View className="items-end gap-1 border-l border-white/20 pl-4">
        <Text className="text-xs text-white/70">Humidity</Text>
        <Text className="font-sans-bold text-base text-white">{humidity}%</Text>
        <Text className="text-[10px] text-white/60">Guntur, AP</Text>
      </View>
    </View>
  );
}
