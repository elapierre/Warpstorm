// Persist/DB.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('app.db');

export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      synced INTEGER DEFAULT 0,
      updatedAt TEXT
    );
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
