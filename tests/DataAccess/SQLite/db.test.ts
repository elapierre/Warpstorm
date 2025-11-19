/**
 * Test for database initialization
 * Uses better-sqlite3 to create real database and verify schema
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let testDb: Database.Database;
let testDbPath: string;

// Mock expo-sqlite to use better-sqlite3
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => {
    return {
      execAsync: async (sql: string) => {
        if (testDb) {
          testDb.exec(sql);
        }
      },
    };
  }),
}));

// Import after mocking
import { initDB } from '../../../src/dataAccess/sqlite/db';

describe('Database Initialization', () => {
  beforeEach(() => {
    // Create a unique database for each test
    testDbPath = path.join(os.tmpdir(), `test-${Date.now()}-${Math.random()}.db`);
    testDb = new Database(testDbPath);
  });

  afterEach(() => {
    // Close and clean up test database
    if (testDb) {
      try {
        testDb.close();
      } catch (e) {
        // Database might already be closed
      }
    }
    if (testDbPath && fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (e) {
        // File might be locked, that's okay
      }
    }
  });

  it('should create UserData table with correct schema', async () => {
    await initDB();
    
    // Query the actual schema
    const tableInfo = testDb.prepare("PRAGMA table_info(UserData)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    expect(columnNames).toContain('userId');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('displayName');
    expect(columnNames).toContain('preferences');
    
    // Verify userId is PRIMARY KEY
    const userIdCol = tableInfo.find(col => col.name === 'userId');
    expect(userIdCol.pk).toBe(1);
  });

  it('should create UserDevices table with all fields and UNIQUE constraint', async () => {
    await initDB();
    
    // Query the actual schema
    const tableInfo = testDb.prepare("PRAGMA table_info(UserDevices)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    // Verify all columns exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('userId');
    expect(columnNames).toContain('deviceId');
    expect(columnNames).toContain('pushToken');
    expect(columnNames).toContain('deviceName');
    expect(columnNames).toContain('deviceModel');
    expect(columnNames).toContain('deviceManufacturer');
    expect(columnNames).toContain('osName');
    expect(columnNames).toContain('osVersion');
    expect(columnNames).toContain('appVersion');
    expect(columnNames).toContain('lastLoginAt');
    expect(columnNames).toContain('createdAt');
    expect(columnNames).toContain('isActive');
    
    // Verify id is PRIMARY KEY
    const idCol = tableInfo.find(col => col.name === 'id');
    expect(idCol.pk).toBe(1);
    
    // Verify UNIQUE constraint exists
    const indexes = testDb.prepare("PRAGMA index_list(UserDevices)").all() as any[];
    const uniqueIndex = indexes.find(idx => idx.unique === 1);
    expect(uniqueIndex).toBeDefined();
  });

  it('should create TimeclockRecords table with correct schema', async () => {
    await initDB();
    
    const tableInfo = testDb.prepare("PRAGMA table_info(TimeclockRecords)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('serverId');
    expect(columnNames).toContain('userId');
    expect(columnNames).toContain('jobOrderId');
    expect(columnNames).toContain('clockInTime');
    expect(columnNames).toContain('clockOutTime');
    expect(columnNames).toContain('synced');
  });

  it('should create OrderData table with correct schema', async () => {
    await initDB();
    
    const tableInfo = testDb.prepare("PRAGMA table_info(OrderData)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    expect(columnNames).toContain('salesOrderId');
    expect(columnNames).toContain('customerName');
    expect(columnNames).toContain('orderStatus');
    expect(columnNames).toContain('vehicleId');
    expect(columnNames).toContain('vin');
    expect(columnNames).toContain('isHotJob');
    expect(columnNames).toContain('scheduledDate');
    expect(columnNames).toContain('requiredDate');
    
    // Verify salesOrderId is PRIMARY KEY
    const salesOrderIdCol = tableInfo.find(col => col.name === 'salesOrderId');
    expect(salesOrderIdCol.pk).toBe(1);
  });

  it('should create OfflineRequests table with correct schema', async () => {
    await initDB();
    
    const tableInfo = testDb.prepare("PRAGMA table_info(OfflineRequests)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('requestType');
    expect(columnNames).toContain('payload');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('retryCount');
    expect(columnNames).toContain('errorMessage');
    
    // Verify id is PRIMARY KEY
    const idCol = tableInfo.find(col => col.name === 'id');
    expect(idCol.pk).toBe(1);
  });

  it('should create all required indexes', async () => {
    await initDB();
    
    // Check UserDevices indexes
    const userDevicesIndexes = testDb.prepare("PRAGMA index_list(UserDevices)").all() as any[];
    expect(userDevicesIndexes.some(idx => idx.name === 'idx_user_devices_user')).toBe(true);
    expect(userDevicesIndexes.some(idx => idx.name === 'idx_user_devices_token')).toBe(true);
    
    // Check TimeclockRecords indexes
    const timeclockIndexes = testDb.prepare("PRAGMA index_list(TimeclockRecords)").all() as any[];
    expect(timeclockIndexes.some(idx => idx.name === 'idx_timeclock_user')).toBe(true);
    expect(timeclockIndexes.some(idx => idx.name === 'idx_timeclock_synced')).toBe(true);
    
    // Check OrderData indexes
    const orderDataIndexes = testDb.prepare("PRAGMA index_list(OrderData)").all() as any[];
    expect(orderDataIndexes.some(idx => idx.name === 'idx_order_status')).toBe(true);
    expect(orderDataIndexes.some(idx => idx.name === 'idx_order_hot_jobs')).toBe(true);
    expect(orderDataIndexes.some(idx => idx.name === 'idx_order_delivery')).toBe(true);
    expect(orderDataIndexes.some(idx => idx.name === 'idx_order_required')).toBe(true);
    
    // Check OfflineRequests index
    const offlineIndexes = testDb.prepare("PRAGMA index_list(OfflineRequests)").all() as any[];
    expect(offlineIndexes.some(idx => idx.name === 'idx_offline_requests_status')).toBe(true);
  });

  it('should allow multiple calls to initDB (idempotency)', async () => {
    // First call
    await initDB();
    
    // Second call should not throw
    await expect(initDB()).resolves.not.toThrow();
    
    // Verify tables still exist
    const tables = testDb.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as any[];
    
    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('UserData');
    expect(tableNames).toContain('UserDevices');
    expect(tableNames).toContain('TimeclockRecords');
    expect(tableNames).toContain('OrderData');
    expect(tableNames).toContain('OfflineRequests');
  });
});
