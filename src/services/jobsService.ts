import { GetAsync, PutAsync, PostAsync, DeleteAsync } from './api';
import type { Job } from '../types/job';

const JOBS_ENDPOINT = 'jobs';

/**
 * Fetch all jobs.
 */
export async function getJobsAsync(): Promise<Job[]> {
  return await GetAsync<Job[]>(JOBS_ENDPOINT);
}

/**
 * Fetch a single job by ID.
 */
export async function getJobByIdAsync(id: string): Promise<Job | null> {
  return await GetAsync<Job>(`${JOBS_ENDPOINT}/${id}`);
}

/**
 * Update an existing job.
 * 
 * NOTE: If your API expects specific fields for update, narrow
 * the `payload` type accordingly.
 */
export async function updateJobAsync(
  id: string,
  payload: Partial<Pick<Job, 'title' | 'details' | 'isClockedIn'>>
): Promise<Job> {
  return await PutAsync<Job>(`${JOBS_ENDPOINT}/${id}`, payload);
}
