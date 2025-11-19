
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('app.db');

export const initDB = async () => {
  // UserData table - User profile and session information
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS UserData (
      userId TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      displayName TEXT,
      preferences TEXT,
      lastLoginAt DATETIME,
      lastSyncedAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // UserDevices table - Multi-device push notification support
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS UserDevices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      deviceId TEXT NOT NULL,
      pushToken TEXT,
      deviceName TEXT,
      deviceModel TEXT,
      deviceManufacturer TEXT,
      osName TEXT,
      osVersion TEXT,
      appVersion TEXT,
      lastLoginAt DATETIME,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(userId, deviceId)
    );
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_devices_user
      ON UserDevices(userId, isActive);
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_devices_token
      ON UserDevices(pushToken);
  `);
  
  // TimeclockRecords table - Clock in/out events
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS TimeclockRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serverId TEXT,
      userId TEXT NOT NULL,
      jobOrderId TEXT NOT NULL,
      clockInTime DATETIME NOT NULL,
      clockOutTime DATETIME,
      notes TEXT,
      synced INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_timeclock_synced
      ON TimeclockRecords(synced);
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_timeclock_user
      ON TimeclockRecords(userId, clockInTime);
  `);
  
  // OrderData table - Job/Order information
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS OrderData (
      salesOrderId TEXT PRIMARY KEY NOT NULL,
      customerName TEXT NOT NULL,
      orderStatus TEXT NOT NULL,
      scheduledDate DATETIME,
      requiredDate DATETIME,
      customerPONumber TEXT,
      vehicleId TEXT,
      vin TEXT,
      fleetUnitNumber TEXT,
      shipToName TEXT,
      shipToAddress1 TEXT,
      shipToAddress2 TEXT,
      shipToCity TEXT,
      shipToState TEXT,
      shipToPostalCode TEXT,
      orderContactName TEXT,
      orderPhoneNumber TEXT,
      hubLocation TEXT,
      readyToShipDate DATETIME,
      estimatedShipDate DATETIME,
      actualShipDate DATETIME,
      deliveredDate DATETIME,
      isHotJob INTEGER DEFAULT 0,
      platesReceivedDate DATETIME,
      licensingCompDate DATETIME,
      details TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_order_status
      ON OrderData(orderStatus, scheduledDate);
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_order_hot_jobs
      ON OrderData(isHotJob, readyToShipDate);
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_order_delivery
      ON OrderData(deliveredDate);
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_order_required
      ON OrderData(requiredDate);
  `);
  
  // OfflineRequests table - Sync queue for pending operations
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS OfflineRequests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestType TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retryCount INTEGER NOT NULL DEFAULT 0,
      errorMessage TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_offline_requests_status
      ON OfflineRequests(status, retryCount);
  `);
};

export const persistItemToDB = async (item: any) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO items (id, name, synced, updatedAt) VALUES (?, ?, ?, ?)`,
    [item.id, item.name, item.synced, item.updatedAt]
  );
};

export const loadItemsFromDB = async (): Promise<any[]> => {
  return await db.getAllAsync<any>(`SELECT * FROM items`);
};

export const markItemSynced = async (id: string) => {
  await db.runAsync(`UPDATE items SET synced = 1 WHERE id = ?`, [id]);
};
