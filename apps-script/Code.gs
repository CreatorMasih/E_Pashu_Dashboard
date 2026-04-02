var SHEETS = {
  ANIMALS: "Animals",
  FARMERS: "Farmers",
  VACCINATIONS: "Vaccinations",
  BREEDING: "Breeding",
  PREGNANCY: "Pregnancy",
  ALERTS: "Alerts",
  REMINDERS: "Reminders",
  TASKS: "Tasks",
  ACTIVITIES: "Activities",
  TRENDS: "VaccinationTrends",
  HEALTH_STATUS: "HealthStatus",
  MONTHLY_ACTIVITY: "MonthlyActivity"
};

// Primary spreadsheet ID. Update this only if you move data to another sheet.
var DEFAULT_SPREADSHEET_ID = "1docMZbyyAt1eEbWM3BvvzfaR8UXx88vsHvt28CMz6DE";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    var action = body.action;
    var payload = body.payload || {};

    var data;
    switch (action) {
      case "dashboard.get":
        data = getDashboardData_();
        break;
      case "animals.list":
        data = listRows_(SHEETS.ANIMALS);
        break;
      case "animals.create":
        data = createAnimal_(payload.input);
        break;
      case "animals.profile":
        data = getAnimalProfile_(payload.id);
        break;
      case "farmers.list":
        data = listRows_(SHEETS.FARMERS);
        break;
      case "farmers.create":
        data = createFarmer_(payload.input);
        break;
      case "vaccinations.list":
        data = listRows_(SHEETS.VACCINATIONS);
        break;
      case "vaccinations.markDone":
        data = markVaccinationDone_(payload.animalId, payload.type);
        break;
      case "breeding.list":
        data = listRows_(SHEETS.BREEDING);
        break;
      case "pregnancy.list":
        data = listRows_(SHEETS.PREGNANCY);
        break;
      case "pregnancy.create":
        data = createPregnancyRecord_(payload.input);
        break;
      case "pregnancy.updateStatus":
        data = updatePregnancyStatus_(payload.id, payload.status);
        break;
      case "alerts.list":
        data = getAlertsWithOutbreaks_();
        break;
      case "analytics.villageInsights":
        data = getVillageInsights_();
        break;
      case "reminders.list":
        data = getReminders_();
        break;
      case "reminders.create":
        data = createReminder_(payload.input);
        break;
      case "reminders.send":
        data = sendReminder_(payload.id);
        break;
      case "tasks.list":
        data = listRows_(SHEETS.TASKS).map(function (row) {
          row.id = Number(row.id);
          row.completed = toBool_(row.completed);
          return row;
        });
        break;
      case "tasks.toggle":
        data = toggleTask_(payload.id);
        break;
      default:
        return jsonResponse_(false, null, "Unknown action: " + action);
    }

    return jsonResponse_(true, data, null);
  } catch (error) {
    return jsonResponse_(false, null, error.message || String(error));
  }
}

function getDashboardData_() {
  return {
    vaccinationTrends: listRows_(SHEETS.TRENDS),
    healthStatusData: listRows_(SHEETS.HEALTH_STATUS),
    monthlyActivity: listRows_(SHEETS.MONTHLY_ACTIVITY),
    activities: listRows_(SHEETS.ACTIVITIES)
  };
}

function createAnimal_(input) {
  if (!input || !input.id) {
    throw new Error("Invalid animal input");
  }

  appendRow_(SHEETS.ANIMALS, {
    id: input.id,
    breed: input.breed,
    age: Number(input.age || 0),
    owner: input.owner,
    status: input.status
  });

  return input;
}

function getAnimalProfile_(id) {
  var animals = listRows_(SHEETS.ANIMALS);
  var animal = animals.find(function (item) {
    return item.id === id;
  });

  if (!animal) {
    throw new Error("Animal not found: " + id);
  }

  var vaccHistory = listRows_(SHEETS.VACCINATIONS).filter(function (item) {
    return item.animalId === id;
  });

  var breedingHistory = listRows_(SHEETS.BREEDING)
    .filter(function (item) {
      return item.animalId === id;
    })
    .map(function (item) {
      return {
        date: item.inseminationDate,
        type: "AI",
        status: item.status,
        expected: item.expectedCalving
      };
    });

  return {
    animal: animal,
    vaccHistory: vaccHistory,
    breedingHistory: breedingHistory,
    reminders: [
      { text: "FMD booster due", date: "2026-06-15" },
      { text: "Annual health check", date: "2026-04-20" }
    ]
  };
}

function createFarmer_(input) {
  if (!input || !input.name) {
    throw new Error("Invalid farmer input");
  }

  var normalizedPhone = normalizeIndianMobile_(input.phone);
  if (!isValidIndianMobile_(normalizedPhone)) {
    throw new Error("Invalid Indian mobile number");
  }

  appendRow_(SHEETS.FARMERS, {
    name: input.name,
    phone: "+91" + normalizedPhone,
    village: input.village,
    animals: Number(input.animals || 0)
  });

  return {
    name: input.name,
    phone: "+91" + normalizedPhone,
    village: input.village,
    animals: Number(input.animals || 0)
  };
}

function createPregnancyRecord_(input) {
  if (!input || !input.animalId) {
    throw new Error("Invalid pregnancy input");
  }

  var id = "PRG-" + new Date().getTime();
  var row = {
    id: id,
    animalId: input.animalId,
    village: input.village || "Unknown",
    inseminationDate: input.inseminationDate || "",
    expectedCalving: input.expectedCalving || "",
    status: input.status || "Inseminated",
    lastCheckDate: input.lastCheckDate || "",
    notes: input.notes || ""
  };

  appendRow_(SHEETS.PREGNANCY, row);
  return row;
}

function updatePregnancyStatus_(id, status) {
  if (!id || !status) {
    throw new Error("Missing id or status");
  }

  var sheet = getSheet_(SHEETS.PREGNANCY);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No pregnancy records found");
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var statusIdx = findColumnIndex_(headers, "status");
  var checkIdx = findColumnIndex_(headers, "lastCheckDate");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      if (checkIdx >= 0) {
        sheet.getRange(i + 1, checkIdx + 1).setValue(formatDate_(new Date()));
      }

      var updated = values[i];
      return {
        id: String(updated[idIdx]),
        animalId: String(updated[findColumnIndex_(headers, "animalId")]),
        village: String(updated[findColumnIndex_(headers, "village")]),
        inseminationDate: String(updated[findColumnIndex_(headers, "inseminationDate")]),
        expectedCalving: String(updated[findColumnIndex_(headers, "expectedCalving")]),
        status: status,
        lastCheckDate: formatDate_(new Date()),
        notes: String(updated[findColumnIndex_(headers, "notes")])
      };
    }
  }

  throw new Error("Pregnancy record not found");
}

function getAlertsWithOutbreaks_() {
  var baseAlerts = listRows_(SHEETS.ALERTS).map(function (row, idx) {
    row.id = Number(row.id) || idx + 1;
    return row;
  });

  var outbreaks = detectOutbreakAlerts_();
  return baseAlerts.concat(outbreaks);
}

function detectOutbreakAlerts_() {
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    farmerVillageMap[normalizePersonKey_(f.name)] = normalizeVillage_(f.village);
  });

  var criticalByVillage = {};
  animals.forEach(function (a) {
    if (String(a.status) !== "Critical") {
      return;
    }
    var village = farmerVillageMap[normalizePersonKey_(a.owner)] || "Unknown";
    criticalByVillage[village] = (criticalByVillage[village] || 0) + 1;
  });

  var alerts = [];
  var index = 0;
  Object.keys(criticalByVillage).forEach(function (village) {
    var count = criticalByVillage[village];
    if (count >= 2) {
      index += 1;
      alerts.push({
        id: 9000 + index,
        message: "Possible disease cluster in " + village + ": " + count + " critical animals",
        priority: count >= 3 ? "High" : "Medium",
        type: "AI Alert",
        time: "Auto-detected"
      });
    }
  });

  return alerts;
}

function getVillageInsights_() {
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);
  var vaccinations = listRows_(SHEETS.VACCINATIONS);
  var pregnancy = listRows_(SHEETS.PREGNANCY);

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    farmerVillageMap[normalizePersonKey_(f.name)] = normalizeVillage_(f.village);
  });

  var insightMap = {};

  function ensureVillage_(village) {
    if (!insightMap[village]) {
      insightMap[village] = {
        village: village,
        totalAnimals: 0,
        criticalAnimals: 0,
        pendingVaccinations: 0,
        pregnantAnimals: 0,
        vaccinationCoverage: 0,
        _vaxDone: 0,
        _vaxTotal: 0
      };
    }
    return insightMap[village];
  }

  var animalVillageMap = {};
  animals.forEach(function (a) {
    var village = farmerVillageMap[normalizePersonKey_(a.owner)] || "Unknown";
    animalVillageMap[String(a.id)] = village;

    var node = ensureVillage_(village);
    node.totalAnimals += 1;
    if (String(a.status) === "Critical") {
      node.criticalAnimals += 1;
    }
  });

  vaccinations.forEach(function (v) {
    var village = animalVillageMap[String(v.animalId)] || "Unknown";
    var node = ensureVillage_(village);
    node._vaxTotal += 1;
    if (String(v.status) === "Done") {
      node._vaxDone += 1;
    } else {
      node.pendingVaccinations += 1;
    }
  });

  pregnancy.forEach(function (p) {
    var village = normalizeVillage_(p.village || animalVillageMap[String(p.animalId)] || "Unknown");
    var node = ensureVillage_(village);
    var status = String(p.status || "");
    if (status === "Pregnant" || status === "Due Soon") {
      node.pregnantAnimals += 1;
    }
  });

  return Object.keys(insightMap).map(function (village) {
    var node = insightMap[village];
    node.vaccinationCoverage = node._vaxTotal ? Math.round((node._vaxDone / node._vaxTotal) * 100) : 0;
    delete node._vaxDone;
    delete node._vaxTotal;
    return node;
  });
}

function getReminders_() {
  var manual = listRows_(SHEETS.REMINDERS);
  var auto = buildAutoVaccinationReminders_();
  return manual.concat(auto);
}

function buildAutoVaccinationReminders_() {
  var vaccinations = listRows_(SHEETS.VACCINATIONS);
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);

  var animalOwnerMap = {};
  animals.forEach(function (a) {
    animalOwnerMap[String(a.id)] = String(a.owner || "").trim();
  });

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    farmerVillageMap[normalizePersonKey_(f.name)] = normalizeVillage_(f.village);
  });

  return vaccinations
    .filter(function (v) {
      return String(v.status) !== "Done";
    })
    .slice(0, 50)
    .map(function (v, idx) {
      var recipient = animalOwnerMap[String(v.animalId)] || "Farmer";
      var village = farmerVillageMap[normalizePersonKey_(recipient)] || "Unknown";
      return {
        id: "AUTO-" + (idx + 1),
        village: village,
        recipient: recipient,
        channel: "SMS",
        message: "Vaccination due: " + String(v.type) + " for " + String(v.animalId),
        dueDate: String(v.date || ""),
        status: "Pending",
        sentAt: ""
      };
    });
}

function createReminder_(input) {
  if (!input || !input.recipient || !input.message) {
    throw new Error("Invalid reminder input");
  }

  var row = {
    id: "REM-" + new Date().getTime(),
    village: input.village || "Unknown",
    recipient: input.recipient,
    channel: input.channel || "SMS",
    message: input.message,
    dueDate: input.dueDate || "",
    status: "Pending",
    sentAt: ""
  };

  appendRow_(SHEETS.REMINDERS, row);
  return row;
}

function sendReminder_(id) {
  var sheet = getSheet_(SHEETS.REMINDERS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No reminders found");
  }

  var headers = values[0];
  var idIdx = headers.indexOf("id");
  var statusIdx = headers.indexOf("status");
  var sentAtIdx = headers.indexOf("sentAt");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      var sentAt = new Date().toISOString();
      if (statusIdx >= 0) {
        sheet.getRange(i + 1, statusIdx + 1).setValue("Sent");
      }
      if (sentAtIdx >= 0) {
        sheet.getRange(i + 1, sentAtIdx + 1).setValue(sentAt);
      }

      return {
        id: String(values[i][idIdx]),
        village: String(values[i][headers.indexOf("village")]),
        recipient: String(values[i][headers.indexOf("recipient")]),
        channel: String(values[i][headers.indexOf("channel")]),
        message: String(values[i][headers.indexOf("message")]),
        dueDate: String(values[i][headers.indexOf("dueDate")]),
        status: "Sent",
        sentAt: sentAt
      };
    }
  }

  throw new Error("Reminder not found");
}

function markVaccinationDone_(animalId, type) {
  var sheet = getSheet_(SHEETS.VACCINATIONS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var animalIdIdx = findColumnIndex_(headers, "animalId");
  var typeIdx = findColumnIndex_(headers, "type");
  var statusIdx = findColumnIndex_(headers, "status");

  for (var i = 1; i < values.length; i++) {
    if (values[i][animalIdIdx] === animalId && values[i][typeIdx] === type) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("Done");
      return {
        animalId: animalId,
        type: type,
        date: values[i][findColumnIndex_(headers, "date")],
        status: "Done"
      };
    }
  }

  throw new Error("Vaccination record not found");
}

function toggleTask_(id) {
  var sheet = getSheet_(SHEETS.TASKS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var completedIdx = findColumnIndex_(headers, "completed");

  for (var i = 1; i < values.length; i++) {
    if (Number(values[i][idIdx]) === Number(id)) {
      var next = !toBool_(values[i][completedIdx]);
      sheet.getRange(i + 1, completedIdx + 1).setValue(next);
      return {
        id: Number(values[i][idIdx]),
        task: values[i][findColumnIndex_(headers, "task")],
        village: values[i][findColumnIndex_(headers, "village")],
        completed: next
      };
    }
  }

  throw new Error("Task not found");
}

function listRows_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];
  return values.slice(1).map(function (row) {
    var item = {};
    headers.forEach(function (header, idx) {
      item[normalizeKey_(header)] = row[idx];
    });
    return item;
  });
}

function appendRow_(sheetName, data) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getDataRange().getValues()[0];
  var row = headers.map(function (header) {
    var normalized = normalizeKey_(header);
    return data[normalized] !== undefined ? data[normalized] : "";
  });
  sheet.appendRow(row);
}

function getSheet_(sheetName) {
  var spreadsheetId =
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
    DEFAULT_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in Script Properties");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Missing sheet: " + sheetName);
  }

  return sheet;
}

function toBool_(value) {
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true";
}

function normalizeKey_(header) {
  var raw = String(header || "").trim();
  if (!raw) {
    return "";
  }

  if (raw === raw.toUpperCase()) {
    return raw.toLowerCase();
  }

  if (raw.indexOf(" ") >= 0 || raw.indexOf("_") >= 0 || raw.indexOf("-") >= 0) {
    var parts = raw
      .replace(/[_-]+/g, " ")
      .split(/\s+/)
      .filter(function (part) {
        return part;
      })
      .map(function (part) {
        return part.toLowerCase();
      });

    return parts
      .map(function (part, idx) {
        if (idx === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join("");
  }

  return raw.charAt(0).toLowerCase() + raw.slice(1);
}

function findColumnIndex_(headers, key) {
  var normalizedKey = normalizeKey_(key);
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey_(headers[i]) === normalizedKey) {
      return i;
    }
  }
  throw new Error("Missing required column: " + key);
}

function formatDate_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function normalizePersonKey_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeVillage_(value) {
  var text = String(value || "").trim();
  if (!text) {
    return "Unknown";
  }

  return text
    .toLowerCase()
    .split(/\s+/)
    .map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function normalizeIndianMobile_(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.indexOf("91") === 0) {
    return digits.slice(2);
  }
  return digits;
}

function isValidIndianMobile_(value) {
  return /^[6-9]\d{9}$/.test(String(value || ""));
}

function jsonResponse_(success, data, error) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, data: data, error: error }))
    .setMimeType(ContentService.MimeType.JSON);
}
