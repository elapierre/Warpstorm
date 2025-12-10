import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as SQLite from "expo-sqlite";

// Define our schema types
interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

interface UserCacheData {
  id: number;
  userId: string;
  cacheType: string;
  dataKey: string;
  dataValue?: string;
  jsonData?: string;
  createdAt: string;
}

export default function SchemaViewer() {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [userCacheData, setUserCacheData] = useState<UserCacheData[]>([]);
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    const db = SQLite.openDatabaseSync("warpstorm.db");

    const tables = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table';`
    );

    const results: TableSchema[] = [];

    for (const t of tables) {
      const cols = await db.getAllAsync<ColumnInfo>(
        `PRAGMA table_info(${t.name});`
      );
      results.push({ table: t.name, columns: cols });
    }

    setSchema(results);
  };

  const loadUserCacheData = async () => {
    try {
      const db = SQLite.openDatabaseSync("warpstorm.db");
      const data = await db.getAllAsync<UserCacheData>(
        `SELECT id, userId, cacheType, dataKey, dataValue, 
         CASE WHEN length(jsonData) > 100 THEN substr(jsonData, 1, 100) || '...' 
              ELSE jsonData END as jsonData, 
         createdAt 
         FROM UserCache 
         ORDER BY createdAt DESC 
         LIMIT 50`
      );
      setUserCacheData(data);
      setShowData(!showData);
    } catch (error) {
      console.error('Error loading UserCache data:', error);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1 }} 
          onPress={loadUserCacheData}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {showData ? 'Hide Cache Data' : 'Show UserCache Data'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5, flex: 1 }} 
          onPress={loadSchema}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Refresh Schema
          </Text>
        </TouchableOpacity>
      </View>

      {showData && (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
            UserCache Data ({userCacheData.length} records)
          </Text>
          {userCacheData.length === 0 ? (
            <Text style={{ fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
              No UserCache records found. Try logging in to generate cache data.
            </Text>
          ) : (
            userCacheData.map((record, index) => (
              <View key={record.id} style={{ 
                backgroundColor: '#f5f5f5', 
                padding: 12, 
                marginBottom: 10, 
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#007AFF'
              }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#007AFF' }}>
                  Record {index + 1} (ID: {record.id})
                </Text>
                <Text>User ID: {record.userId}</Text>
                <Text>Cache Type: {record.cacheType}</Text>
                <Text>Data Key: {record.dataKey}</Text>
                {record.dataValue && <Text>Value: {record.dataValue}</Text>}
                {record.jsonData && <Text>JSON: {record.jsonData}</Text>}
                <Text>Created: {record.createdAt}</Text>
              </View>
            ))
          )}
        </View>
      )}

      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          Database Schema
        </Text>
        {schema.map((t) => (
          <View key={t.table} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{t.table}</Text>
            {t.columns.map((c) => (
              <Text key={c.cid} style={{ marginLeft: 10 }}>
                • {c.name} — {c.type} — NOT NULL {c.notnull}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
