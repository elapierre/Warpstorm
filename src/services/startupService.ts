// startupService.ts
import { initDB } from '../dataAccess/sqlite/db';
import { DeviceSyncService } from './deviceSyncService';

export const startupService = {
  /** Called on app startup, before the user logs in */
  async init() {

    // Initialize SQLite database and tables
    await initDB();

    // Save device info locally immediately
    // userId is null since the user may not be authenticated yet
    await DeviceSyncService.sync();
  },

  /** Called when a user logs in */
  async onUserLogin(userId: string) {
    // Now that the user is authenticated, sync device info to backend
    await DeviceSyncService.sync(userId);
  },
};
