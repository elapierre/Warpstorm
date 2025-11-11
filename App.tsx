import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { RootStackParamList } from './src/ui/nav/navTypes';
import Login from './src/ui/screens/login';
import JobQueueScreen from './src/ui/screens/jobQueue';

import { store } from './src/redux/stateStore';
import { setExpoPushToken } from './src/redux/pushNotice/pushTokenSlice';
import { Provider } from 'react-redux';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
 
  useEffect(() => {
    console.log('Start to register for push notifications');
    registerForPushNotificationsAsync();
    
    // Optional: Listen for notifications while app is foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="JobQueue" component={JobQueueScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </Provider>
  );
}

// Push notification registration
async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    console.log('Device check failed: not a physical device');
    Alert.alert('Push notifications require a physical device');
    return;
  }

  console.log('Checking existing notification permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  console.log('Existing permission status:', existingStatus);

  if (existingStatus !== 'granted') {
    console.log('Requesting permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('Requested permission status:', status);
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted.');
    Alert.alert('Failed to get push token!');
    return;
  }

  try {
    console.log('Fetching Expo push token...');
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    token = tokenResponse.data;

    store.dispatch(setExpoPushToken(token));

    console.log('Expo push token obtained:', token);
    // TODO: Save token to backend
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    Alert.alert('Error fetching push token. See console logs.');
  }

  if (Platform.OS === 'android') {
    console.log('Setting Android notification channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
