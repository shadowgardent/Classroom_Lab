'use client';

import { useMemo, useState } from 'react';
import MemberCard from './MemberCard';
import type { ClassroomMember } from '../types';

interface MemberDirectoryProps {
  initialYear: number;
  years: number[];
  initialMembers: ClassroomMember[];
}

export default function MemberDirectory({ initialYear, years, initialMembers }: MemberDirectoryProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [members, setMembers] = useState<ClassroomMember[]>(Array.isArray(initialMembers) ? initialMembers : []);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleYearChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(event.target.value);
    setSelectedYear(year);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/class/${year}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'ไม่สามารถโหลดสมาชิกได้');
      }
      const data = await response.json();
      const list = Array.isArray(data?.members) ? (data.members as ClassroomMember[]) : [];
      setMembers(list);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!keyword.trim()) return members;
    const lower = keyword.trim().toLowerCase();
    return members.filter((member) =>
      [member.full_name, member.email, member.student_id]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(lower))
    );
  }, [keyword, members]);

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-cocoa-600">รายชื่อปี {selectedYear}</h2>
          <p className="text-xs text-cocoa-400">เลือกปีการศึกษาหรือลองค้นหาด้วยคำสำคัญ</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-cocoa-500">
            ปีการศึกษา
            <select value={selectedYear} onChange={handleYearChange} className="min-w-[120px]">
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <input
            type="search"
            placeholder="ค้นหาชื่อ อีเมล หรือรหัสนักศึกษา"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-cocoa-400">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
          {!filteredMembers.length && (
            <p className="col-span-full rounded-2xl border border-dashed border-sand-300 bg-white/70 py-8 text-center text-sm text-cocoa-300">
              ไม่พบข้อมูลที่ตรงกับการค้นหา
            </p>
          )}
        </div>
      )}
    </div>
  );
}
