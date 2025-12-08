import React from "react";
import { View, Text, Button, StyleSheet, Pressable } from "react-native";
import type { Job } from "../../types/job";

/** Props for the JobCard component */
type JobCardProps = {
  job: Job;
  onClockToggle?: (jobId: string, isClockedIn: boolean) => void;
};

/** Renders a card displaying job details and clock-in status */
export const JobCard: React.FC<JobCardProps> = ({ job, onClockToggle }) => {

  const { id, title, details, isClockedIn } = job;
  const buttonTitle = isClockedIn ? "Clock Out" : "Clock In";
  const buttonColor = isClockedIn ? "#d32f2f" /* red */ : "#2e7d32" /* green */;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.details}>{details}</Text>
      <Text>Status: {isClockedIn ? "Clocked In" : "Not Clocked In"}</Text>
      
      <Pressable
        onPress={() => onClockToggle?.(id, !isClockedIn)}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: buttonColor, opacity: pressed ? 0.85 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={buttonTitle}
      >
        <Text style={styles.buttonText}>{buttonTitle}</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12, borderWidth: 1, borderRadius: 8, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold" },
  details: { fontSize: 14, marginVertical: 4 },
  button: {
      marginTop: 10,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
});
