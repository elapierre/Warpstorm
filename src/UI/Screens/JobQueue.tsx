import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import JobCard from "../components/JobCard";

const jobs = [
  { id: "1", title: "Warehouse Cleanup", details: "Shift: 9AM-5PM", isClockedIn: false },
  { id: "2", title: "Inventory Check", details: "Shift: 10AM-2PM", isClockedIn: true },
];

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assigned Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, marginBottom: 10 },
});
