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
      <div>
        <h2 className="text-xl font-semibold text-slate-800">สมาชิกในชั้นปี</h2>
        <p className="text-sm text-slate-500">สำรวจรายชื่อเพื่อนร่วมชั้นตามปีที่เข้าศึกษา</p>
      </div>
      <MemberDirectory initialYear={defaultYear} years={years} initialMembers={members} />
    </section>
  );
}