import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export function PriceChartWidget({ modalPrice }: { modalPrice: number }) {
  // Generate a mock realistic trend based on the current modal price
  const base = modalPrice;
  const data = [
    base - 40,
    base - 20,
    base + 10,
    base - 10,
    base + 30,
    base + 20,
    base,
  ];

  const screenWidth = Dimensions.get('window').width - 32;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // brand green
    strokeWidth: 2, 
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#10B981',
    },
  };

  return (
    <View className="mt-6">
      <Text className="text-base font-sans-bold text-ink-primary mb-2">7-Day Price Trend</Text>
      <View className="rounded-2xl border border-border bg-surface p-4 items-center">
        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
            datasets: [
              {
                data,
              },
            ],
          }}
          width={screenWidth - 32}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>
    </View>
  );
}
