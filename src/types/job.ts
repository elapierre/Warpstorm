/** Represents a job with its details and clock-in status */
export interface Job {
  /** Unique identifier for the job */
  id: string;
  /** Title of the job */
  title: string;
  /** Detailed description of the job */
  details: string;
  /** Indicates if the job is currently clocked in */
  isClockedIn: boolean;
}
