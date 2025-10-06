import { NextRequest, NextResponse } from 'next/server';
import { classroomRequest } from '../../../../lib/classroom';

type SignInResponse = {
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    access_token?: string;
    profile?: unknown;
  };
  profile?: unknown;
} & Record<string, unknown>;

function normalizeToken(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  return raw.replace(/^Bearer\s+/i, '').trim() || null;
}

function extractToken(payload: SignInResponse | undefined): string | null {
  if (!payload) return null;
  const candidates = [
    payload.token,
    payload.access_token,
    payload.data?.token,
    payload.data?.access_token
  ];

  for (const candidate of candidates) {
    const normalized = normalizeToken(candidate);
    if (normalized) {
      return normalized;
    }
  }

  const nestedToken = (payload as Record<string, unknown>)?.token as
    | string
    | { access_token?: string }
    | undefined;
  if (nestedToken && typeof nestedToken === 'object' && 'access_token' in nestedToken) {
    return normalizeToken(nestedToken.access_token);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const data = await classroomRequest<SignInResponse>('signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const token = extractToken(data);
    if (!token) {
      console.error('Signin response missing token field', data);
      return NextResponse.json({ message: 'ไม่พบโทเค็นจากระบบ' }, { status: 502 });
    }

    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      profile: data?.profile ?? data?.data?.profile ?? null
    });
    response.cookies.set('classroom_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ';
    console.error('Auth login error', message);
    return NextResponse.json({ message }, { status: 401 });
  }
}