import type { Job } from '../types/job';

// Helper to generate random order number in format "400XXXX"
const generateOrderNumber = (): string => {
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `400${randomDigits}`;
};

// Helper to randomly pick true/false
const randomBool = (): boolean => Math.random() < 0.5;

// Function to generate N random jobs
export const generateJobs = (count: number): Job[] => {
  const jobs: Job[] = [];
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

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));


// Example usage
//const jobs = generateJobs(10);
//console.log(jobs);