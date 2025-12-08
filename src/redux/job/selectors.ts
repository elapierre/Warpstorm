
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../stateStore';
import type { Job } from '../../types/job';

export const selectJobs = (state: RootState): Job[] => state.job.jobs;
export const selectSelectedJobId = (state: RootState): string | null =>
  state.job.selectedJobId;

export const selectSelectedJob = createSelector(
  [selectJobs, selectSelectedJobId],
  (jobs, selectedId): Job | null =>
    jobs.find(j => j.id === selectedId) ?? null
);
