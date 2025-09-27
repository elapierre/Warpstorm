import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  TwoFactor: { sessionToken: string };
};

export default function TwoFactor() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TwoFactor'>>();
  const [pin, setPin] = useState('');

  const handleVerify = async () => {
    try {
      const response = await fetch(
        `https://<your-okta-domain>/api/v1/authn/factors/${route.params.sessionToken}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passCode: pin }),
        }
      );
      const data = await response.json();

      if (data.status === 'SUCCESS') {
        Alert.alert('Login successful', 'You are fully authenticated!');
        // Navigate to Home screen or dashboard
      } else {
        Alert.alert('Verification failed', data.errorSummary || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', '2FA request failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter 2FA PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
});
