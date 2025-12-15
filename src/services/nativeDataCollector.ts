import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import * as Battery from 'expo-battery';
import { Platform } from 'react-native';

export interface NativeDeviceData {
  // Basic Device Info
  deviceId: string;
  deviceName: string | null;
  deviceModel: string | null;
  deviceManufacturer: string | null;
  deviceType: Device.DeviceType | null;
  
  // OS Info
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  platformApiLevel: number | null; // Android only
  
  // App Info
  appVersion: string | null;
  appBuildVersion: string | null;
  appBundleId: string | null;
  expoVersion: string | null;
  
  // Hardware Info
  totalMemory: number | null;
  brand: string | null;
  modelId: string | null;
  designName: string | null;
  productName: string | null;
  
  // Network & Connectivity
  networkState: any;
  isNetworkAvailable: boolean;
  
  // Localization
  locale: string;
  timezone: string;
  isRTL: boolean;
  region: string | null;
  
  // Battery (if available)
  batteryLevel: number | null;
  batteryState: any;
  isLowPowerMode: boolean | null;
  
  // Screen & Display
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  
  // Collection metadata
  collectedAt: string;
  collectionVersion: string;
}

/**
 * Comprehensive native device data collector for Android and iOS
 */
export class NativeDataCollector {
  
  private static readonly COLLECTION_VERSION = '1.0.0';
  
  /**
   * Collects all available native device data
   * Safe for both Android and iOS - handles platform differences
   */
  static async collectDeviceData(): Promise<NativeDeviceData> {
    console.log('Starting comprehensive native data collection...');
    
    const isEmulator = !Device.isDevice;
    console.log(`Device type: ${isEmulator ? 'Emulator/Simulator' : 'Physical Device'}`);
    
    try {
      // Collect data in parallel for better performance
      // Skip battery and network calls on emulators for better reliability
      const [
        networkState,
        batteryLevel,
        batteryState,
        isLowPowerMode
      ] = await Promise.allSettled([
        isEmulator ? Promise.resolve(null) : this.safeNetworkCall(() => Network.getNetworkStateAsync()),
        isEmulator ? Promise.resolve(null) : this.safeBatteryCall(() => Battery.getBatteryLevelAsync()),
        isEmulator ? Promise.resolve(null) : this.safeBatteryCall(() => Battery.getBatteryStateAsync()),
        isEmulator ? Promise.resolve(null) : this.safeBatteryCall(() => Battery.isLowPowerModeEnabledAsync())
      ]) as [
        PromiseSettledResult<Network.NetworkState | null>,
        PromiseSettledResult<number | null>,
        PromiseSettledResult<Battery.BatteryState | null>,
        PromiseSettledResult<boolean | null>
      ];

      const deviceData: NativeDeviceData = {
        // Basic Device Info
        deviceId: Constants.deviceId ?? Device.osInternalBuildId ?? 'unknown',
        deviceName: Device.deviceName,
        deviceModel: Device.modelName,
        deviceManufacturer: Device.manufacturer,
        deviceType: Device.deviceType,
        
        // OS Info
        osName: Device.osName,
        osVersion: Device.osVersion,
        osBuildId: Device.osInternalBuildId,
        platformApiLevel: Platform.OS === 'android' ? Device.platformApiLevel : null,
        
        // App Info
        appVersion: Constants.expoConfig?.version ?? Application.nativeApplicationVersion,
        appBuildVersion: Application.nativeBuildVersion ?? (typeof Constants.expoConfig?.runtimeVersion === 'string' ? Constants.expoConfig.runtimeVersion : null),
        appBundleId: Application.applicationId,
        expoVersion: Constants.expoVersion,
        
        // Hardware Info
        brand: Device.brand,
        modelId: Device.modelId,
        designName: Device.designName,
        productName: Device.productName,
        totalMemory: Device.totalMemory,
        
        // Network & Connectivity
        networkState: isEmulator ? { isConnected: true, type: 'unknown' } : this.getSettledValue(networkState),
        isNetworkAvailable: isEmulator ? true : (this.getSettledValue(networkState)?.isConnected ?? false),
        
        // Localization
        locale: Localization.getLocales()[0]?.languageTag ?? 'en-US',
        timezone: Localization.getCalendars()[0]?.timeZone ?? 'UTC',
        isRTL: Localization.getLocales()[0]?.textDirection === 'rtl',
        region: Localization.getLocales()[0]?.regionCode ?? null,
        
        // Battery (if available) - null for emulators
        batteryLevel: isEmulator ? null : this.getSettledValue(batteryLevel),
        batteryState: isEmulator ? null : this.getSettledValue(batteryState),
        isLowPowerMode: isEmulator ? null : this.getSettledValue(isLowPowerMode),
        
        // Screen & Display
        screenWidth: Constants.screenWidth ?? 0,
        screenHeight: Constants.screenHeight ?? 0,
        pixelRatio: Constants.devicePixelRatio ?? 1,
        
        // Collection metadata
        collectedAt: new Date().toISOString(),
        collectionVersion: this.COLLECTION_VERSION
      };

      console.log(`Native data collection completed successfully (${isEmulator ? 'emulator mode' : 'physical device'})`);
      return deviceData;
      
    } catch (error) {
      console.error('Error during native data collection:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to collect native device data: ${errorMessage}`);
    }
  }

  /**
   * Collects only essential device data (faster, more reliable)
   */
  static async collectEssentialDeviceData(): Promise<Partial<NativeDeviceData>> {
    return {
      deviceId: Constants.deviceId ?? Device.osInternalBuildId ?? 'unknown',
      deviceName: Device.deviceName,
      deviceModel: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      appVersion: Constants.expoConfig?.version,
      locale: Localization.getLocales()[0]?.languageTag ?? 'en-US',
      collectedAt: new Date().toISOString(),
      collectionVersion: this.COLLECTION_VERSION
    };
  }

  /**
   * Platform-specific data collection
   */
  static async collectPlatformSpecificData(): Promise<Record<string, any>> {
    const platformData: Record<string, any> = {
      platform: Platform.OS
    };

    if (Platform.OS === 'android') {
      platformData.androidApiLevel = Device.platformApiLevel;
      platformData.androidId = Constants.deviceId;
    } else if (Platform.OS === 'ios') {
      platformData.iosVersion = Device.osVersion;
      platformData.iosModel = Device.modelId;
    }

    return platformData;
  }

  /**
   * Safe wrapper for network API calls
   */
  private static async safeNetworkCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('Network API call failed:', error);
      return null;
    }
  }

  /**
   * Safe wrapper for battery API calls
   */
  private static async safeBatteryCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('Battery API call failed:', error);
      return null;
    }
  }

  /**
   * Extract value from Promise.allSettled result
   */
  private static getSettledValue<T>(result: PromiseSettledResult<T>): T | null {
    return result.status === 'fulfilled' ? result.value : null;
  }
}