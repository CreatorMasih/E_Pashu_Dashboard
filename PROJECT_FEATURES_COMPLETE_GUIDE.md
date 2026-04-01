# Digital Livestock Monitoring Dashboard - Complete Feature and Progress Guide

## 1. Purpose of This Document
This document explains the complete working of the current site from minor to major functionality, including:
- What each module does
- Which user benefits from it
- Which frontend and backend functions power it
- How to use each feature
- Current progress against the original concept note

This is the master reference for product understanding, demo, handover, and future development.

## 2. Product Summary
The platform is a web-based livestock operations dashboard that centralizes animal, farmer, vaccination, pregnancy, alerts, task, analytics, and reminders data using:
- Frontend: React + TypeScript + React Query + Recharts
- Backend: Google Apps Script Web App
- Database: Google Sheets (multi-tab model)

Core objective: reduce missed care events, improve disease visibility, and support data-driven village-level planning.

## 3. Target Users and How They Use the Product
### 3.1 Farmers / Cattle Owners
- Animal registration data can be recorded and viewed.
- Vaccination due/done status can be monitored.
- Pregnancy tracking with expected calving and reminders can be maintained.

### 3.2 Veterinary Doctors
- Can monitor alerts and critical cases by village.
- Can use pregnancy and vaccination statuses to prioritize visits.
- Can review reminder queues and operational data.

### 3.3 Government Livestock Officers
- Can monitor village-level coverage and risk indicators.
- Can use analytics page to identify low-coverage or high-risk villages.

### 3.4 Field Workers
- Can update field task completion.
- Can update pregnancy status and vaccination progress through dashboard workflows.

### 3.5 Administrators / Analysts
- Can monitor system-wide trends and monthly indicators.
- Can analyze village-level health and vaccination metrics.
- Can create/send reminders and monitor queue status.

## 4. Full Site Structure and Routes
Application routes:
- / -> Main Dashboard
- /animals -> Animal management list and registration
- /animals/:id -> Animal profile detail
- /farmers -> Farmer management
- /vaccinations -> Vaccination tracking and update
- /breeding -> Pregnancy tracking workflow
- /alerts -> Alerts and outbreak monitoring
- /field-officers -> Field task management
- /ai-insights -> AI alerts and reminders operations
- /reports -> Village-wise analytics and reporting view

## 5. Features Module by Module

## 5.1 Dashboard Module
### What it provides
- Summary cards (animals, farmers, vaccination coverage, pending vaccinations, active alerts)
- Vaccination trend chart
- Health status pie chart
- Monthly activity chart
- Recent activity feed

### Backend action
- dashboard.get

### Primary usage
- Open dashboard to get quick system health and program progress snapshot.

### Important behavior
- Data normalization is applied on frontend to prevent chart crashes from malformed sheet values.

## 5.2 Animal Management Module
### What it provides
- Search animals by ID, breed, owner
- Filter by health status
- Add new animal
- Navigate to animal profile

### Backend actions
- animals.list
- animals.create
- animals.profile

### Primary usage flow
1. Open Animals page
2. Search/filter as needed
3. Add animal using registration dialog
4. Click row to open profile

### Notes
- Data is normalized to avoid breakage from missing/malformed fields.

## 5.3 Animal Profile Module
### What it provides
- Animal details
- Vaccination history
- Breeding history
- Upcoming reminders

### Backend action
- animals.profile

### Primary usage
- Open profile from Animals page for case-level history and follow-up details.

## 5.4 Farmer Management Module
### What it provides
- Farmer search and listing
- Farmer registration (name, phone, village, animal count)

### Backend actions
- farmers.list
- farmers.create

### Primary usage
- Register and maintain farmer-level ownership/village metadata.

## 5.5 Vaccination Tracker Module
### What it provides
- Vaccination records by animal
- Mark pending/overdue records as done

### Backend actions
- vaccinations.list
- vaccinations.markDone

### Primary usage
- Use as day-to-day vaccination execution tracker.

## 5.6 Pregnancy Tracking Module
### What it provides
- Pregnancy records list
- Create new pregnancy record
- Update lifecycle status
- Summary counts: total, active pregnancies, delivered

### Backend actions
- pregnancy.list
- pregnancy.create
- pregnancy.updateStatus

### Primary usage flow
1. Add record with insemination and expected calving date
2. Update status as case progresses
3. Use summary cards to track outcomes

### Status lifecycle
- Inseminated
- Pregnant
- Due Soon
- Delivered

## 5.7 Alerts and Outbreak Monitoring Module
### What it provides
- Manual/base alerts from Alerts sheet
- Auto-generated outbreak alerts

### Outbreak logic implemented
- If critical animals count in same village is >= 2, system generates an AI alert
- Priority becomes High when cluster is larger

### Backend actions
- alerts.list (internally merges base alerts + outbreak alerts)

### Primary usage
- Monitor high-risk villages and trigger preventive intervention.

## 5.8 Field Officer Task Module
### What it provides
- Daily task list
- Toggle completion status
- Quick operational progress cards

### Backend actions
- tasks.list
- tasks.toggle

### Primary usage
- Track execution of assigned field activities.

## 5.9 AI Alerts and Reminders Module
### What it provides
- Displays AI Alert signals
- Create reminders manually
- View reminder queue
- Send reminders (state update)
- Includes auto reminders built from pending vaccinations

### Backend actions
- reminders.list
- reminders.create
- reminders.send

### Primary usage flow
1. Review AI signals
2. Create reminder with channel and due date
3. Send pending reminders
4. Track sent status and sent timestamp

## 5.10 Village Analytics Module
### What it provides
- Village-wise vaccination coverage chart
- Village health table with:
  - Total animals
  - Critical animals
  - Pending vaccinations
  - Pregnant animals
  - Coverage percentage

### Backend action
- analytics.villageInsights

### Primary usage
- Campaign planning, risk targeting, and resource allocation.

## 6. Backend Function Inventory (Apps Script)
All actions are routed by doPost(action, payload).

### 6.1 Router and Infrastructure
- doPost
- jsonResponse_
- getSheet_
- listRows_
- appendRow_
- toBool_
- formatDate_

### 6.2 Dashboard and Core Data
- getDashboardData_
- createAnimal_
- getAnimalProfile_
- createFarmer_
- markVaccinationDone_
- toggleTask_

### 6.3 Pregnancy Functions
- createPregnancyRecord_
- updatePregnancyStatus_

### 6.4 Alert and Outbreak Functions
- getAlertsWithOutbreaks_
- detectOutbreakAlerts_

### 6.5 Village Insight Functions
- getVillageInsights_

### 6.6 Reminder Functions
- getReminders_
- buildAutoVaccinationReminders_
- createReminder_
- sendReminder_

## 7. Frontend Service Function Inventory
Service layer file centralizes all API calls and data normalization.

### 7.1 Core transport and normalization
- callAppsScript
- normalizeDashboardData
- normalizeAnimals
- normalizeAlerts
- normalizePregnancyRecords
- normalizeVillageInsights
- normalizeReminders

### 7.2 API wrappers
- getDashboardData
- listAnimals
- createAnimal
- getAnimalProfile
- listFarmers
- createFarmer
- listVaccinations
- markVaccinationDone
- listBreedingRecords
- listAlerts
- listFieldOfficerTasks
- toggleFieldOfficerTask
- listPregnancyRecords
- createPregnancyRecord
- updatePregnancyStatus
- listVillageInsights
- listReminders
- createReminder
- sendReminder

## 8. Google Sheet Data Model (Required Tabs and Headers)
Create these tabs exactly as listed:

- Animals: id,breed,age,owner,status
- Farmers: name,phone,village,animals
- Vaccinations: animalId,type,date,status
- Breeding: animalId,inseminationDate,expectedCalving,status
- Pregnancy: id,animalId,village,inseminationDate,expectedCalving,status,lastCheckDate,notes
- Alerts: id,message,priority,type,time
- Reminders: id,village,recipient,channel,message,dueDate,status,sentAt
- Tasks: id,task,village,completed
- Activities: action,detail,time
- VaccinationTrends: month,vaccinations
- HealthStatus: name,value,fill
- MonthlyActivity: month,registered,vaccinated,alerts

## 9. Setup and Usage Guide
## 9.1 Apps Script Setup
1. Open script.google.com and create project
2. Paste code from apps-script/Code.gs
3. Deploy Web App as Me with access for intended users
4. Copy deployment exec URL

## 9.2 Frontend Setup
1. Add VITE_GAS_WEB_APP_URL in .env
2. Install dependencies
3. Start dev server
4. Open app and validate each module

## 9.3 Operational Validation Checklist
- Dashboard loads charts and summary cards
- Animals list and create work
- Farmers list and create work
- Vaccination mark-done updates status
- Pregnancy add/update works
- Alerts include base and outbreak items
- Reports show village analytics
- Reminders create/send works
- Field tasks toggle correctly

## 10. Concept Document Mapping and Progress
Original requirement categories mapped to implementation status.

### 10.1 Problem-Solving Goals
- Centralized cattle data: Implemented
- Vaccination miss reduction: Implemented
- Pregnancy lifecycle visibility: Implemented (basic-to-intermediate)
- Disease early warning: Implemented (rule-based)
- Village planning support: Implemented

### 10.2 User Coverage
- Farmers: Partial-to-strong support
- Vets: Operational support present
- Govt officers: Analytics support present
- Field workers: Task and update workflows present
- Admin/analysts: Reporting and trends present

### 10.3 Feature Coverage (from original concept)
- Cattle Registration: Implemented
- Pregnancy Tracking: Implemented
- Vaccination Records: Implemented
- Health Monitoring (symptom/treatment logs): Partial, still limited
- Veterinary Visit Records: Missing dedicated module
- Disease Alerts: Implemented with rule-based outbreak detection
- Village-wise Data: Implemented
- Notifications/Reminders: Implemented internal workflow
- AI Disease Prediction: Partial (rules, not model-based AI)

### 10.4 Dashboard Visibility Requirements
- Total registered cattle: Implemented
- Vaccinated count/coverage: Implemented
- Pregnant animals: Implemented in analytics/pregnancy views
- Sick/critical: Implemented
- Upcoming vaccination and alerts: Implemented
- Graphs/charts for trends and distributions: Implemented

### 10.5 Action Requirements
- Register new animal: Implemented
- Update health/vaccination: Implemented for vaccination, partial for health treatment logs
- Add pregnancy info: Implemented
- Schedule vet visits: Missing dedicated workflow
- Send alerts/reminders: Implemented as internal reminder queue
- Analyze trends: Implemented
- Download reports: UI level existed earlier, export engine not implemented

## 11. Current Completion Estimate
Estimated alignment with original concept: 82% to 88%

Main reasons not yet 90%+:
- No dedicated veterinary visit records module
- No full health treatment log lifecycle module (symptoms, diagnosis, treatment, follow-up)
- No external delivery integration for SMS/WhatsApp
- AI logic is rule-based, not predictive ML model
- No role-based authentication and authorization

## 12. Recommended Next Roadmap to Reach 90%+
1. Add Health Records module
- Symptoms, diagnosis, treatment, medication, recovery status

2. Add Veterinary Visit module
- Visit scheduling, doctor assignment, treatment notes, prescription

3. Add Notification Provider Integration
- Real send via provider APIs

4. Add Role-Based Access
- Farmer, Vet, Officer, Admin role permissions

5. Add report export backend
- PDF/CSV generation from filters

## 13. Troubleshooting Guide
### Issue: Dashboard stuck or blank
- Verify env URL
- Verify Apps Script deployment access
- Verify spreadsheet tab names and headers

### Issue: Chart errors
- Ensure HealthStatus fill is color string
- Frontend normalization now handles malformed values but data should still be corrected

### Issue: Data not updating
- Redeploy new Apps Script version after code changes
- Reload app and retry action

### Issue: Missing sheet errors
- Create required tabs exactly as named in this document

## 14. Notes on Data and Security
- Current system is suitable for pilot/staging use.
- Production use should include authentication, audit logs, and stricter access controls.
- Sensitive user data should be protected with role checks and secure transport policies.

## 15. Summary
The system now covers the majority of your original concept with real workflows for registration, vaccination, pregnancy tracking, outbreak alerts, village analytics, and reminders operations. The remaining gap is mainly advanced health treatment lifecycle, vet visit planning, external notification delivery, and role-based governance.
