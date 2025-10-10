import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../chat/ChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Soru & Cevap',
      }}
    >
      <Stack.Screen name="FAQChat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
