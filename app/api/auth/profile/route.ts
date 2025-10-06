import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { classroomRequest } from '../../../../lib/classroom';
import type { ProfileSummary } from '../../../../types';

export async function GET() {
  try {
    const token = cookies().get('classroom_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const profile = await classroomRequest<ProfileSummary>('profile', {
      method: 'GET',
      token
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile fetch error', error);
    return NextResponse.json({ message: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}