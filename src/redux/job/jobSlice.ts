import type { Job } from '../../types/job';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobs } from './thunks';

interface JobState {
  jobs: Job[];
  selectedJobId: string | null;
  loading: boolean;
}

const initialState: JobState = {
  jobs: [],
  selectedJobId: null,
  loading: false,
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    clockIn: (state, action: PayloadAction<string>) => {
      console.log("Clocking in for job with id:", action.payload);
      const id = action.payload;

      state.jobs = state.jobs.map(job => job.id === id ? { ...job, isClockedIn: true } : job
      );
    },
    clockOut: (state, action: PayloadAction<string>) => {
        console.log("Clocking out for job with id:", action.payload);
        const id = action.payload;

        state.jobs = state.jobs.map(job => job.id === id ? { ...job, isClockedIn: false } : job);
    },
    selectJob: (state, action: PayloadAction<string>) => {
      state.selectedJobId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setJobs, clockIn, clockOut, selectJob } = jobSlice.actions;
export default jobSlice.reducer;