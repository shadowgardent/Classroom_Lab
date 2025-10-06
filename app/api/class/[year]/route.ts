import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { classroomRequest, mapClassroomMembers } from '../../../../lib/classroom';
import type { ClassroomMember } from '../../../../types';

interface Params {
  params: { year: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const token = cookies().get('classroom_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const year = params.year;
    if (!year) {
      return NextResponse.json({ message: 'ต้องระบุปีการศึกษา' }, { status: 400 });
    }

    const rawMembers = await classroomRequest<unknown>(`class/${year}`, {
      method: 'GET',
      token
    });

    const members: ClassroomMember[] = mapClassroomMembers(rawMembers);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Member list error', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงรายชื่อสมาชิกได้' }, { status: 500 });
  }
}