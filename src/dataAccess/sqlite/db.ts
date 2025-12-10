
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('warpstorm.db');

// ---------------------
// DB Initialization
// ---------------------
export const initDB = async () => {

  console.log("Initializing SQLite database...");

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
  
  // UserCache table - Comprehensive user data cache
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS UserCache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      cacheType TEXT NOT NULL, -- 'device_info', 'user_profile', 'preferences', etc.
      dataKey TEXT NOT NULL,
      dataValue TEXT,
      jsonData TEXT, -- For complex objects
      lastFetchedAt DATETIME,
      expiresAt DATETIME,
      synced INTEGER NOT NULL DEFAULT 0,
      syncedAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, cacheType, dataKey)
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_cache_user_type
      ON UserCache(userId, cacheType);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_cache_sync
      ON UserCache(synced, syncedAt);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_cache_expires
      ON UserCache(expiresAt);
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

  // add other tables/indices as needed...
};

// ---------------------
// Generic DB Helpers
// ---------------------
export const runAsync = async (sql: string, params: any[] = []): Promise<void> => {
  try {
    await db.runAsync(sql, params);
  } catch (err) {
    console.error('DB execution error:', err);
    throw err;
  }
};

export const getAllAsync = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  try {
    const result = await db.getAllAsync<T>(sql, params);
    return result;
  } catch (err) {
    console.error('DB query error:', err);
    throw err;
  }
};

export const insertOrReplace = async (table: string, columns: string[], values: any[]) => {
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  try {
    await db.runAsync(sql, values);
  } catch (error) {
    console.error('DB insertOrReplace error:', error);
    throw error;
  }
};

//WRITE TO THE OFFLINE REQUESTS TABLE
export const persistOfflineRequest = async (request: {
  id?: number; // optional if you want SQLite to autoincrement
  requestType: string;
  payload: string;
  status?: string;
  retryCount?: number;
  errorMessage?: string | null;
}) => {
  await insertOrReplace(
    'OfflineRequests',
    ['id', 'requestType', 'payload', 'status', 'retryCount', 'errorMessage', 'updatedAt'],
    [
      request.id ?? null,                 // id can be null for autoincrement
      request.requestType,
      request.payload,
      request.status ?? 'pending',
      request.retryCount ?? 0,
      request.errorMessage ?? null,
      new Date().toISOString(),           // updatedAt timestamp
    ]
  );
};


export const loadItemsFromDB = async (): Promise<any[]> => {
  return await getAllAsync<any>('SELECT * FROM OfflineRequests');
};

export const markItemSynced = async (id: string) => {
  await runAsync('UPDATE OfflineRequests SET synced = 1 WHERE id = ?', [id]);
};
