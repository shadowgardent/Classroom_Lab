import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '../../../components/LoginForm';

export default function LoginPage() {
  if (cookies().get('classroom_token')) {
    redirect('/dashboard');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sand-50 via-sand-100 to-sand-200 px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-10 right-12 h-60 w-60 rounded-full bg-sand-200/50 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-400">Classroom Lab</p>
          <h1 className="mt-2 text-3xl font-semibold text-cocoa-600">ยินดีต้อนรับกลับ</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
