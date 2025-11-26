import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
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

export default function SchemaViewer() {
  const [schema, setSchema] = useState<TableSchema[]>([]);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      {schema.map((t) => (
        <View key={t.table} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{t.table}</Text>

          {t.columns.map((c) => (
            <Text key={c.cid}>
              • {c.name} — {c.type} — NOT NULL {c.notnull}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
