import { createAsyncThunk} from '@reduxjs/toolkit';
import { getJobsAsync, updateJobAsync } from '../../services/jobsService.mock';
import { clockIn, clockOut } from './jobSlice';
import { ApiError } from '../../types/apiError';

export const fetchJobs = createAsyncThunk('job/fetchJobs', async () => {
    return await getJobsAsync();
});

export const toggleClockStatus = createAsyncThunk<void, { id: string; shouldClockIn: boolean }>(
  'job/toggleClockStatus',
  async ({ id, shouldClockIn }, { dispatch, getState, rejectWithValue }) => {
    dispatch(shouldClockIn ? clockIn(id) : clockOut(id));

    const beforeState = getState() as any;
    const previousJob = beforeState.job.jobs.find((job: any) => job.id === id);
    const previousStatus = !!previousJob?.isClockedIn;

    try {
        console.log("Updating job clock status on server for job id:", id, "to", shouldClockIn);
        await updateJobAsync(id, { isClockedIn: shouldClockIn });
        return;
    } catch (error: ApiError | any) {
      // Revert state on failure
      console.error("Failed to update job clock status:", error);
      dispatch(previousStatus ? clockIn(id) : clockOut(id));
      return rejectWithValue("Failed to update job clock status");
    }
  }
);