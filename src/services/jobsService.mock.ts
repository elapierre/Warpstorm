import type { Job } from "../types/job";
import { generateJobs, delay } from "../mocks/jobFixtures";

let mockJobs: Job[] = generateJobs(10);
const DEFAULT_LATENCY_MS = 600;

export const getJobsAsync = async (): Promise<Job[]> => {
    await delay(DEFAULT_LATENCY_MS);
    return mockJobs.map(job => ({ ...job })); // simulate fetching fresh copies
}

export const getJobByIdAsync = async (id: string): Promise<Job | null> => {
    await delay(DEFAULT_LATENCY_MS);
    const job = mockJobs.find(j => j.id === id);
    if (!job) {
        return null;
    }
    return { ...job }; // simulate fetching a fresh copy
}


export const updateJobAsync = async (
  id: string,
  payload: Partial<Pick<Job, 'title' | 'details' | 'isClockedIn'>>
): Promise<Job | null> => {

  await delay(DEFAULT_LATENCY_MS);
  const index = mockJobs.findIndex(j => j.id === id);

  if (index < 0) return null;
  const updated = { ...mockJobs[index], ...payload };

  mockJobs[index] = updated;
  return { ...updated };
}
