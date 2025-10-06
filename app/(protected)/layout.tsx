import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';
import { classroomRequest } from '../../lib/classroom';
import type { ProfileSummary } from '../../types';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('classroom_token');
  if (!token) {
    redirect('/login');
  }

  let profile: ProfileSummary | null = null;
  try {
    profile = await classroomRequest<ProfileSummary>('profile', {
      method: 'GET',
      token: token?.value
    });
  } catch (error) {
    console.error('Protected layout profile error', error);
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <nav className="container-responsive flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary-700">Classroom Portal</h1>
            <p className="text-sm text-slate-500">สวัสดี {profile?.full_name ?? 'เพื่อน'}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="font-medium text-slate-600 hover:text-primary-600">
              สถานะล่าสุด
            </Link>
            <Link href="/members" className="font-medium text-slate-600 hover:text-primary-600">
              สมาชิกตามชั้นปี
            </Link>
            <LogoutButton />
          </div>
        </nav>
      </header>
      <main className="container-responsive py-8">{children}</main>
    </div>
  );
}