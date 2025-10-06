﻿import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' });
  response.cookies.set('classroom_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return response;
}