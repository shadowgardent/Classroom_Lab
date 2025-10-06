import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardContent from '../../../components/DashboardContent';
import {
  classroomRequest,
  decodeJwtPayload,
  mapProfileSummary,
  mapStatuses
} from '../../../lib/classroom';
import type { StatusItem } from '../../../types';

export default async function DashboardPage() {
  const token = cookies().get('classroom_token');
  if (!token) {
    redirect('/login');
  }

  let statuses: StatusItem[] = [];
  try {
    const [rawStatuses, profileRaw] = await Promise.all([
      classroomRequest<unknown>('status', {
        method: 'GET',
        token: token?.value
      }),
      classroomRequest<unknown>('profile', {
        method: 'GET',
        token: token?.value
      })
    ]);

    const decoded = decodeJwtPayload<{ id?: string; email?: string }>(token?.value ?? '');
    const profile = mapProfileSummary(profileRaw);
    const identifiers = [profile.id, profile.email, decoded?.id, decoded?.email].filter(Boolean) as string[];

    statuses = mapStatuses(rawStatuses, identifiers);
  } catch (error) {
    console.error('Dashboard status error', error);
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">สถานะล่าสุด</h2>
        <p className="text-sm text-slate-500">อัปเดตข่าวสาร แลกเปลี่ยนความคิดเห็นกับเพื่อนร่วมชั้น</p>
      </div>
      <DashboardContent initialStatuses={statuses} />
    </section>
  );
}