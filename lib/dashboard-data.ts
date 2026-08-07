export type DashboardSummary = {
  totalUsers: number;
  employees: number;
  employers: number;
  newUsers30d: number;
  profileCompletion: number;
  documentCoverage: number;
  vaultBalance: number;
};

export type TrendPoint = {
  date: string;
  users: number;
  employees: number;
  employers: number;
  profiles: number;
};

export type Breakdown = {
  name: string;
  value: number;
};

export type JobPreference = {
  key: string;
  subcategories: string[];
};

export type RecentUser = {
  id: string;
  publicId: string | null;
  name: string;
  phoneNumber: string;
  role: "employee" | "employer" | "unassigned";
  location: string;
  language: string;
  joinedAt: string;
  profileComplete: boolean;
  approved: boolean;
  documents: number;
  rating: number;
  vaultBalance: number;
  jobPreferences: JobPreference[];
};

export type UserDocument = {
  id: string;
  type: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type EmployeeProfile = {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  province: string;
  city: string;
  town: string;
  division: string;
  permanentAddress: string;
  currentAddress: string;
  emergencyName: string;
  emergencyAddress: string;
  emergencyPhone: string;
  completedAt: string;
  updatedAt: string;
};

export type EmployerProfile = {
  firstName: string;
  surname: string;
  businessName: string | null;
  contactName: string | null;
  contactNumber: string;
  businessAddress: string | null;
  completedAt: string;
  updatedAt: string;
};

export type UserDetail = {
  id: string;
  publicId: string | null;
  name: string;
  phoneNumber: string;
  language: string;
  role: "employee" | "employer" | "unassigned";
  rating: number;
  vaultBalance: number;
  approved: boolean;
  approvedAt: string | null;
  termsAcceptedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  employeeProfile: EmployeeProfile | null;
  employerProfile: EmployerProfile | null;
  jobPreferences: JobPreference[];
  documents: UserDocument[];
};

export type DashboardData = {
  generatedAt: string;
  summary: DashboardSummary;
  registrations: TrendPoint[];
  roles: Breakdown[];
  languages: Breakdown[];
  jobCategories: Breakdown[];
  locations: Breakdown[];
  recentUsers: RecentUser[];
};

export const emptyDashboardData: DashboardData = {
  generatedAt: "",
  summary: {
    totalUsers: 0,
    employees: 0,
    employers: 0,
    newUsers30d: 0,
    profileCompletion: 0,
    documentCoverage: 0,
    vaultBalance: 0,
  },
  registrations: [],
  roles: [],
  languages: [],
  jobCategories: [],
  locations: [],
  recentUsers: [],
};
