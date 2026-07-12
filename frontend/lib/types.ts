export type UserRole = "jobseeker" | "employer" | "admin";

export type JobType =
  | "Full-time"
  | "Part-time"
  | "Internship"
  | "Remote"
  | "Contract";

export type ApplicationStatus =
  | "Pending"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Accepted";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
};

export type UserSummary = {
  _id: string;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type Education = {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  from?: string;
  to?: string;
};

export type Experience = {
  company: string;
  position: string;
  from?: string;
  to?: string;
  description?: string;
};

export type Profile = {
  _id?: string;
  user?: UserSummary;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  cv?: CVFile;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills?: string[];
  location: string;
  salary: string;
  jobType: JobType;
  category: string;
  deadline: string;
  employer?: UserSummary;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CVFile = {
  fileId?: string;
  filename?: string;
  originalName?: string;
  contentType?: string;
  size?: number;
};

export type JobApplication = {
  _id: string;
  job?: Job;
  applicant?: UserSummary;
  employer?: UserSummary;
  coverLetter?: string;
  cv?: CVFile;
  extractedSkills?: string[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
};

export type RecommendedJob = {
  job: Job;
  matchedSkills: string[];
  matchPercentage: number;
};

export type AdminStats = {
  totalUsers: number;
  totalJobSeekers: number;
  totalEmployers: number;
  totalAdmins: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
};

export type ApiResponseBase = {
  success: boolean;
  message?: string;
};

export type AuthResponse = ApiResponseBase & {
  token?: string;
  user?: AuthUser;
};

export type JobsResponse = ApiResponseBase & {
  count?: number;
  jobs: Job[];
};

export type JobResponse = ApiResponseBase & {
  job?: Job;
};

export type ApplicationsResponse = ApiResponseBase & {
  count?: number;
  applications: JobApplication[];
};

export type ApplyJobResponse = ApiResponseBase & {
  application?: JobApplication;
  extractedSkills?: string[];
};

export type ProfileResponse = ApiResponseBase & {
  profile?: Profile;
};

export type ProfileCVAnalysisResponse = ApiResponseBase & {
  extractedSkills?: string[];
};

export type RecommendedJobsResponse = ApiResponseBase & {
  count?: number;
  recommendedJobs: RecommendedJob[];
};

export type AdminStatsResponse = ApiResponseBase & {
  stats?: AdminStats;
};

export type UsersResponse = ApiResponseBase & {
  count?: number;
  users: UserSummary[];
};
