import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../nav/navTypes';

import { useSelector } from 'react-redux';
import { RootState } from '../../redux/stateStore';


// Type the navigation prop
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const pushToken = useSelector(
  (state: RootState) => state.pushToken?.expoPushToken ?? 'No token yet'
);

const logo: ImageSourcePropType = require('../../../assets/HolmanBlueSquareLogo.png');

 const goToJobQueue = () => {
    navigation.navigate('JobQueue');
  };

  const handleLogin = async () => {
     try {
       // Example Okta authentication request
       const response = await fetch('https://<your-okta-domain>/api/v1/authn', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: email, password }),
       });
       const data = await response.json();

       if (data.status === 'MFA_REQUIRED') {
         // Navigate to 2FA screen with session token
         navigation.navigate('TwoFactor', { sessionToken: data.sessionToken });
       } else if (data.status === 'SUCCESS') {
         Alert.alert('Login successful', 'You are authenticated without 2FA.');
       } else {
         Alert.alert('Login failed', data.errorSummary || 'Unknown error');
       }
     } catch (err) {
       console.error(err);
       Alert.alert('Error', 'Login request failed');
     }
  };

  return (
    <View style={styles.container}>

      {/* Logo at top center */}
    <Image source={logo} style={styles.logo} />

      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={{ fontSize: 14 }}>
        {pushToken ? `Expo Push Token: ${pushToken}` : 'Fetching push token...'}
      </Text>

       <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.button} onPress={goToJobQueue}>
        <Text style={styles.buttonText}>Go to JobQueue</Text>
      </TouchableOpacity>

    </View>

    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15, width: '80%' },
 button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width:'60%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 200, // space between logo and title
  }
});
