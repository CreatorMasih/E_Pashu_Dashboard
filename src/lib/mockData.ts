export const animals = [
  { id: "ANM-001", breed: "Holstein", age: 4, owner: "Rajesh Kumar", status: "Healthy" },
  { id: "ANM-002", breed: "Jersey", age: 2, owner: "Sita Devi", status: "Due" },
  { id: "ANM-003", breed: "Sahiwal", age: 6, owner: "Mohan Singh", status: "Critical" },
  { id: "ANM-004", breed: "Gir", age: 3, owner: "Priya Sharma", status: "Healthy" },
  { id: "ANM-005", breed: "Red Sindhi", age: 5, owner: "Amit Patel", status: "Healthy" },
  { id: "ANM-006", breed: "Murrah", age: 1, owner: "Kavita Devi", status: "Due" },
  { id: "ANM-007", breed: "Tharparkar", age: 7, owner: "Suresh Yadav", status: "Healthy" },
  { id: "ANM-008", breed: "Kankrej", age: 4, owner: "Geeta Bai", status: "Critical" },
];

export const farmers = [
  { name: "Rajesh Kumar", phone: "+91 98765 43210", village: "Rampur", animals: 12 },
  { name: "Sita Devi", phone: "+91 87654 32109", village: "Lakshmipur", animals: 8 },
  { name: "Mohan Singh", phone: "+91 76543 21098", village: "Krishnanagar", animals: 15 },
  { name: "Priya Sharma", phone: "+91 65432 10987", village: "Govindpur", animals: 6 },
  { name: "Amit Patel", phone: "+91 54321 09876", village: "Rampur", animals: 20 },
  { name: "Kavita Devi", phone: "+91 43210 98765", village: "Lakshmipur", animals: 4 },
];

export const vaccinations = [
  { animalId: "ANM-001", type: "FMD Vaccine", date: "2026-03-15", status: "Done" },
  { animalId: "ANM-002", type: "Brucellosis", date: "2026-04-01", status: "Pending" },
  { animalId: "ANM-003", type: "Anthrax", date: "2026-03-01", status: "Overdue" },
  { animalId: "ANM-004", type: "FMD Vaccine", date: "2026-03-20", status: "Done" },
  { animalId: "ANM-005", type: "HS Vaccine", date: "2026-03-28", status: "Pending" },
  { animalId: "ANM-006", type: "BQ Vaccine", date: "2026-02-15", status: "Overdue" },
  { animalId: "ANM-007", type: "PPR Vaccine", date: "2026-03-25", status: "Done" },
];

export const breedingRecords = [
  { animalId: "ANM-001", inseminationDate: "2025-12-10", expectedCalving: "2026-09-15", status: "Confirmed" },
  { animalId: "ANM-002", inseminationDate: "2026-01-05", expectedCalving: "2026-10-10", status: "Confirmed" },
  { animalId: "ANM-004", inseminationDate: "2026-02-20", expectedCalving: "2026-11-25", status: "Pending" },
  { animalId: "ANM-005", inseminationDate: "2025-06-15", expectedCalving: "2026-04-01", status: "Due Soon" },
  { animalId: "ANM-007", inseminationDate: "2025-07-10", expectedCalving: "2026-04-05", status: "Due Soon" },
];

export const alerts = [
  { id: 1, message: "FMD vaccination overdue for ANM-003", priority: "High", type: "Vaccination", time: "2 hours ago" },
  { id: 2, message: "Possible disease outbreak detected in Rampur", priority: "High", type: "AI Alert", time: "4 hours ago" },
  { id: 3, message: "ANM-008 showing signs of illness", priority: "High", type: "Health", time: "5 hours ago" },
  { id: 4, message: "5 animals need vaccination this week", priority: "Medium", type: "Reminder", time: "1 day ago" },
  { id: 5, message: "Breeding check due for ANM-005", priority: "Medium", type: "Breeding", time: "1 day ago" },
  { id: 6, message: "Monthly report ready for download", priority: "Low", type: "System", time: "2 days ago" },
];

export const activities = [
  { action: "Animal vaccinated", detail: "ANM-004 received FMD vaccine", time: "30 min ago" },
  { action: "New animal registered", detail: "ANM-008 added by Geeta Bai", time: "1 hour ago" },
  { action: "Alert generated", detail: "Disease risk in Rampur village", time: "2 hours ago" },
  { action: "Farmer registered", detail: "Kavita Devi joined the platform", time: "3 hours ago" },
  { action: "Task completed", detail: "Officer visited Lakshmipur", time: "5 hours ago" },
];

export const fieldOfficerTasks = [
  { id: 1, task: "Vaccinate 3 animals in Rampur", village: "Rampur", completed: false },
  { id: 2, task: "Health check for ANM-003", village: "Krishnanagar", completed: false },
  { id: 3, task: "Collect breeding samples", village: "Govindpur", completed: true },
  { id: 4, task: "Follow up on disease alert", village: "Rampur", completed: false },
  { id: 5, task: "Register new animals", village: "Lakshmipur", completed: true },
];

export const vaccinationTrends = [
  { month: "Oct", vaccinations: 45 },
  { month: "Nov", vaccinations: 62 },
  { month: "Dec", vaccinations: 38 },
  { month: "Jan", vaccinations: 55 },
  { month: "Feb", vaccinations: 72 },
  { month: "Mar", vaccinations: 48 },
];

export const healthStatusData = [
  { name: "Healthy", value: 65, fill: "hsl(152, 60%, 40%)" },
  { name: "Due", value: 20, fill: "hsl(45, 90%, 50%)" },
  { name: "Critical", value: 15, fill: "hsl(0, 72%, 51%)" },
];

export const monthlyActivity = [
  { month: "Oct", registered: 12, vaccinated: 45, alerts: 3 },
  { month: "Nov", registered: 8, vaccinated: 62, alerts: 5 },
  { month: "Dec", registered: 15, vaccinated: 38, alerts: 2 },
  { month: "Jan", registered: 10, vaccinated: 55, alerts: 7 },
  { month: "Feb", registered: 18, vaccinated: 72, alerts: 4 },
  { month: "Mar", registered: 6, vaccinated: 48, alerts: 8 },
];
