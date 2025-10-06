import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  classroomRequest,
  decodeJwtPayload,
  mapProfileSummary,
  mapStatusItem,
  mapStatuses
} from '../../../lib/classroom';

async function buildViewerIdentifiers(token: string) {
  const decoded = decodeJwtPayload<{ id?: string; email?: string }>(token);
  try {
    const profileRaw = await classroomRequest<unknown>('profile', {
      method: 'GET',
      token
    });
    const profile = mapProfileSummary(profileRaw);
    return [profile.id, profile.email, decoded?.id, decoded?.email].filter(Boolean) as string[];
  } catch (error) {
    console.error('Viewer profile lookup failed', error);
    return [decoded?.id, decoded?.email].filter(Boolean) as string[];
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('classroom_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.toString();
    const path = search ? `status?${search}` : 'status';

    const [rawStatuses, viewerIdentifiers] = await Promise.all([
      classroomRequest<unknown>(path, { method: 'GET', token }),
      buildViewerIdentifiers(token)
    ]);

    const statuses = mapStatuses(rawStatuses, viewerIdentifiers);
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error('Status list error', error);
    return NextResponse.json({ message: 'ไม่สามารถโหลดสถานะได้' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('classroom_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const payload = await request.json();
    const { body } = payload ?? {};
    if (!body || typeof body !== 'string') {
      return NextResponse.json({ message: 'กรอกข้อความสถานะ' }, { status: 400 });
    }

    const [rawStatus, viewerIdentifiers] = await Promise.all([
      classroomRequest<unknown>('status', {
        method: 'POST',
        token,
        body: JSON.stringify({ content: body, body })
      }),
      buildViewerIdentifiers(token)
    ]);

    const status = mapStatusItem(rawStatus, viewerIdentifiers);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Status post error', error);
    return NextResponse.json({ message: 'ไม่สามารถโพสต์สถานะได้' }, { status: 500 });
  }
}
