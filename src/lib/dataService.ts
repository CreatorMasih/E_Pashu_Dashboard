import type {
  AlertItem,
  Animal,
  AnimalProfileData,
  BreedingRecord,
  DashboardData,
  Farmer,
  FieldOfficerTask,
  PregnancyRecord,
  ReminderItem,
  Vaccination,
  VillageInsight,
} from "@/lib/types";

const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL as string | undefined;

const HEALTH_COLOR_MAP: Record<string, string> = {
  healthy: "hsl(152, 60%, 40%)",
  due: "hsl(45, 90%, 50%)",
  sick: "hsl(45, 90%, 50%)",
  critical: "hsl(0, 72%, 51%)",
};

async function callAppsScript<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  if (!GAS_WEB_APP_URL) {
    throw new Error("Apps Script URL not configured");
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const result = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!result.success) {
    throw new Error(result.error || "Unknown Apps Script error");
  }

  return result.data as T;
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function normalizeAnimalStatus(value: unknown): Animal["status"] {
  const status = String(value ?? "").trim();
  if (status === "Due" || status === "Critical") {
    return status;
  }
  return "Healthy";
}

function normalizeAnimals(input: unknown): Animal[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `ANM-${idx + 1}`),
      breed: String(row.breed ?? "Unknown"),
      age: toNumber(row.age),
      owner: String(row.owner ?? "Unknown"),
      status: normalizeAnimalStatus(row.status),
    };
  });
}

function normalizeAlerts(input: unknown): AlertItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const priority = String(row.priority ?? "Medium");
    return {
      id: toNumber(row.id) || idx + 1,
      message: String(row.message ?? "No message"),
      priority: priority === "High" || priority === "Low" ? priority : "Medium",
      type: String(row.type ?? "System"),
      time: String(row.time ?? "Just now"),
    };
  });
}

function normalizePregnancyRecords(input: unknown): PregnancyRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const status = String(row.status ?? "Inseminated");
    return {
      id: String(row.id ?? `PRG-${idx + 1}`),
      animalId: String(row.animalId ?? ""),
      village: String(row.village ?? "Unknown"),
      inseminationDate: String(row.inseminationDate ?? ""),
      expectedCalving: String(row.expectedCalving ?? ""),
      status:
        status === "Pregnant" || status === "Due Soon" || status === "Delivered"
          ? status
          : "Inseminated",
      lastCheckDate: String(row.lastCheckDate ?? ""),
      notes: String(row.notes ?? ""),
    };
  });
}

function normalizeVillageInsights(input: unknown): VillageInsight[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      village: String(row.village ?? "Unknown"),
      totalAnimals: toNumber(row.totalAnimals),
      criticalAnimals: toNumber(row.criticalAnimals),
      pendingVaccinations: toNumber(row.pendingVaccinations),
      pregnantAnimals: toNumber(row.pregnantAnimals),
      vaccinationCoverage: toNumber(row.vaccinationCoverage),
    };
  });
}

function normalizeReminders(input: unknown): ReminderItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const channel = String(row.channel ?? "SMS");
    const status = String(row.status ?? "Pending");
    return {
      id: String(row.id ?? `REM-${idx + 1}`),
      village: String(row.village ?? "Unknown"),
      recipient: String(row.recipient ?? ""),
      channel: channel === "WhatsApp" || channel === "Call" ? channel : "SMS",
      message: String(row.message ?? ""),
      dueDate: String(row.dueDate ?? ""),
      status: status === "Sent" ? "Sent" : "Pending",
      sentAt: String(row.sentAt ?? ""),
    };
  });
}

function normalizeDashboardData(input: DashboardData): DashboardData {
  return {
    vaccinationTrends: (input.vaccinationTrends || []).map((item) => ({
      month: String(item.month ?? ""),
      vaccinations: toNumber(item.vaccinations),
    })),
    healthStatusData: (input.healthStatusData || []).map((item) => {
      const name = String(item.name ?? "Unknown");
      const normalizedKey = name.trim().toLowerCase();
      const fallbackFill = HEALTH_COLOR_MAP[normalizedKey] || "hsl(215, 16%, 47%)";
      const fill = typeof item.fill === "string" ? item.fill : fallbackFill;

      return {
        name,
        value: toNumber(item.value),
        fill,
      };
    }),
    monthlyActivity: (input.monthlyActivity || []).map((item) => ({
      month: String(item.month ?? ""),
      registered: toNumber(item.registered),
      vaccinated: toNumber(item.vaccinated),
      alerts: toNumber(item.alerts),
    })),
    activities: (input.activities || []).map((item) => ({
      action: String(item.action ?? ""),
      detail: String(item.detail ?? ""),
      time: String(item.time ?? ""),
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const raw = await callAppsScript<DashboardData>("dashboard.get");
  return normalizeDashboardData(raw);
}

export async function listAnimals(): Promise<Animal[]> {
  const raw = await callAppsScript<unknown>("animals.list");
  return normalizeAnimals(raw);
}

export async function createAnimal(input: Animal): Promise<Animal> {
  return callAppsScript<Animal>("animals.create", { input });
}

export async function getAnimalProfile(id: string): Promise<AnimalProfileData> {
  return callAppsScript<AnimalProfileData>("animals.profile", { id });
}

export async function listFarmers(): Promise<Farmer[]> {
  return callAppsScript<Farmer[]>("farmers.list");
}

export async function createFarmer(input: Farmer): Promise<Farmer> {
  return callAppsScript<Farmer>("farmers.create", { input });
}

export async function listVaccinations(): Promise<Vaccination[]> {
  return callAppsScript<Vaccination[]>("vaccinations.list");
}

export async function markVaccinationDone(animalId: string, type: string): Promise<Vaccination> {
  return callAppsScript<Vaccination>("vaccinations.markDone", { animalId, type });
}

export async function listBreedingRecords(): Promise<BreedingRecord[]> {
  return callAppsScript<BreedingRecord[]>("breeding.list");
}

export async function listAlerts(): Promise<AlertItem[]> {
  const raw = await callAppsScript<unknown>("alerts.list");
  return normalizeAlerts(raw);
}

export async function listFieldOfficerTasks(): Promise<FieldOfficerTask[]> {
  return callAppsScript<FieldOfficerTask[]>("tasks.list");
}

export async function toggleFieldOfficerTask(id: number): Promise<FieldOfficerTask> {
  return callAppsScript<FieldOfficerTask>("tasks.toggle", { id });
}

export async function listPregnancyRecords(): Promise<PregnancyRecord[]> {
  const raw = await callAppsScript<unknown>("pregnancy.list");
  return normalizePregnancyRecords(raw);
}

export async function createPregnancyRecord(input: Omit<PregnancyRecord, "id">): Promise<PregnancyRecord> {
  const raw = await callAppsScript<unknown>("pregnancy.create", { input });
  return normalizePregnancyRecords([raw])[0];
}

export async function updatePregnancyStatus(id: string, status: PregnancyRecord["status"]): Promise<PregnancyRecord> {
  const raw = await callAppsScript<unknown>("pregnancy.updateStatus", { id, status });
  return normalizePregnancyRecords([raw])[0];
}

export async function listVillageInsights(): Promise<VillageInsight[]> {
  const raw = await callAppsScript<unknown>("analytics.villageInsights");
  return normalizeVillageInsights(raw);
}

export async function listReminders(): Promise<ReminderItem[]> {
  const raw = await callAppsScript<unknown>("reminders.list");
  return normalizeReminders(raw);
}

export async function createReminder(input: Omit<ReminderItem, "id" | "status" | "sentAt">): Promise<ReminderItem> {
  const raw = await callAppsScript<unknown>("reminders.create", { input });
  return normalizeReminders([raw])[0];
}

export async function sendReminder(id: string): Promise<ReminderItem> {
  const raw = await callAppsScript<unknown>("reminders.send", { id });
  return normalizeReminders([raw])[0];
}
