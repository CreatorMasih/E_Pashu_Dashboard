export type HealthStatus = "Healthy" | "Due" | "Critical";
export type VaccinationStatus = "Done" | "Pending" | "Overdue";
export type Priority = "High" | "Medium" | "Low";

export interface Animal {
  id: string;
  breed: string;
  age: number;
  owner: string;
  status: HealthStatus;
}

export interface Farmer {
  name: string;
  phone: string;
  village: string;
  animals: number;
}

export interface Vaccination {
  animalId: string;
  type: string;
  date: string;
  status: VaccinationStatus;
}

export interface BreedingRecord {
  animalId: string;
  inseminationDate: string;
  expectedCalving: string;
  status: string;
}

export interface AlertItem {
  id: number;
  message: string;
  priority: Priority;
  type: string;
  time: string;
}

export interface Activity {
  action: string;
  detail: string;
  time: string;
}

export interface FieldOfficerTask {
  id: number;
  task: string;
  village: string;
  completed: boolean;
}

export interface VaccinationTrend {
  month: string;
  vaccinations: number;
}

export interface HealthStatusSlice {
  name: string;
  value: number;
  fill: string;
}

export interface MonthlyActivity {
  month: string;
  registered: number;
  vaccinated: number;
  alerts: number;
}

export interface DashboardData {
  vaccinationTrends: VaccinationTrend[];
  healthStatusData: HealthStatusSlice[];
  monthlyActivity: MonthlyActivity[];
  activities: Activity[];
}

export interface AnimalProfileData {
  animal: Animal;
  vaccHistory: Vaccination[];
  breedingHistory: Array<{
    date: string;
    type: string;
    status: string;
    expected: string;
  }>;
  reminders: Array<{
    text: string;
    date: string;
  }>;
}

export interface PregnancyRecord {
  id: string;
  animalId: string;
  village: string;
  inseminationDate: string;
  expectedCalving: string;
  status: "Inseminated" | "Pregnant" | "Due Soon" | "Delivered";
  lastCheckDate: string;
  notes: string;
}

export interface VillageInsight {
  village: string;
  totalAnimals: number;
  criticalAnimals: number;
  pendingVaccinations: number;
  pregnantAnimals: number;
  vaccinationCoverage: number;
}

export interface ReminderItem {
  id: string;
  village: string;
  recipient: string;
  channel: "SMS" | "WhatsApp" | "Call";
  message: string;
  dueDate: string;
  status: "Pending" | "Sent";
  sentAt: string;
}
