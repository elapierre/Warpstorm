import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { JobCard } from "../components/jobCard";
import { selectJobs } from "../../redux/job/selectors";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Job } from "../../types/job";
import { clockIn, clockOut } from "../../redux/job/jobSlice";
import { fetchJobs, toggleClockStatus } from "../../redux/job/thunks";

/** Screen displaying the list of jobs with clock-in/out functionality */
const JobsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectJobs);
  console.log("JobsScreen rendering with jobs:", jobs);
  const loading = useAppSelector(state => state.job.loading);

  const handleClockToggle = React.useCallback((jobId: string, shouldClockIn: boolean) => {
    try {
      console.log(`Toggling clock for job ${jobId} to ${shouldClockIn}`);
      dispatch(toggleClockStatus({ id: jobId, shouldClockIn }));
    } catch (error) {
      console.error("Error toggling clock:", error);
    }
  }, [dispatch]);

  const loadJobs = React.useCallback(() => {
    try {
      dispatch(fetchJobs());
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  }, [dispatch]);

  React.useEffect(() => {
    // Always refresh jobs in the background
    loadJobs();
    console.log("Jobs loaded:", jobs);
  }, [loadJobs]);

  const renderItem = React.useCallback(({ item }: { item: Job }) => (
    <JobCard job={item} onClockToggle={handleClockToggle} />
  ), [handleClockToggle]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assigned Jobs</Text>
      
      { loading && jobs.length === 0 ? (
          <ActivityIndicator />
       ) : 
       (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            extraData={jobs}
            ListEmptyComponent={<Text>No jobs assigned</Text>}
            onRefresh={loadJobs}
            refreshing={loading}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});

export default JobsScreen;