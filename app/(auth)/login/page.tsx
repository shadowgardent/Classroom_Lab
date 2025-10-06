import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '../../../components/LoginForm';

export default function LoginPage() {
  if (cookies().get('classroom_token')) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-12">
      <LoginForm />
    </div>
  );
}
