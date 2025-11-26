import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { runAsync } from '../dataAccess/sqlite/db';
import { PostAsync } from './api'; // you will implement or already have
import { store } from '../redux/stateStore';


/**
 * Collects the current device and app information, saves or updates it in the local SQLite
 * UserDevices table, and optionally sends the data to the backend if a userId is provided.
 * Pulls the push notification token from the Redux store and ensures local and remote records
 * are up-to-date with the latest device info and login timestamp.
 */


export const DeviceSyncService = {
  async sync(userId?: string) {

    if (!userId) {
      console.log("No authenticated user yet — skipping SQLite insert");
      return;
    }

    const deviceId = Constants.deviceId ?? Device.osInternalBuildId ?? "unknown";
    
    // Get push token from Redux store
    const pushToken = store.getState().pushToken?.expoPushToken ?? null;

    const deviceInfo = {
      userId,
      deviceId,
      pushToken,
      deviceName: Device.deviceName ?? null,
      deviceModel: Device.modelName ?? null,
      deviceManufacturer: Device.manufacturer ?? null,
      osName: Device.osName ?? null,
      osVersion: Device.osVersion ?? null,
      appVersion: Constants.expoConfig?.version ?? null,
      lastLoginAt: new Date().toISOString()
    };

    // --- Save / Update SQLite ---
    await runAsync(
      `
      INSERT INTO UserDevices 
      (userId, deviceId, pushToken, deviceName, deviceModel, deviceManufacturer,
       osName, osVersion, appVersion, lastLoginAt, isActive, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(userId, deviceId)
      DO UPDATE SET
        pushToken = excluded.pushToken,
        deviceName = excluded.deviceName,
        deviceModel = excluded.deviceModel,
        deviceManufacturer = excluded.deviceManufacturer,
        osName = excluded.osName,
        osVersion = excluded.osVersion,
        appVersion = excluded.appVersion,
        lastLoginAt = excluded.lastLoginAt,
        isActive = 1,
        updatedAt = CURRENT_TIMESTAMP;
      `,
      [
        deviceInfo.userId,
        deviceInfo.deviceId,
        deviceInfo.pushToken,
        deviceInfo.deviceName,
        deviceInfo.deviceModel,
        deviceInfo.deviceManufacturer,
        deviceInfo.osName,
        deviceInfo.osVersion,
        deviceInfo.appVersion,
        deviceInfo.lastLoginAt,
      ]
    );

    // --- Send full payload to internal DB ---
    await PostAsync("/user/device-metadata", deviceInfo);
  }
};
