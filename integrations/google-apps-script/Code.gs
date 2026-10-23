/**
 * RAPID pilot form endpoint — Google Apps Script + Google Sheets.
 *
 * Deploy this bound to a private spreadsheet as a web app (Execute as: Me,
 * Who has access: Anyone). Set the /exec URL as VITE_SUBMISSIONS_ENDPOINT.
 *
 * The client posts one form-encoded `payload` JSON envelope. This script
 * re-validates every rule, deduplicates by email (tester) or submission ID
 * (founder), applies the spam trap and a contact-level rate limit, and appends
 * to a private sheet. No custom dashboard is exposed.
 *
 * Keep the option codes below in sync with src/content/pilot.ts.
 */

var CONFIG = {
  TESTER_SHEET: 'Testers',
  FOUNDER_SHEET: 'Founders',
  SCHEMA_VERSION: '2026-10-20',
  PRIVACY_VERSION: '2026-10-20',
  RATE_LIMIT_MAX: 5,
  RATE_LIMIT_WINDOW_SECONDS: 600,
  MAX_PAYLOAD_CHARS: 20000,
};

var TESTER_HEADERS = [
  'Application ID',
  'Created UTC',
  'Status',
  'Full name',
  'Email',
  'Country',
  'Country code',
  'City or state',
  'Age range',
  'Age range code',
  'Age 18+ confirmed',
  'Main situation',
  'Main situation code',
  'Primary segment',
  'Other activities',
  'Other activity codes',
  'School or university',
  'Industry',
  'Industry code',
  'Industry other',
  'Interests',
  'Interest codes',
  'Interests other',
  'Recent frustration',
  'WhatsApp',
  'WhatsApp reminders',
  'Reminder opt-in at',
  'Reminder withdrawal at',
  'Contact suppression',
  'Heard about',
  'Heard about code',
  'Privacy acknowledged at',
  'Privacy version',
  'Schema version',
  'Submission ID',
  'Source',
  'Medium',
  'Campaign',
  'Landing path',
  'Review reason',
  'Reviewer',
  'Review time',
  'Outcome email sent at',
  'Delivery issue',
  'Group invite sent at',
  'Joined group at',
  'Notes',
];

var FOUNDER_HEADERS = [
  'Request ID',
  'Created UTC',
  'Status',
  'Full name',
  'WhatsApp',
  'Email',
  'What they want to test',
  'Audience',
  'Audience code',
  'Audience description',
  'Privacy acknowledged at',
  'Privacy version',
  'Schema version',
  'Submission ID',
  'Source',
  'Medium',
  'Campaign',
  'Landing path',
  'Owner',
  'Follow-up at',
  'Linked test ID',
  'Notes',
];

/* Keep these codes in sync with src/content/pilot.ts. */
var AGE_CODES = ['18_24', '25_29', '30_35', '36_plus'];
var SITUATION_CODES = [
  'early_undergraduate',
  'late_undergraduate',
  'recent_graduate',
  'employed',
  'entrepreneur',
  'other',
];
var INDUSTRY_CODES = [
  'education',
  'finance',
  'technology',
  'retail',
  'food_hospitality',
  'health',
  'transport',
  'creative_work',
  'other',
];
var INTEREST_CODES = [
  'education',
  'money_finance',
  'work_career',
  'food',
  'health_fitness',
  'transport',
  'housing',
  'technology',
  'entertainment',
  'shopping',
  'other',
];
var HEARD_CODES = ['friend', 'whatsapp_group', 'x', 'linkedin', 'school_or_hub', 'other'];
var AUDIENCE_CODES = [
  'students',
  'recent_graduates',
  'working_adults',
  'more_than_one',
  'someone_else',
];
var STUDYING_CODES = ['early_undergraduate', 'late_undergraduate', 'recent_graduate'];
var WORKING_CODES = ['employed', 'entrepreneur'];

var AGE_LABELS = {
  '18_24': '18–24',
  '25_29': '25–29',
  '30_35': '30–35',
  '36_plus': '36 or older',
};
var SITUATION_LABELS = {
  early_undergraduate: 'Early undergraduate',
  late_undergraduate: 'Late undergraduate',
  recent_graduate: 'Recent graduate',
  employed: 'Employed',
  entrepreneur: 'Entrepreneur or self-employed',
  other: 'Other',
};
var SEGMENT_LABELS = {
  early_undergraduate: 'Student — early undergraduate',
  late_undergraduate: 'Student — late undergraduate',
  recent_graduate: 'Recent graduate',
  employed: 'Working adult',
  entrepreneur: 'Entrepreneur or self-employed',
  other: 'Other',
};
var INDUSTRY_LABELS = {
  education: 'Education',
  finance: 'Finance',
  technology: 'Technology',
  retail: 'Retail',
  food_hospitality: 'Food and hospitality',
  health: 'Health',
  transport: 'Transport',
  creative_work: 'Creative work',
  other: 'Other',
};
var INTEREST_LABELS = {
  education: 'Education',
  money_finance: 'Money and finance',
  work_career: 'Work and career',
  food: 'Food',
  health_fitness: 'Health and fitness',
  transport: 'Transport',
  housing: 'Housing',
  technology: 'Technology',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other',
};
var HEARD_LABELS = {
  friend: 'Friend',
  whatsapp_group: 'WhatsApp group',
  x: 'X',
  linkedin: 'LinkedIn',
  school_or_hub: 'School or hub',
  other: 'Other',
};
var AUDIENCE_LABELS = {
  students: 'Students',
  recent_graduates: 'Recent graduates',
  working_adults: 'Working adults',
  more_than_one: 'More than one of these',
  someone_else: 'Someone else',
};

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var PHONE_RE = /^\+[1-9]\d{7,14}$/;
var NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

/* ------------------------------------------------------------------ */
/* Web app entry points                                                */
/* ------------------------------------------------------------------ */

function doGet() {
  return json_({ ok: true, service: 'rapid-pilot' });
}

function doPost(e) {
  try {
    if (!e || !e.parameter) return json_({ ok: false, error: 'bad_request' });

    // Lightweight warm-up used while the visitor types.
    if (e.parameter.warmup === '1') return json_({ ok: true, warm: true });

    var raw = e.parameter.payload;
    if (!raw) return json_({ ok: false, error: 'bad_request' });
    if (raw.length > CONFIG.MAX_PAYLOAD_CHARS) {
      return json_({ ok: false, error: 'bad_request' });
    }

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return json_({ ok: false, error: 'bad_request' });
    }

    // Hidden spam trap: acknowledge without writing anything.
    if (data.website) return json_({ ok: true, id: '', duplicate: false });

    if (data.formType === 'tester') return handleTester_(data);
    if (data.formType === 'founder') return handleFounder_(data);

    return json_({ ok: false, error: 'bad_request' });
  } catch (err) {
    console.error('RAPID submission failed: ' + (err && err.stack ? err.stack : err));
    return json_({ ok: false, error: 'server_error' });
  }
}

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

function handleTester_(data) {
  var check = validateTester_(data);
  if (!check.ok) {
    return json_({ ok: false, error: 'validation', fields: check.fields });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'server_error' });

  try {
    var sheet = ensureSheet_(CONFIG.TESTER_SHEET, TESTER_HEADERS);
    var email = normaliseEmail_(data.answers.email);

    // One application per normalised email. A repeat gets the same neutral
    // confirmation and never overwrites answers, status or permissions.
    var existing = findRow_(sheet, 'Email', email, 'Application ID');
    if (existing) return json_({ ok: true, id: existing.id, duplicate: true });

    var sameSubmission = findRow_(
      sheet,
      'Submission ID',
      String(data.submissionId || ''),
      'Application ID',
    );
    if (sameSubmission) {
      return json_({ ok: true, id: sameSubmission.id, duplicate: true });
    }

    if (!allowSubmission_('tester:' + email)) {
      return json_({ ok: false, error: 'rate_limited' });
    }

    var appId = makeId_('RAPID-T');
    var answers = data.answers;
    var otherActivities = normaliseCodeArray_(answers.otherActivities, SITUATION_CODES);
    var interests = normaliseCodeArray_(answers.interests, INTEREST_CODES);
    var industryCode = INDUSTRY_CODES.indexOf(answers.industry) >= 0 ? answers.industry : '';
    var heardCode = HEARD_CODES.indexOf(answers.hearAbout) >= 0 ? answers.hearAbout : '';
    var record = {};

    record['Application ID'] = appId;
    record['Created UTC'] = new Date().toISOString();
    record['Status'] = 'New';
    record['Full name'] = cleanText_(answers.fullName, 100);
    record['Email'] = email;
    record['Country'] = cleanText_(data.labels && data.labels.country, 100);
    record['Country code'] = cleanText_(answers.country, 2).toUpperCase();
    record['City or state'] = cleanText_(answers.cityState, 100);
    record['Age range'] = AGE_LABELS[answers.ageRange] || '';
    record['Age range code'] = answers.ageRange;
    record['Age 18+ confirmed'] = answers.ageConfirmed === true ? 'Yes' : 'No';
    record['Main situation'] = SITUATION_LABELS[answers.mainSituation] || '';
    record['Main situation code'] = answers.mainSituation;
    record['Primary segment'] = SEGMENT_LABELS[answers.mainSituation] || '';
    record['Other activities'] = otherActivities
      .map(function (code) {
        return SITUATION_LABELS[code];
      })
      .join(', ');
    record['Other activity codes'] = otherActivities.join(', ');
    record['School or university'] = cleanText_(answers.school, 150);
    record['Industry'] = INDUSTRY_LABELS[industryCode] || '';
    record['Industry code'] = industryCode;
    record['Industry other'] =
      industryCode === 'other' ? cleanText_(answers.industryOther, 100) : '';
    record['Interests'] = interests
      .map(function (code) {
        return INTEREST_LABELS[code];
      })
      .join(', ');
    record['Interest codes'] = interests.join(', ');
    record['Interests other'] = interests.indexOf('other') >= 0
      ? cleanText_(answers.interestsOther, 100)
      : '';
    record['Recent frustration'] = cleanText_(answers.frustration, 800);
    record['WhatsApp'] = cleanText_(normalisePhone_(answers.whatsapp), 20);
    record['WhatsApp reminders'] = answers.whatsappReminders === true ? 'Yes' : 'No';
    record['Reminder opt-in at'] =
      answers.whatsappReminders === true ? new Date().toISOString() : '';
    record['Reminder withdrawal at'] = '';
    record['Contact suppression'] = 'Active';
    record['Heard about'] = HEARD_LABELS[heardCode] || '';
    record['Heard about code'] = heardCode;
    record['Privacy acknowledged at'] = cleanText_(data.acknowledgedAt, 40);
    record['Privacy version'] = cleanText_(data.privacyVersion, 40);
    record['Schema version'] = cleanText_(data.schemaVersion, 40);
    record['Submission ID'] = cleanText_(data.submissionId, 64);
    record['Source'] = cleanSource_(data.source && data.source.source);
    record['Medium'] = cleanSource_(data.source && data.source.medium);
    record['Campaign'] = cleanSource_(data.source && data.source.campaign);
    record['Landing path'] = cleanPath_(data.source && data.source.landingPath);
    record['Review reason'] = '';
    record['Reviewer'] = '';
    record['Review time'] = '';
    record['Outcome email sent at'] = '';
    record['Delivery issue'] = '';
    record['Group invite sent at'] = '';
    record['Joined group at'] = '';
    record['Notes'] = '';

    appendRecord_(sheet, record);
    return json_({ ok: true, id: appId, duplicate: false });
  } finally {
    lock.releaseLock();
  }
}

function handleFounder_(data) {
  var check = validateFounder_(data);
  if (!check.ok) {
    return json_({ ok: false, error: 'validation', fields: check.fields });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'server_error' });

  try {
    var sheet = ensureSheet_(CONFIG.FOUNDER_SHEET, FOUNDER_HEADERS);

    // Network retries and double clicks reuse the submission ID, so they must
    // return the same record. A fresh intentional request gets a new ID and is
    // allowed even with the same phone or email.
    var existing = findRow_(
      sheet,
      'Submission ID',
      String(data.submissionId || ''),
      'Request ID',
    );
    if (existing) return json_({ ok: true, id: existing.id, duplicate: true });

    if (!allowSubmission_('founder:' + normalisePhone_(data.answers.whatsapp))) {
      return json_({ ok: false, error: 'rate_limited' });
    }

    var requestId = makeId_('RAPID-F');
    var answers = data.answers;
    var record = {};

    record['Request ID'] = requestId;
    record['Created UTC'] = new Date().toISOString();
    record['Status'] = 'New';
    record['Full name'] = cleanText_(answers.fullName, 100);
    record['WhatsApp'] = normalisePhone_(answers.whatsapp);
    record['Email'] = normaliseEmail_(answers.email);
    record['What they want to test'] = cleanText_(answers.testDescription, 500);
    record['Audience'] = AUDIENCE_LABELS[answers.audience] || '';
    record['Audience code'] = answers.audience;
    record['Audience description'] = cleanText_(answers.audienceDescription, 300);
    record['Privacy acknowledged at'] = cleanText_(data.acknowledgedAt, 40);
    record['Privacy version'] = cleanText_(data.privacyVersion, 40);
    record['Schema version'] = cleanText_(data.schemaVersion, 40);
    record['Submission ID'] = cleanText_(data.submissionId, 64);
    record['Source'] = cleanSource_(data.source && data.source.source);
    record['Medium'] = cleanSource_(data.source && data.source.medium);
    record['Campaign'] = cleanSource_(data.source && data.source.campaign);
    record['Landing path'] = cleanPath_(data.source && data.source.landingPath);
    record['Owner'] = '';
    record['Follow-up at'] = '';
    record['Linked test ID'] = '';
    record['Notes'] = '';

    appendRecord_(sheet, record);
    return json_({ ok: true, id: requestId, duplicate: false });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/* Server-side validation (mirrors src/lib/submission-schema.ts)       */
/* ------------------------------------------------------------------ */

function validateTester_(data) {
  var a = data && data.answers ? data.answers : {};
  var f = {};
  var email = normaliseEmail_(a.email);
  var confirm = normaliseEmail_(data && data.emailConfirm);
  var other = toArray_(a.otherActivities);
  var interests = toArray_(a.interests);

  if (!validName_(a.fullName)) f.fullName = 'Enter your full name (2–100 characters).';
  if (!validEmail_(email)) f.email = 'Enter a valid email address.';
  if (confirm !== email) f.emailConfirm = 'The email addresses do not match.';
  if (!/^[A-Z]{2}$/.test(String(a.country || ''))) f.country = 'Select your country.';
  if (!validLength_(data && data.labels && data.labels.country, 2, 100)) {
    f.country = 'Select your country.';
  }
  if (!validLength_(a.cityState, 2, 100)) f.cityState = 'Enter your city or state (2–100 characters).';
  if (AGE_CODES.indexOf(a.ageRange) < 0) f.ageRange = 'Select your age range.';
  if (a.ageConfirmed !== true) f.ageConfirmed = 'Confirm that you are 18 or older.';
  if (SITUATION_CODES.indexOf(a.mainSituation) < 0) {
    f.mainSituation = 'Select your main situation.';
  }
  if (other.length > 5) f.otherActivities = 'Select fewer activities.';
  if (other.some(function (code) { return SITUATION_CODES.indexOf(code) < 0; })) {
    f.otherActivities = 'Select a valid activity.';
  }
  if (other.indexOf(a.mainSituation) >= 0) {
    f.otherActivities = 'Other activities cannot repeat your main situation.';
  }
  if (isStudying_(a.mainSituation, other) && !validLength_(a.school, 2, 150)) {
    f.school = 'Enter your school or university (2–150 characters).';
  }
  if (isWorking_(a.mainSituation, other)) {
    if (INDUSTRY_CODES.indexOf(a.industry) < 0) f.industry = 'Select your industry.';
    if (a.industry === 'other' && !validLength_(a.industryOther, 2, 100)) {
      f.industryOther = 'Describe your industry (2–100 characters).';
    }
  }
  if (interests.length < 1 || interests.length > 3) f.interests = 'Choose 1–3 interests.';
  if (interests.some(function (code) { return INTEREST_CODES.indexOf(code) < 0; })) {
    f.interests = 'Select a valid interest.';
  }
  if (uniqueCount_(interests) !== interests.length) f.interests = 'Choose each interest only once.';
  if (!validLength_(a.frustration, 50, 800)) {
    f.frustration = 'Write 50–800 characters about a recent problem.';
  }
  var phone = normalisePhone_(a.whatsapp);
  if (a.whatsapp && !PHONE_RE.test(phone)) {
    f.whatsapp = 'Enter a valid number with a country code.';
  }
  if (a.whatsappReminders === true && !PHONE_RE.test(phone)) {
    f.whatsapp = 'Add a valid WhatsApp number to receive reminders.';
  }
  if (a.hearAbout && HEARD_CODES.indexOf(a.hearAbout) < 0) {
    f.hearAbout = 'Select an option.';
  }
  if (a.privacyAck !== true) f.privacyAck = 'Please confirm that you have read the Privacy Policy.';
  if (!String(data.submissionId || '').trim()) f.submissionId = 'Missing submission identifier.';
  if (!String(data.privacyVersion || '').trim()) f.privacyVersion = 'Missing privacy version.';
  if (!String(data.schemaVersion || '').trim()) f.schemaVersion = 'Missing schema version.';

  return Object.keys(f).length ? { ok: false, fields: f } : { ok: true };
}

function validateFounder_(data) {
  var a = data && data.answers ? data.answers : {};
  var f = {};
  var phone = normalisePhone_(a.whatsapp);
  var email = normaliseEmail_(a.email);

  if (!validName_(a.fullName)) f.fullName = 'Enter your full name (2–100 characters).';
  if (!PHONE_RE.test(phone)) f.whatsapp = 'Enter a valid number with a country code.';
  if (email && !validEmail_(email)) f.email = 'Enter a valid email address.';
  if (!validLength_(a.testDescription, 20, 500)) {
    f.testDescription = 'Describe what you want to test in 20–500 characters.';
  }
  if (AUDIENCE_CODES.indexOf(a.audience) < 0) f.audience = 'Select who the test is for.';
  if (
    (a.audience === 'more_than_one' || a.audience === 'someone_else') &&
    !validLength_(a.audienceDescription, 5, 300)
  ) {
    f.audienceDescription = 'Describe who you need to reach (5–300 characters).';
  }
  if (a.privacyAck !== true) f.privacyAck = 'Please confirm that you have read the Privacy Policy.';
  if (!String(data.submissionId || '').trim()) f.submissionId = 'Missing submission identifier.';
  if (!String(data.privacyVersion || '').trim()) f.privacyVersion = 'Missing privacy version.';
  if (!String(data.schemaVersion || '').trim()) f.schemaVersion = 'Missing schema version.';

  return Object.keys(f).length ? { ok: false, fields: f } : { ok: true };
}

function validName_(value) {
  var name = String(value || '').trim();
  return name.length >= 2 && name.length <= 100 && NAME_RE.test(name);
}

function validEmail_(value) {
  var email = String(value || '').trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}

function validLength_(value, min, max) {
  var length = String(value || '').trim().length;
  return length >= min && length <= max;
}

function isStudying_(main, others) {
  if (STUDYING_CODES.indexOf(main) >= 0) return true;
  return others.some(function (code) {
    return STUDYING_CODES.indexOf(code) >= 0;
  });
}

function isWorking_(main, others) {
  if (WORKING_CODES.indexOf(main) >= 0) return true;
  return others.some(function (code) {
    return WORKING_CODES.indexOf(code) >= 0;
  });
}

function uniqueCount_(values) {
  var seen = {};
  var count = 0;
  values.forEach(function (value) {
    if (!seen[value]) {
      seen[value] = true;
      count += 1;
    }
  });
  return count;
}

function toArray_(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function normaliseCodeArray_(value, allowed) {
  var out = [];
  toArray_(value).forEach(function (code) {
    if (allowed.indexOf(code) >= 0 && out.indexOf(code) < 0) out.push(code);
  });
  return out;
}

function normaliseEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalisePhone_(value) {
  var trimmed = String(value || '').trim();
  if (!trimmed) return '';
  var cleaned = trimmed.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.charAt(0) === '+') return '+' + cleaned.slice(1).replace(/\+/g, '');
  return '+' + cleaned.replace(/\+/g, '');
}

function cleanText_(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function cleanSource_(value) {
  return String(value || '')
    .replace(/[^\w.-]/g, '')
    .slice(0, 60);
}

function cleanPath_(value) {
  return String(value || '')
    .split('?')[0]
    .replace(/[^\w/.-]/g, '')
    .slice(0, 120);
}

/* ------------------------------------------------------------------ */
/* Rate limit — per contact, because Apps Script has no visitor IP     */
/* ------------------------------------------------------------------ */

function allowSubmission_(contactKey) {
  var cache = CacheService.getScriptCache();
  var key = 'rapid-rate-' + hash_(contactKey);
  var current = Number(cache.get(key) || '0') + 1;
  cache.put(key, String(current), CONFIG.RATE_LIMIT_WINDOW_SECONDS);
  return current <= CONFIG.RATE_LIMIT_MAX;
}

function hash_(value) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8,
  );
  return digest
    .map(function (byte) {
      var v = (byte & 0xff) + 0x100;
      return v.toString(16).slice(1);
    })
    .join('');
}

/* ------------------------------------------------------------------ */
/* Sheets                                                              */
/* ------------------------------------------------------------------ */

function ensureSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  applyValidations_(sheet);
  return sheet;
}

function applyValidations_(sheet) {
  var name = sheet.getName();
  var headers = getHeaders_(sheet);
  if (name === CONFIG.TESTER_SHEET) {
    setValidation_(sheet, headers, 'Status', [
      'New',
      'Needs clarification',
      'Accepted',
      'Not currently eligible',
      'Withdrawn',
    ]);
    setValidation_(sheet, headers, 'Contact suppression', ['Active', 'Suppressed']);
    setValidation_(sheet, headers, 'WhatsApp reminders', ['Yes', 'No']);
  }
  if (name === CONFIG.FOUNDER_SHEET) {
    setValidation_(sheet, headers, 'Status', [
      'New',
      'Needs clarification',
      'Suitable for pilot',
      'Outside current pilot',
      'Withdrawn',
    ]);
  }
}

function setValidation_(sheet, headers, header, values) {
  var index = headers.indexOf(header);
  if (index < 0) return;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, index + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function getHeaders_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function appendRecord_(sheet, record) {
  var headers = getHeaders_(sheet);
  var row = headers.map(function (header) {
    return safeCell_(record[header] == null ? '' : record[header]);
  });
  var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
  range.setNumberFormat('@');
  range.setValues([row]);
}

function findRow_(sheet, header, value, idHeader) {
  var headers = getHeaders_(sheet);
  var index = headers.indexOf(header);
  var idIndex = headers.indexOf(idHeader);
  if (index < 0 || sheet.getLastRow() < 2) return null;

  var needle = String(value || '').toLowerCase();
  if (!needle) return null;
  var values = sheet.getRange(2, index + 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i += 1) {
    if (String(values[i][0] || '').toLowerCase() === needle) {
      var id = idIndex >= 0 ? sheet.getRange(i + 2, idIndex + 1).getDisplayValue() : '';
      return { row: i + 2, id: id };
    }
  }
  return null;
}

function makeId_(prefix) {
  var date = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
  var random = Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  return prefix + '-' + date + '-' + random;
}

/** Prevent a spreadsheet formula in a submitted text field. */
function safeCell_(value) {
  var text = value == null ? '' : String(value);
  // A leading "=" is evaluated as a formula even when the cell is formatted as
  // text. The other CSV-injection starters (+ - @) are neutralised in
  // csvCell_ instead: prefixing them here would corrupt every international
  // phone number, which always starts with "+".
  if (/^[=\t\r]/.test(text)) return "'" + text;
  return text;
}

/* ------------------------------------------------------------------ */
/* Private team menu: exports, invitation list, suppression, deletion  */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('RAPID')
    .addItem('Export all testers (CSV)', 'exportTesters_')
    .addItem('Export accepted testers (CSV)', 'exportInvitations_')
    .addItem('Export founder requests (CSV)', 'exportFounders_')
    .addSeparator()
    .addItem('Suppress tester by email…', 'suppressTester_')
    .addItem('Delete tester by email…', 'deleteTester_')
    .addToUi();
}

function exportTesters_() {
  exportCsv_(CONFIG.TESTER_SHEET, 'rapid-testers', function () {
    return true;
  });
}

function exportInvitations_() {
  exportCsv_(CONFIG.TESTER_SHEET, 'rapid-invitations', function (row, headers) {
    var status = String(row[headers.indexOf('Status')] || '');
    var suppression = String(row[headers.indexOf('Contact suppression')] || '');
    return status === 'Accepted' && suppression !== 'Suppressed';
  });
}

function exportFounders_() {
  exportCsv_(CONFIG.FOUNDER_SHEET, 'rapid-founder-requests', function () {
    return true;
  });
}

function exportCsv_(sheetName, filenamePrefix, filter) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No records to export.');
    return;
  }

  var headers = getHeaders_(sheet);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  var lines = [headers.map(csvCell_).join(',')];

  rows.forEach(function (row) {
    if (!filter(row, headers)) return;
    lines.push(row.map(csvCell_).join(','));
  });

  var stamp = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd-HHmm');
  var file = DriveApp.createFile(filenamePrefix + '-' + stamp + '.csv', lines.join('\r\n'), 'text/csv');
  SpreadsheetApp.getUi().alert(
    'CSV created',
    'Open the file: ' + file.getUrl(),
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

function csvCell_(value) {
  var text = value == null ? '' : String(value);
  // Neutralise spreadsheet formula starters before applying CSV quoting.
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  if (/[",\r\n]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function suppressTester_() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Suppress tester', 'Enter the tester email address:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var email = normaliseEmail_(response.getResponseText());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.TESTER_SHEET);
  var found = sheet ? findRow_(sheet, 'Email', email, 'Application ID') : null;
  if (!found) {
    ui.alert('No tester found for ' + email + '.');
    return;
  }

  var headers = getHeaders_(sheet);
  var now = new Date().toISOString();
  setCell_(sheet, headers, found.row, 'Status', 'Withdrawn');
  setCell_(sheet, headers, found.row, 'Contact suppression', 'Suppressed');
  setCell_(sheet, headers, found.row, 'Reminder withdrawal at', now);
  setCell_(sheet, headers, found.row, 'WhatsApp reminders', 'No');
  setCell_(sheet, headers, found.row, 'Notes', 'Suppressed ' + now);
  ui.alert('Tester suppressed and removed from invitation exports.');
}

function deleteTester_() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Delete tester', 'Enter the tester email address:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var email = normaliseEmail_(response.getResponseText());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.TESTER_SHEET);
  var found = sheet ? findRow_(sheet, 'Email', email, 'Application ID') : null;
  if (!found) {
    ui.alert('No tester found for ' + email + '.');
    return;
  }

  var confirm = ui.alert(
    'Delete this record?',
    'This removes the live row for ' + email + '. Backups may persist for the backup period. Continue?',
    ui.ButtonSet.YES_NO,
  );
  if (confirm !== ui.Button.YES) return;
  sheet.deleteRow(found.row);
  ui.alert('Tester record deleted.');
}

function setCell_(sheet, headers, row, header, value) {
  var index = headers.indexOf(header);
  if (index < 0) return;
  var range = sheet.getRange(row, index + 1);
  range.setNumberFormat('@');
  range.setValue(safeCell_(value));
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

/** Run once from the Apps Script editor after installing this file. */
function setup() {
  ensureSheet_(CONFIG.TESTER_SHEET, TESTER_HEADERS);
  ensureSheet_(CONFIG.FOUNDER_SHEET, FOUNDER_HEADERS);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'RAPID sheets are ready. Open the RAPID menu for exports and suppression.',
    'RAPID pilot',
    8,
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
