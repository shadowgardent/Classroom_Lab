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
    const { statusId, like } = payload ?? {};
    if (!statusId) {
      return NextResponse.json({ message: 'ต้องระบุสถานะ' }, { status: 400 });
    }

    const shouldLike = Boolean(like);
    const viewerIdentifiers = await buildViewerIdentifiers(token);

    const response = await classroomRequest<unknown>('like', {
      method: shouldLike ? 'POST' : 'DELETE',
      token,
      body: JSON.stringify({ status_id: statusId, statusId })
    });

    const status = mapStatusItem(response, viewerIdentifiers);
    status.id = statusId;
    status.is_liked = shouldLike;

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Like error', error);
    return NextResponse.json({ message: 'ไม่สามารถบันทึกการกดถูกใจได้' }, { status: 500 });
  }
}
