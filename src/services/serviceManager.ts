// serviceManager.ts
import { initDB } from '../dataAccess/sqlite/db';
import { UserCacheService } from './userCacheService';
import { DeviceSyncService } from './deviceSyncService';
import { store } from '../redux/stateStore';

/**
 * Central service orchestrator that manages all application services
 * and coordinates their lifecycle events
 */
export const serviceManager = {
  private: {
    initialized: false,
    currentUserId: null as string | null,
  },

  /** 
   * Initialize all application services in proper order
   * Called once during app startup
   */
  async initialize(): Promise<void> {
    if (this.private.initialized) {
      console.log('ServiceManager already initialized');
      return;
    }

    console.log('Initializing application services...');

    try {
      // Core database initialization
      await initDB();
      console.log('✓ Database initialized');

      // Clear expired cache entries from previous sessions
      await UserCacheService.clearExpiredCache();
      console.log('✓ Expired cache cleared');

      // Initialize device sync service
      await DeviceSyncService.sync(); // Sync basic device info without user
      console.log('✓ Device sync service initialized');

      // TODO: Add future services here
      // await staticDataService.initialize();
      // await locationService.initialize();

      this.private.initialized = true;
      console.log('🚀 All services initialized successfully');

    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw new Error(`ServiceManager initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /** 
   * Handle user login across all services
   * Coordinates user-specific initialization
   */
  async onUserLogin(userId: string): Promise<void> {
    console.log(`🔐 User login detected: ${userId}`);
    this.private.currentUserId = userId;

    try {
      // Get push token from Redux store
      const pushToken = store.getState().pushToken?.expoPushToken ?? null;
      
      // Initialize comprehensive user cache
      await UserCacheService.initializeUserCache(userId, pushToken || undefined);
      console.log('✓ User cache initialized');

      // Sync device info with user context
      await DeviceSyncService.sync(userId);
      console.log('✓ Device sync completed for user');

      // TODO: Initialize other user-specific services
      // await locationService.startUserTracking(userId);
      // await notificationService.subscribeToUserChannels(userId);
      console.log('🎉 User login services initialized successfully');

    } catch (error) {
      console.error('❌ User login service initialization failed:', error);
      // Don't throw - allow user to continue even if some services fail
    }
  },

  /** 
   * Handle user logout across all services
   */
  async onUserLogout(): Promise<void> {
    const userId = this.private.currentUserId;
    console.log(`🔓 User logout detected: ${userId}`);

    try {
      if (userId) {
        // Sync any pending data before logout
        await UserCacheService.syncCacheToServer(userId);
        console.log('✓ Final cache sync completed');
      }

      // TODO: Cleanup user-specific services
      // await locationService.stopUserTracking();
      // await notificationService.unsubscribeFromUserChannels();

      this.private.currentUserId = null;
      console.log('✓ User logout cleanup completed');

    } catch (error) {
      console.error('❌ User logout cleanup failed:', error);
    }
  },

  /** 
   * Handle push token updates
   */
  async onPushTokenUpdate(pushToken: string, userId?: string): Promise<void> {
    const targetUserId = userId || this.private.currentUserId;
    
    if (targetUserId) {
      // User is logged in, update their cached token immediately
      await UserCacheService.updatePushToken(targetUserId, pushToken);
      console.log('✓ Push token updated for logged-in user');
    } else {
      // Try to get userId from auth state if user is already logged in
      try {
        const { getToken } = await import('./auth/tokenManager');
        const token = await getToken();
        
        if (token) {
          console.log('Push token received but no userId provided - will cache during next login');
        } else {
          console.log('Push token received before login - will cache when user authenticates');
        }
      } catch (error) {
        console.log('Push token received before authentication');
      }
    }
    // Token is already in Redux store and will be cached during next initializeUserCache
  },

  /**
   * Handle app going to background
   */
  async onAppBackground(): Promise<void> {
    console.log('📱 App backgrounded - performing cleanup');
    
    try {
      // Sync any pending data
      if (this.private.currentUserId) {
        await UserCacheService.syncCacheToServer(this.private.currentUserId);
      }

      // TODO: Pause location tracking, etc.
      console.log('✓ Background cleanup completed');
    } catch (error) {
      console.error('❌ Background cleanup failed:', error);
    }
  },

  /**
   * Handle app coming to foreground
   */
  async onAppForeground(): Promise<void> {
    console.log('📱 App foregrounded - refreshing services');
    
    try {
      // Clear any expired cache
      await UserCacheService.clearExpiredCache();

      // TODO: Resume location tracking, refresh static data, etc.
      console.log('✓ Foreground refresh completed');
    } catch (error) {
      console.error('❌ Foreground refresh failed:', error);
    }
  },

  /**
   * Get current service status for debugging
   */
  getStatus() {
    return {
      initialized: this.private.initialized,
      currentUserId: this.private.currentUserId,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Shutdown all services (app termination)
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down services...');

    try {
      if (this.private.currentUserId) {
        await UserCacheService.syncCacheToServer(this.private.currentUserId);
      }
      
      await UserCacheService.clearExpiredCache();
      
      this.private.initialized = false;
      this.private.currentUserId = null;
      
      console.log('✓ Services shutdown completed');
    } catch (error) {
      console.error('❌ Service shutdown failed:', error);
    }
  }
};
