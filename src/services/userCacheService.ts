import { runAsync, getAllAsync, insertOrReplace } from '../dataAccess/sqlite/db';
import { NativeDataCollector, NativeDeviceData } from './nativeDataCollector';
import { PostAsync, GetAsync } from './api';

export interface UserCacheEntry {
  id?: number;
  userId: string;
  cacheType: string;
  dataKey: string;
  dataValue?: string;
  jsonData?: string;
  lastFetchedAt?: string;
  expiresAt?: string;
  synced: number;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  role?: string;
  permissions?: string[];
  preferences?: Record<string, any>;
}

export interface CacheOptions {
  ttlMinutes?: number; // Time to live in minutes
  forceRefresh?: boolean;
  syncToServer?: boolean;
}

/**
 * Comprehensive user cache service that handles:
 * - Native device data collection and caching
 * - User profile data caching  
 * - Automatic sync to internal database
 * - Cache expiration and refresh logic
 */
export class UserCacheService {
  
  private static readonly DEFAULT_TTL_MINUTES = 60; // 1 hour default cache
  private static readonly DEVICE_DATA_TTL_MINUTES = 1440; // 24 hours for device data
  
  /**
   * Initialize user cache after successful authentication
   * This is the main entry point called after login
   */
  static async initializeUserCache(userId: string, pushToken?: string): Promise<void> {
    console.log(`Initializing user cache for user: ${userId}`);
    
    try {
      // Cache push token if provided
      if (pushToken) {
        await this.cachePushToken(userId, pushToken);
      }
      
      // Collect and cache native device data
      await this.cacheNativeDeviceData(userId);
      
      // Fetch and cache user profile data
      await this.cacheUserProfile(userId);
      
      // Sync all cached data to server
      await this.syncCacheToServer(userId);
      
      console.log(`User cache initialization completed for user: ${userId}`);
      
    } catch (error) {
      console.error('Failed to initialize user cache:', error);
      throw error;
    }
  }
  
  /**
   * Collect native device data and store in cache
   */
  static async cacheNativeDeviceData(
    userId: string, 
    options: CacheOptions = {}
  ): Promise<NativeDeviceData> {
    
    const { ttlMinutes = this.DEVICE_DATA_TTL_MINUTES, forceRefresh = false } = options;
    const cacheKey = 'native_device_data';
    
    // Check if we have valid cached data (unless force refresh)
    if (!forceRefresh) {
      const cached = await this.getCachedData<NativeDeviceData>(userId, 'device_info', cacheKey);
      if (cached) {
        console.log('Using cached native device data');
        return cached;
      }
    }
    
    console.log('Collecting fresh native device data...');
    
    // Collect fresh device data
    const deviceData = await NativeDataCollector.collectDeviceData();
    
    // Cache the device data
    await this.setCachedData(
      userId, 
      'device_info', 
      cacheKey, 
      deviceData, 
      ttlMinutes
    );
    
    console.log('Native device data cached successfully');
    return deviceData;
  }
  
  /**
   * Fetch user profile from server and cache it
   */
  static async cacheUserProfile(
    userId: string, 
    options: CacheOptions = {}
  ): Promise<UserProfile> {
    
    const { ttlMinutes = this.DEFAULT_TTL_MINUTES, forceRefresh = false } = options;
    const cacheKey = 'profile';
    
    // Check cached data first
    if (!forceRefresh) {
      const cached = await this.getCachedData<UserProfile>(userId, 'user_profile', cacheKey);
      if (cached) {
        console.log('Using cached user profile data');
        return cached;
      }
    }
    
    console.log('Fetching fresh user profile data...');
    
    try {
      // Fetch user profile from your API
      const userProfile = await GetAsync<UserProfile>(`/users/${userId}/profile`);
      
      // Cache the profile data
      await this.setCachedData(
        userId, 
        'user_profile', 
        cacheKey, 
        userProfile, 
        ttlMinutes
      );
      
      console.log('User profile cached successfully');
      return userProfile;
      
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      
      // Try to return stale cached data as fallback
      const staleData = await this.getCachedData<UserProfile>(
        userId, 
        'user_profile', 
        cacheKey, 
        true // Allow expired data
      );
      
      if (staleData) {
        console.log('Using stale cached user profile as fallback');
        return staleData;
      }
      
      throw error;
    }
  }
  
  /**
   * Cache user preferences
   */
  static async cacheUserPreferences(
    userId: string, 
    preferences: Record<string, any>,
    options: CacheOptions = {}
  ): Promise<void> {
    
    const { ttlMinutes = this.DEFAULT_TTL_MINUTES } = options;
    
    await this.setCachedData(
      userId, 
      'user_preferences', 
      'preferences', 
      preferences, 
      ttlMinutes
    );
  }
  
  /**
   * Cache device push token
   */
  static async cachePushToken(
    userId: string, 
    pushToken: string,
    options: CacheOptions = {}
  ): Promise<void> {
    
    const { ttlMinutes = this.DEVICE_DATA_TTL_MINUTES } = options; // Use device data TTL
    
    await this.setCachedData(
      userId, 
      'device_info', 
      'push_token', 
      pushToken, 
      ttlMinutes
    );
    
    console.log(`Push token cached for user: ${userId}`);
  }
  
  /**
   * Get cached push token
   */
  static async getCachedPushToken(userId: string): Promise<string | null> {
    return await this.getCachedData<string>(userId, 'device_info', 'push_token');
  }
  
  /**
   * Update push token (when it changes)
   */
  static async updatePushToken(
    userId: string, 
    newPushToken: string
  ): Promise<void> {
    
    // Cache the new token
    await this.cachePushToken(userId, newPushToken);
    
    // Immediately sync to server since push tokens are critical
    await this.syncPushTokenToServer(userId, newPushToken);
  }
  
  /**
   * Sync push token immediately to server
   */
  static async syncPushTokenToServer(
    userId: string, 
    pushToken: string
  ): Promise<void> {
    
    try {
      const payload = {
        userId,
        pushToken,
        updatedAt: new Date().toISOString()
      };
      
      await PostAsync('/users/push-token', payload);
      
      // Mark as synced in cache
      await runAsync(
        'UPDATE UserCache SET synced = 1, syncedAt = ? WHERE userId = ? AND cacheType = ? AND dataKey = ?',
        [new Date().toISOString(), userId, 'device_info', 'push_token']
      );
      
      console.log(`Push token synced to server for user: ${userId}`);
      
    } catch (error) {
      console.error('Failed to sync push token to server:', error);
      // Don't throw - token is cached locally and will sync later
    }
  }
  
  /**
   * Get cached data by type and key
   */
  static async getCachedData<T>(
    userId: string, 
    cacheType: string, 
    dataKey: string,
    allowExpired: boolean = false
  ): Promise<T | null> {
    
    try {
      const now = new Date().toISOString();
      const whereClause = allowExpired 
        ? 'WHERE userId = ? AND cacheType = ? AND dataKey = ?'
        : 'WHERE userId = ? AND cacheType = ? AND dataKey = ? AND (expiresAt IS NULL OR expiresAt > ?)';
        
      const params = allowExpired 
        ? [userId, cacheType, dataKey]
        : [userId, cacheType, dataKey, now];
      
      const results = await getAllAsync<UserCacheEntry>(
        `SELECT * FROM UserCache ${whereClause} ORDER BY updatedAt DESC LIMIT 1`,
        params
      );
      
      if (results.length === 0) {
        return null;
      }
      
      const entry = results[0];
      
      // Parse JSON data if available
      if (entry.jsonData) {
        return JSON.parse(entry.jsonData) as T;
      }
      
      // Return simple string value
      return entry.dataValue as unknown as T;
      
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  }
  
  /**
   * Set data in cache with optional TTL
   */
  static async setCachedData<T>(
    userId: string, 
    cacheType: string, 
    dataKey: string, 
    data: T,
    ttlMinutes?: number
  ): Promise<void> {
    
    try {
      const now = new Date();
      const expiresAt = ttlMinutes 
        ? new Date(now.getTime() + ttlMinutes * 60000).toISOString()
        : null;
      
      const isObject = typeof data === 'object' && data !== null;
      
      await insertOrReplace(
        'UserCache',
        [
          'userId', 'cacheType', 'dataKey', 'dataValue', 'jsonData', 
          'lastFetchedAt', 'expiresAt', 'synced', 'updatedAt'
        ],
        [
          userId,
          cacheType,
          dataKey,
          isObject ? null : String(data),
          isObject ? JSON.stringify(data) : null,
          now.toISOString(),
          expiresAt,
          0, // Not synced yet
          now.toISOString()
        ]
      );
      
      console.log(`Cached data: ${cacheType}.${dataKey} for user ${userId}`);
      
    } catch (error) {
      console.error('Error caching data:', error);
      throw error;
    }
  }
  
  /**
   * Sync all unsynced cache data to server
   */
  static async syncCacheToServer(userId: string): Promise<void> {
    console.log(`Syncing cache data to server for user: ${userId}`);
    
    try {
      // Get all unsynced cache entries for this user
      const unsyncedEntries = await getAllAsync<UserCacheEntry>(
        'SELECT * FROM UserCache WHERE userId = ? AND synced = 0',
        [userId]
      );
      
      if (unsyncedEntries.length === 0) {
        console.log('No unsynced cache data found');
        return;
      }
      
      // Prepare payload for server
      const syncPayload = {
        userId,
        cacheEntries: unsyncedEntries.map(entry => ({
          cacheType: entry.cacheType,
          dataKey: entry.dataKey,
          data: entry.jsonData ? JSON.parse(entry.jsonData) : entry.dataValue,
          lastFetchedAt: entry.lastFetchedAt,
          collectionVersion: entry.cacheType === 'device_info' ? 
            JSON.parse(entry.jsonData || '{}').collectionVersion : undefined
        })),
        syncTimestamp: new Date().toISOString()
      };
      
      // Send to your internal database
      await PostAsync('/users/cache-sync', syncPayload);
      
      // Mark all entries as synced
      await runAsync(
        'UPDATE UserCache SET synced = 1, syncedAt = ? WHERE userId = ? AND synced = 0',
        [new Date().toISOString(), userId]
      );
      
      console.log(`Successfully synced ${unsyncedEntries.length} cache entries to server`);
      
    } catch (error) {
      console.error('Failed to sync cache to server:', error);
      // Don't throw - allow app to continue even if sync fails
    }
  }
  
  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await runAsync(
        'DELETE FROM UserCache WHERE expiresAt IS NOT NULL AND expiresAt < ?',
        [now]
      );
      console.log('Expired cache entries cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
  
  /**
   * Clear all cache for a specific user
   */
  static async clearUserCache(userId: string): Promise<void> {
    try {
      await runAsync('DELETE FROM UserCache WHERE userId = ?', [userId]);
      console.log(`Cleared all cache for user: ${userId}`);
    } catch (error) {
      console.error('Error clearing user cache:', error);
    }
  }
  
  /**
   * Get cache statistics for debugging
   */
  static async getCacheStats(userId?: string): Promise<any> {
    try {
      const whereClause = userId ? 'WHERE userId = ?' : '';
      const params = userId ? [userId] : [];
      
      const results = await getAllAsync(
        `SELECT 
          cacheType,
          COUNT(*) as entryCount,
          SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as syncedCount,
          SUM(CASE WHEN expiresAt IS NULL OR expiresAt > datetime('now') THEN 1 ELSE 0 END) as validCount
         FROM UserCache ${whereClause}
         GROUP BY cacheType`,
        params
      );
      
      return results;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return [];
    }
  }
}