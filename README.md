# Herd Buddy Dashboard

Livestock management dashboard built with Vite + React + TypeScript + shadcn/ui.

This project now supports a Google Apps Script backend so data can be read/written from Google Sheets.

Detailed product and feature documentation:
- PROJECT_FEATURES_COMPLETE_GUIDE.md

## Run Frontend

```bash
npm install
npm run dev
```

## Connect to Apps Script

1. Follow setup in `apps-script/README.md`.
2. Create `.env` from `.env.example` and set `VITE_GAS_WEB_APP_URL`.
3. Restart dev server after changing env.

## Implemented Live Modules

- Dashboard (`dashboard.get`)
- Animals list + create + profile (`animals.list`, `animals.create`, `animals.profile`)
- Farmers list + create (`farmers.list`, `farmers.create`)
- Vaccinations list + mark done (`vaccinations.list`, `vaccinations.markDone`)
- Pregnancy tracking workflow (`pregnancy.list`, `pregnancy.create`, `pregnancy.updateStatus`)
- Alerts list with auto outbreak detection (`alerts.list`)
- Village-wise analytics (`analytics.villageInsights`)
- Reminder workflow (`reminders.list`, `reminders.create`, `reminders.send`)
- Field tasks list + toggle (`tasks.list`, `tasks.toggle`)

Apps Script URL is now required. Mock/demo fallback has been removed.
