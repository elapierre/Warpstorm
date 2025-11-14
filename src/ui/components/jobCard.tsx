import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface Job {
  id: string;
  title: string;
  details: string;
  isClockedIn: boolean;
}

export default function JobCard({ job }: { job: Job }) {
  const [clockedIn, setClockedIn] = useState(job.isClockedIn);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.details}>{job.details}</Text>
      <Text>Status: {clockedIn ? "Clocked In" : "Not Clocked In"}</Text>
      <Button
        title={clockedIn ? "Clock Out" : "Clock In"}
        onPress={() => setClockedIn(!clockedIn)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12, borderWidth: 1, borderRadius: 8, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold" },
  details: { fontSize: 14, marginVertical: 4 },
});
