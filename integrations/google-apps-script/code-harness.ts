/**
 * Minimal Google Apps Script emulator so `Code.gs` can be exercised by Vitest
 * without a Google account. It implements only the SpreadsheetApp / Cache /
 * Lock / Drive / Utilities surface that Code.gs actually uses.
 */
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createContext, runInContext } from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Cell = string;

const HEADER_ROW = 1;

export class FakeRange {
  constructor(
    private sheet: FakeSheet,
    private row: number,
    private col: number,
    private numRows: number,
    private numCols: number,
  ) {}

  getValues(): Cell[][] {
    return Array.from({ length: this.numRows }, (_, r) =>
      Array.from({ length: this.numCols }, (_, c) =>
        this.sheet.read(this.row + r, this.col + c),
      ),
    );
  }

  getDisplayValues(): Cell[][] {
    return this.getValues();
  }

  getDisplayValue(): Cell {
    return this.sheet.read(this.row, this.col);
  }

  setValues(values: Cell[][]): this {
    values.forEach((cells, r) => {
      cells.forEach((value, c) => {
        this.sheet.write(this.row + r, this.col + c, String(value ?? ''));
      });
    });
    return this;
  }

  setValue(value: Cell): this {
    this.sheet.write(this.row, this.col, String(value ?? ''));
    return this;
  }

  setNumberFormat(): this {
    return this;
  }

  setDataValidation(): this {
    return this;
  }

  setFontWeight(): this {
    return this;
  }
}

export class FakeSheet {
  rows: Cell[][] = [];
  maxRows = 1000;

  constructor(public name: string) {}

  getName(): string {
    return this.name;
  }

  read(row: number, col: number): Cell {
    return this.rows[row - 1]?.[col - 1] ?? '';
  }

  write(row: number, col: number, value: Cell): void {
    while (this.rows.length < row) this.rows.push([]);
    const target = this.rows[row - 1]!;
    while (target.length < col) target.push('');
    target[col - 1] = value;
  }

  getLastRow(): number {
    for (let i = this.rows.length - 1; i >= 0; i -= 1) {
      if (this.rows[i]?.some((cell) => cell !== '')) return i + 1;
    }
    return 0;
  }

  getLastColumn(): number {
    return this.rows.reduce((max, row) => Math.max(max, row.length), 0);
  }

  getMaxRows(): number {
    return this.maxRows;
  }

  getRange(row: number, col: number, numRows = 1, numCols = 1): FakeRange {
    return new FakeRange(this, row, col, numRows, numCols);
  }

  setFrozenRows(): void {}

  deleteRow(row: number): void {
    this.rows.splice(row - 1, 1);
  }

  headers(): Cell[] {
    return this.rows[HEADER_ROW - 1] ?? [];
  }

  indexOf(header: string): number {
    return this.headers().indexOf(header);
  }

  /** Data rows as header-keyed objects, excluding the header row. */
  records(): Record<string, Cell>[] {
    const headers = this.headers();
    return this.rows.slice(HEADER_ROW).map((row) => {
      const record: Record<string, Cell> = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? '';
      });
      return record;
    });
  }
}

class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>();
  toasts: string[] = [];

  getSheetByName(name: string): FakeSheet | null {
    return this.sheets.get(name) ?? null;
  }

  insertSheet(name: string): FakeSheet {
    const sheet = new FakeSheet(name);
    this.sheets.set(name, sheet);
    return sheet;
  }

  toast(message: string): void {
    this.toasts.push(message);
  }
}

export interface HarnessFile {
  name: string;
  content: string;
  mime: string;
}

export interface HarnessUi {
  promptResponse: string;
  alertConfirm: boolean;
  menuItems: string[];
  alerts: string[][];
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDate(date: Date, _timeZone: string, format: string): string {
  const tokens: Record<string, string> = {
    yyyy: String(date.getUTCFullYear()),
    MM: pad(date.getUTCMonth() + 1),
    dd: pad(date.getUTCDate()),
    HH: pad(date.getUTCHours()),
    mm: pad(date.getUTCMinutes()),
  };
  return format.replace(/yyyy|MM|dd|HH|mm/g, (token) => tokens[token] ?? token);
}

export interface Api {
  doGet(): { getContent(): string };
  doPost(event: { parameter?: Record<string, string> }): { getContent(): string };
  setup(): void;
  onOpen(): void;
  exportTesters_(): void;
  exportInvitations_(): void;
  exportFounders_(): void;
  suppressTester_(): void;
  deleteTester_(): void;
  csvCell_(value: unknown): string;
  safeCell_(value: unknown): string;
  setCell_(
    sheet: unknown,
    headers: string[],
    row: number,
    header: string,
    value: string,
  ): void;
  validateTester_(data: unknown): { ok: boolean; fields?: Record<string, string> };
  validateFounder_(data: unknown): { ok: boolean; fields?: Record<string, string> };
}

export interface Harness {
  api: Api;
  spreadsheet: FakeSpreadsheet;
  ui: HarnessUi;
  files: HarnessFile[];
  cache: Map<string, string>;
}

export function createHarness(): Harness {
  const spreadsheet = new FakeSpreadsheet();
  const files: HarnessFile[] = [];
  const cache = new Map<string, string>();
  const ui: HarnessUi = {
    promptResponse: '',
    alertConfirm: true,
    menuItems: [],
    alerts: [],
  };

  const validationBuilder = {
    requireValueInList() {
      return validationBuilder;
    },
    setAllowInvalid() {
      return validationBuilder;
    },
    build() {
      return {};
    },
  };

  const sandbox = {
    console,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => spreadsheet,
      newDataValidation: () => validationBuilder,
      getUi: () => ({
        createMenu: () => {
          const menu = {
            addItem: (label: string) => {
              ui.menuItems.push(label);
              return menu;
            },
            addSeparator: () => menu,
            addToUi: () => menu,
          };
          return menu;
        },
        prompt: () => ({
          getSelectedButton: () => 'OK',
          getResponseText: () => ui.promptResponse,
        }),
        alert: (...args: unknown[]) => {
          ui.alerts.push(args.map(String));
          const buttons = args[2];
          return buttons === 'YES_NO' ? (ui.alertConfirm ? 'YES' : 'NO') : 'OK';
        },
        ButtonSet: { OK: 'OK', YES_NO: 'YES_NO', CANCEL: 'CANCEL' },
        Button: { OK: 'OK', YES: 'YES', NO: 'NO' },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key: string) => cache.get(key) ?? null,
        put: (key: string, value: string) => {
          cache.set(key, value);
        },
      }),
    },
    LockService: {
      getScriptLock: () => ({ tryLock: () => true, releaseLock: () => undefined }),
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text: string) => ({
        getContent: () => text,
        setMimeType: () => ({ getContent: () => text }),
      }),
    },
    DriveApp: {
      createFile: (name: string, content: string, mime: string) => {
        files.push({ name, content, mime });
        return {
          getUrl: () => `https://drive.example/${encodeURIComponent(name)}`,
          getName: () => name,
        };
      },
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      Charset: { UTF_8: 'UTF_8' },
      computeDigest: (_algorithm: string, value: string) =>
        Array.from(createHash('sha256').update(String(value), 'utf8').digest()),
      formatDate,
      getUuid: () => randomUUID(),
    },
  };

  const context = createContext(sandbox);
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, 'Code.gs'), 'utf8');
  runInContext(source, context, { filename: 'Code.gs' });

  return {
    api: context as unknown as Api,
    spreadsheet,
    ui,
    files,
    cache,
  };
}

export interface Envelope {
  formType: 'tester' | 'founder';
  schemaVersion: string;
  privacyVersion: string;
  submissionId: string;
  acknowledgedAt: string;
  source: { source: string; medium: string; campaign: string; landingPath: string };
  answers: Record<string, unknown>;
  labels: Record<string, unknown>;
  emailConfirm?: string;
  website?: string;
}

let idCounter = 0;

export function uniqueId(prefix = '00000000-0000-4000-8000'): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(12, '0')}`;
}

export function testerEnvelope(overrides: Partial<Envelope> = {}): Envelope {
  const answers: Record<string, unknown> = {
    fullName: 'Adaeze Okafor',
    email: 'adaeze@example.com',
    country: 'NG',
    cityState: 'Lagos',
    ageRange: '25_29',
    ageConfirmed: true,
    mainSituation: 'employed',
    otherActivities: [],
    school: '',
    industry: 'technology',
    industryOther: '',
    interests: ['education', 'technology'],
    interestsOther: '',
    frustration:
      'I spent forty minutes waiting for a bus after class and could not find a reliable timetable anywhere.',
    whatsapp: '+234 801 234 5678',
    whatsappReminders: true,
    hearAbout: 'friend',
    privacyAck: true,
    ...(overrides.answers as Record<string, unknown> | undefined),
  };

  const base: Envelope = {
    formType: 'tester',
    schemaVersion: '2026-10-20',
    privacyVersion: '2026-10-20',
    submissionId: uniqueId(),
    acknowledgedAt: '2026-10-20T10:00:00.000Z',
    source: {
      source: 'linkedin',
      medium: 'social',
      campaign: 'pilot',
      landingPath: '/join',
    },
    answers,
    labels: {
      country: 'Nigeria',
      primarySegment: 'Working adult',
    },
    emailConfirm: 'adaeze@example.com',
    website: '',
  };

  return { ...base, ...overrides, answers, labels: { ...base.labels, ...overrides.labels } };
}

export function founderEnvelope(overrides: Partial<Envelope> = {}): Envelope {
  const answers: Record<string, unknown> = {
    fullName: 'Tunde Bello',
    whatsapp: '+234 801 234 5678',
    email: 'tunde@example.com',
    testDescription:
      'I want to learn whether students would pre-order lunch before a campus rush.',
    audience: 'students',
    audienceDescription: '',
    privacyAck: true,
    ...(overrides.answers as Record<string, unknown> | undefined),
  };

  const base: Envelope = {
    formType: 'founder',
    schemaVersion: '2026-10-20',
    privacyVersion: '2026-10-20',
    submissionId: uniqueId(),
    acknowledgedAt: '2026-10-20T10:00:00.000Z',
    source: {
      source: 'direct',
      medium: 'none',
      campaign: 'none',
      landingPath: '/founders',
    },
    answers,
    labels: { audience: 'Students' },
    website: '',
  };

  return { ...base, ...overrides, answers, labels: { ...base.labels, ...overrides.labels } };
}

export function post(harness: Harness, envelope: Envelope): Record<string, unknown> {
  const response = harness.api.doPost({
    parameter: { payload: JSON.stringify(envelope) },
  });
  return JSON.parse(response.getContent()) as Record<string, unknown>;
}
