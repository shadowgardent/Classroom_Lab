'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setFormError('เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-7 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-cocoa-600">เข้าสู่ระบบ</h2>
        <p className="text-sm text-cocoa-400">กรอกอีเมลและรหัสผ่านของบัญชี CIS เพื่อเริ่มต้นใช้งาน</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-cocoa-500">
          อีเมลมหาวิทยาลัย
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@kkumail.com"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-cocoa-500">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {(formError || error) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError || error}
        </p>
      )}
      <button type="submit" className="primary w-full" disabled={loading}>
        {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  );
}
