'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await logout();
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ghost px-4 py-2 text-cocoa-500 hover:text-primary-600"
      disabled={pending}
    >
      {pending ? 'ออกจากระบบ...' : 'ออกจากระบบ'}
    </button>
  );
}
