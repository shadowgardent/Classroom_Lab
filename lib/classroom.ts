import type { ClassroomMember, Comment, ProfileSummary, StatusItem } from '../types';

declare const require: any;

const CLASSROOM_API_BASE = 'https://cis.kku.ac.th/api/classroom';
const THAI_CHARSETS = new Set(['tis-620', 'tis620', 'windows-874', 'windows874', 'iso-8859-11', 'iso8859-11']);
const CHARSET_FALLBACKS = ['utf-8', 'utf8', 'windows-874', 'windows874', 'tis-620', 'tis620', 'iso-8859-11', 'latin1'];

type ClassroomRequestInit = RequestInit & { token?: string | null };

let cachedDecoder: typeof TextDecoder | null | undefined;

function getDecoder(): typeof TextDecoder | null {
  if (cachedDecoder !== undefined) {
    return cachedDecoder;
  }

  if (typeof TextDecoder !== 'undefined') {
    cachedDecoder = TextDecoder;
    return cachedDecoder;
  }

  try {
    const util = require('util') as typeof import('util');
    cachedDecoder = util.TextDecoder as unknown as typeof TextDecoder;
  } catch {
    cachedDecoder = null;
  }

  return cachedDecoder ?? null;
}

function decodeTis620(buffer: Buffer): string {
  let output = '';
  for (const byte of buffer) {
    if (byte <= 0x7f) {
      output += String.fromCharCode(byte);
    } else if (byte === 0xa0) {
      output += '\u00A0';
    } else if (byte >= 0xa1 && byte <= 0xda) {
      output += String.fromCharCode(0x0e01 + (byte - 0xa1));
    } else if (byte >= 0xdf && byte <= 0xfb) {
      output += String.fromCharCode(0x0e3f + (byte - 0xdf));
    } else {
      output += String.fromCharCode(byte);
    }
  }
  return output;
}

function decodeBuffer(buffer: Buffer, charset?: string | null): string | null {
  const normalized = charset?.toLowerCase();

  if (normalized && THAI_CHARSETS.has(normalized)) {
    return decodeTis620(buffer);
  }

  if (normalized === 'latin1') {
    return buffer.toString('latin1');
  }

  const DecoderCtor = getDecoder();
  if (!DecoderCtor) {
    return null;
  }

  try {
    return new DecoderCtor(normalized ?? 'utf-8', { fatal: false }).decode(buffer);
  } catch {
    return null;
  }
}

function decodeBufferWithFallback(buffer: Buffer, charsetHint?: string | null): string {
  const priorities = Array.from(new Set([charsetHint?.toLowerCase(), ...CHARSET_FALLBACKS].filter(Boolean)));

  for (const charset of priorities) {
    const decoded = decodeBuffer(buffer, charset);
    if (decoded) {
      return decoded;
    }
  }

  const thaiDecoded = decodeTis620(buffer);
  if (thaiDecoded.trim()) {
    return thaiDecoded;
  }

  return buffer.toString('utf-8');
}

function parseJsonBuffer(buffer: Buffer, charsetHint?: string | null): unknown {
  const text = decodeBufferWithFallback(buffer, charsetHint);
  return JSON.parse(text);
}

function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function resolveLikeIdentifier(entry: unknown): string | null {
  if (typeof entry === 'string') {
    const value = safeString(entry).trim();
    return value ? value.toLowerCase() : null;
  }

  if (entry && typeof entry === 'object') {
    const record = entry as Record<string, unknown>;
    const candidates = [record._id, record.id, record.userId, record.email];
    for (const candidate of candidates) {
      const value = safeString(candidate).trim();
      if (value) {
        return value.toLowerCase();
      }
    }
  }

  return null;
}

function asIdentifierSet(values: (string | null | undefined)[]): Set<string> {
  const set = new Set<string>();
  for (const value of values) {
    const text = safeString(value).trim().toLowerCase();
    if (text) {
      set.add(text);
    }
  }
  return set;
}

function ensureArray<T>(input: unknown, keys: string[] = []): T[] {
  if (Array.isArray(input)) {
    return input as T[];
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of [...keys, 'data', 'result', 'results', 'items', 'records', 'rows', 'list']) {
      if (key in record) {
        const nested = ensureArray<T>(record[key], keys);
        if (nested.length) {
          return nested;
        }
      }
    }
  }

  return [];
}

function pickEntity<T>(input: unknown): T | null {
  if (!input) return null;
  if (Array.isArray(input)) return (input[0] as T) ?? null;

  if (typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of ['data', 'result', 'status', 'item']) {
      if (key in record) {
        const nested = pickEntity<T>(record[key]);
        if (nested) {
          return nested;
        }
      }
    }
  }

  return input as T;
}

export async function classroomRequest<T>(path: string, init: ClassroomRequestInit = {}): Promise<T> {
  const apiKey = process.env.CLASSROOM_API_KEY;
  if (!apiKey) {
    throw new Error('Missing CLASSROOM_API_KEY environment variable.');
  }

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('x-api-key', apiKey);
  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }

  const response = await fetch(`${CLASSROOM_API_BASE}/${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') ?? '';
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  const charset = charsetMatch ? charsetMatch[1].trim().toLowerCase() : undefined;

  if (!response.ok) {
    if (buffer.length) {
      try {
        const parsed = parseJsonBuffer(buffer, charset) as Record<string, unknown>;
        const message = safeString(parsed?.message ?? parsed?.error ?? parsed);
        throw new Error(message || response.statusText);
      } catch {
        const text = decodeBufferWithFallback(buffer, charset);
        throw new Error(text.trim() || response.statusText);
      }
    }
    throw new Error(response.statusText);
  }

  if (!buffer.length || response.status === 204) {
    return undefined as T;
  }

  return parseJsonBuffer(buffer, charset) as T;
}

export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const segments = token.split('.');
    if (segments.length < 2) return null;
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const text = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to decode JWT payload', error);
    return null;
  }
}

export function mapProfileSummary(raw: unknown): ProfileSummary {
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    const text = String(raw);
    return {
      id: text,
      email: typeof raw === 'string' && raw.includes('@') ? text : '',
      full_name: text,
      student_id: undefined,
      class_year: undefined,
      avatar_url: undefined,
      company: null,
      school: null,
      teacher: null
    };
  }

  const source = (raw ?? {}) as Record<string, any>;
  const id = safeString(source._id ?? source.id ?? source.userId ?? source.profileId ?? '');
  const email = safeString(source.email ?? source.username ?? source.mail ?? '');
  const firstName = safeString(source.firstname ?? source.first_name ?? source.firstName ?? '');
  const lastName = safeString(source.lastname ?? source.last_name ?? source.lastName ?? '');
  const fullName = safeString(source.full_name ?? source.fullName ?? `${firstName} ${lastName}`.trim());
  const studentId = safeString(source.student_id ?? source.studentId ?? source.education?.studentId ?? '');
  const classYearRaw = safeString(
    source.class_year ?? source.education?.enrollmentYear ?? source.enrollmentYear ?? ''
  );
  const classYear = classYearRaw ? Number(classYearRaw) || undefined : undefined;
  const avatar = safeString(source.avatar_url ?? source.image ?? source.avatar ?? source.profileImage ?? '');

  return {
    id: id || email || fullName || Math.random().toString(36).slice(2),
    email,
    full_name: fullName || email || id,
    student_id: studentId || undefined,
    class_year: classYear,
    avatar_url: avatar || undefined,
    company: null,
    school: null,
    teacher: null
  };
}

function mapComment(raw: unknown, statusId: string): Comment {
  const source = pickEntity<Record<string, unknown>>(raw) ?? {};
  const id = safeString(source._id ?? source.id ?? source.comment_id ?? `${statusId}-${Math.random().toString(36).slice(2)}`);
  const body = safeString(source.content ?? source.body ?? source.message ?? source.text ?? '');
  const createdAt = safeString(source.createdAt ?? source.created_at ?? source.timestamp ?? new Date().toISOString());
  const owner = mapProfileSummary(source.createdBy ?? source.owner ?? source.user ?? {});

  return {
    id,
    status_id: statusId,
    body,
    created_at: createdAt,
    owner
  };
}

export function mapStatusItem(raw: unknown, currentUserIdentifiers: string[] = []): StatusItem {
  const record = pickEntity<Record<string, unknown>>(raw) ?? {};
  const id = safeString(record._id ?? record.id ?? record.status_id ?? Math.random().toString(36).slice(2));
  const body = safeString(record.content ?? record.body ?? record.message ?? record.text ?? '');
  const createdAt = safeString(record.createdAt ?? record.created_at ?? record.timestamp ?? new Date().toISOString());
  const owner = mapProfileSummary(record.createdBy ?? record.owner ?? record.user ?? {});

  const likeEntries = ensureArray(record.like ?? record.likes ?? record.favorites ?? [], ['like', 'likes', 'favorites']);
  const likeIdentifiers = new Set<string>();
  for (const entry of likeEntries) {
    const identifier = resolveLikeIdentifier(entry);
    if (identifier) {
      likeIdentifiers.add(identifier);
    }
  }

  const viewerIdentifiers = asIdentifierSet(currentUserIdentifiers);
  const isLiked = Array.from(viewerIdentifiers).some((identifier) => likeIdentifiers.has(identifier));

  const comments = ensureArray(record.comment ?? record.comments ?? [], ['comment', 'comments']).map((item) =>
    mapComment(item, id)
  );

  return {
    id,
    body,
    created_at: createdAt,
    owner,
    like_count: likeIdentifiers.size,
    is_liked: isLiked,
    comments
  };
}

export function mapStatuses(raw: unknown, currentUserIdentifiers?: string[] | string | null): StatusItem[] {
  const identifiers = Array.isArray(currentUserIdentifiers)
    ? currentUserIdentifiers
    : currentUserIdentifiers
      ? [currentUserIdentifiers]
      : [];

  const list = ensureArray(raw, ['statuses']);
  if (!list.length) {
    const entity = pickEntity<unknown>(raw);
    return entity ? [mapStatusItem(entity, identifiers)] : [];
  }

  return list.map((item) => mapStatusItem(item, identifiers));
}

export function mapClassroomMembers(raw: unknown): ClassroomMember[] {
  const list = ensureArray(raw, ['members']);
  if (!list.length) {
    return [];
  }

  return list.map((item) => {
    const profile = mapProfileSummary(item);
    const source = (item ?? {}) as Record<string, any>;
    const contact = safeString(source.contact ?? source.phone ?? source.mobile ?? '');
    const bio = safeString(source.bio ?? source.about ?? '');

    return {
      ...profile,
      contact: contact || undefined,
      bio: bio || undefined
    };
  });
}
