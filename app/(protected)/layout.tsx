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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sand-50 via-sand-100 to-sand-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-200/35 blur-3xl" />
        <div className="absolute right-[-60px] top-40 h-64 w-64 rounded-full bg-sand-200/40 blur-3xl" />
      </div>
      <header className="sticky top-0 z-20 border-b border-sand-200/60 bg-white/70 backdrop-blur-xl">
        <nav className="container-responsive flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-cocoa-600">Classroom Portal</h1>
            <p className="text-sm text-cocoa-400">สวัสดี {profile?.full_name ?? 'เพื่อน'} 👋</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 font-medium text-cocoa-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              ฟีดอัปเดต
            </Link>
            <Link
              href="/members"
              className="rounded-full px-3 py-2 font-medium text-cocoa-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              รายชื่อเพื่อนร่วมรุ่น
            </Link>
            <LogoutButton />
          </div>
        </nav>
      </header>
      <main className="container-responsive py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="hr-subtle" />
          {children}
          <div className="hr-subtle" />
        </div>
      </main>
    </div>
  );
}
