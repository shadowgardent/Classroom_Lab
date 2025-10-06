import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MemberDirectory from '../../../components/MemberDirectory';
import { classroomRequest, mapClassroomMembers } from '../../../lib/classroom';
import type { ClassroomMember } from '../../../types';

export default async function MembersPage() {
  const token = cookies().get('classroom_token');
  if (!token) {
    redirect('/login');
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - index).sort((a, b) => a - b);
  const defaultYear = years.includes(currentYear) ? currentYear : years[years.length - 1];

  let members: ClassroomMember[] = [];
  try {
    const rawMembers = await classroomRequest<unknown>(`class/${defaultYear}`, {
      method: 'GET',
      token: token?.value
    });
    members = mapClassroomMembers(rawMembers);
  } catch (error) {
    console.error('Members initial load error', error);
  }

  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-400">Directory</p>
        <h2 className="text-xl font-semibold text-cocoa-600">รายชื่อเพื่อนร่วมรุ่น</h2>
        <p className="text-sm text-cocoa-400">ค้นหาข้อมูลเพื่อน ๆ ตามปีการศึกษา อีเมล หรือรหัสนักศึกษา</p>
      </div>
      <MemberDirectory initialYear={defaultYear} years={years} initialMembers={members} />
    </section>
  );
}
