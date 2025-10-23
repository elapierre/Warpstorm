import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/UI/Nav/NavTypes';

import Login from './src/UI/Screens/Login';
import JobQueueScreen from './src/UI/Screens/JobQueue';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="JobQueue" component={JobQueueScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}