'use client';

import { FormEvent, useState } from 'react';
import type { StatusItem } from '../types';

interface StatusComposerProps {
  onCreated?: (status: StatusItem) => void;
}

export default function StatusComposer({ onCreated }: StatusComposerProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) {
      setError('พิมพ์ข้อความก่อนโพสต์');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'ไม่สามารถโพสต์ได้');
      }

      const data = await response.json();
      if (onCreated && data?.status) {
        const status = data.status as StatusItem;
        onCreated({
          ...status,
          comments: status.comments ?? [],
          like_count: status.like_count ?? 0,
          is_liked: status.is_liked ?? false
        });
      }
      setBody('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'ไม่สามารถโพสต์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label htmlFor="status" className="sr-only">
          ข้อความสถานะ
        </label>
        <textarea
          id="status"
          name="status"
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="แบ่งปันสิ่งที่เกิดขึ้น..."
          className="w-full"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'กำลังโพสต์...' : 'โพสต์'}
        </button>
      </div>
    </form>
  );
}