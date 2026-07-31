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
  name: string;
  phoneNumber: string;
  role: "employee" | "employer" | "unassigned";
  location: string;
  language: string;
  joinedAt: string;
  profileComplete: boolean;
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
  businessName: string;
  contactName: string;
  contactNumber: string;
  businessAddress: string;
  completedAt: string;
  updatedAt: string;
};

export type UserDetail = {
  id: string;
  name: string;
  phoneNumber: string;
  language: string;
  role: "employee" | "employer" | "unassigned";
  rating: number;
  vaultBalance: number;
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

const registrations: TrendPoint[] = [
  { date: "2026-07-02", users: 8, profiles: 6 },
  { date: "2026-07-03", users: 12, profiles: 9 },
  { date: "2026-07-04", users: 7, profiles: 6 },
  { date: "2026-07-05", users: 5, profiles: 4 },
  { date: "2026-07-06", users: 11, profiles: 8 },
  { date: "2026-07-07", users: 14, profiles: 11 },
  { date: "2026-07-08", users: 9, profiles: 8 },
  { date: "2026-07-09", users: 16, profiles: 13 },
  { date: "2026-07-10", users: 13, profiles: 10 },
  { date: "2026-07-11", users: 10, profiles: 8 },
  { date: "2026-07-12", users: 6, profiles: 5 },
  { date: "2026-07-13", users: 15, profiles: 12 },
  { date: "2026-07-14", users: 18, profiles: 14 },
  { date: "2026-07-15", users: 12, profiles: 10 },
  { date: "2026-07-16", users: 17, profiles: 15 },
  { date: "2026-07-17", users: 20, profiles: 17 },
  { date: "2026-07-18", users: 14, profiles: 11 },
  { date: "2026-07-19", users: 9, profiles: 7 },
  { date: "2026-07-20", users: 16, profiles: 13 },
  { date: "2026-07-21", users: 22, profiles: 18 },
  { date: "2026-07-22", users: 18, profiles: 15 },
  { date: "2026-07-23", users: 21, profiles: 18 },
  { date: "2026-07-24", users: 17, profiles: 14 },
  { date: "2026-07-25", users: 13, profiles: 11 },
  { date: "2026-07-26", users: 11, profiles: 9 },
  { date: "2026-07-27", users: 19, profiles: 16 },
  { date: "2026-07-28", users: 24, profiles: 20 },
  { date: "2026-07-29", users: 20, profiles: 17 },
  { date: "2026-07-30", users: 23, profiles: 19 },
  { date: "2026-07-31", users: 26, profiles: 22 },
];

export const demoDashboardData: DashboardData = {
  generatedAt: "2026-07-31T09:30:00.000Z",
  summary: {
    totalUsers: 1842,
    employees: 1396,
    employers: 446,
    newUsers30d: 449,
    profileCompletion: 82.6,
    documentCoverage: 73.4,
    vaultBalance: 284590.5,
  },
  registrations,
  roles: [
    { name: "Employees", value: 1396 },
    { name: "Employers", value: 446 },
  ],
  languages: [
    { name: "Sinhala", value: 1028 },
    { name: "English", value: 496 },
    { name: "Tamil", value: 318 },
  ],
  jobCategories: [
    { name: "Construction", value: 326 },
    { name: "Hospitality & tourism", value: 284 },
    { name: "Logistics & delivery", value: 251 },
    { name: "Domestic services", value: 218 },
    { name: "Retail & sales", value: 194 },
    { name: "IT & digital", value: 162 },
  ],
  locations: [
    { name: "Western", value: 548 },
    { name: "Central", value: 276 },
    { name: "Southern", value: 231 },
    { name: "North Western", value: 183 },
    { name: "Northern", value: 121 },
  ],
  recentUsers: [
    {
      id: "a732f117",
      name: "Nimali Perera",
      phoneNumber: "+94 77 345 1820",
      role: "employee",
      location: "Colombo, Western",
      language: "Sinhala",
      joinedAt: "2026-07-31T08:42:00.000Z",
      profileComplete: true,
      documents: 5,
      rating: 4.9,
      vaultBalance: 3250,
      jobPreferences: [
        { key: "hospitalityFoodTourism", subcategories: ["hotelHospitality"] },
      ],
    },
    {
      id: "e281bc83",
      name: "Ocean View Hotel",
      phoneNumber: "+94 71 824 5910",
      role: "employer",
      location: "Galle, Southern",
      language: "English",
      joinedAt: "2026-07-31T07:58:00.000Z",
      profileComplete: true,
      documents: 0,
      rating: 5,
      vaultBalance: 12800,
      jobPreferences: [],
    },
    {
      id: "db91ad72",
      name: "S. Kugan",
      phoneNumber: "+94 76 441 0275",
      role: "employee",
      location: "Jaffna, Northern",
      language: "Tamil",
      joinedAt: "2026-07-31T07:31:00.000Z",
      profileComplete: true,
      documents: 3,
      rating: 4.7,
      vaultBalance: 1800,
      jobPreferences: [
        { key: "itDigital", subcategories: ["technicalSupport"] },
      ],
    },
    {
      id: "c394e10a",
      name: "Kasun Jayasinghe",
      phoneNumber: "+94 75 910 6624",
      role: "employee",
      location: "Kandy, Central",
      language: "Sinhala",
      joinedAt: "2026-07-31T06:47:00.000Z",
      profileComplete: false,
      documents: 1,
      rating: 5,
      vaultBalance: 0,
      jobPreferences: [
        { key: "construction", subcategories: ["masonry", "tiling"] },
      ],
    },
    {
      id: "f551bd18",
      name: "Metro Build Lanka",
      phoneNumber: "+94 70 224 9138",
      role: "employer",
      location: "Colombo, Western",
      language: "English",
      joinedAt: "2026-07-30T16:25:00.000Z",
      profileComplete: true,
      documents: 0,
      rating: 4.8,
      vaultBalance: 24600,
      jobPreferences: [],
    },
    {
      id: "b104fa38",
      name: "Fathima Nazeer",
      phoneNumber: "+94 74 381 5521",
      role: "employee",
      location: "Puttalam, North Western",
      language: "Tamil",
      joinedAt: "2026-07-30T15:08:00.000Z",
      profileComplete: true,
      documents: 4,
      rating: 4.6,
      vaultBalance: 950,
      jobPreferences: [
        { key: "logisticsDelivery", subcategories: ["warehouseWork"] },
      ],
    },
  ],
};
