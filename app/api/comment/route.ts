import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  classroomRequest,
  decodeJwtPayload,
  mapProfileSummary,
  mapStatusItem
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

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('classroom_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const payload = await request.json();
    const { statusId, body } = payload ?? {};
    if (!statusId || !body) {
      return NextResponse.json({ message: 'ต้องระบุสถานะและข้อความคอมเม้นท์' }, { status: 400 });
    }

    const [rawStatus, viewerIdentifiers] = await Promise.all([
      classroomRequest<unknown>('comment', {
        method: 'POST',
        token,
        body: JSON.stringify({ statusId, status_id: statusId, content: body, body })
      }),
      buildViewerIdentifiers(token)
    ]);

    const status = mapStatusItem(rawStatus, viewerIdentifiers);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Comment error', error);
    return NextResponse.json({ message: 'ไม่สามารถคอมเม้นท์ได้' }, { status: 500 });
  }
}