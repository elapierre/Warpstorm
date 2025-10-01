import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import JobCard from "../Components/JobCard";

type JobOrder = {
  id: string;
  title: string;
  details: string;
  isClockedIn: boolean;
};

// Helper to generate random order number in format "400XXXX"
const generateOrderNumber = (): string => {
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `400${randomDigits}`;
};

// Helper to randomly pick true/false
const randomBool = (): boolean => Math.random() < 0.5;

// Function to generate N random jobs
const generateJobs = (count: number): JobOrder[] => {
  const jobs: JobOrder[] = [];
  for (let i = 1; i <= count; i++) {
    jobs.push({
      id: i.toString(),
      title: generateOrderNumber(),
      details: `Shift: ${9 + Math.floor(Math.random() * 8)}AM-${5 + Math.floor(Math.random() * 4)}PM`,
      isClockedIn: randomBool(),
    });
  }
  return jobs;
};

// Example usage
const jobs = generateJobs(10);
console.log(jobs);

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
