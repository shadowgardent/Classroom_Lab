'use client';

import { useState } from 'react';
import StatusComposer from './StatusComposer';
import StatusFeed from './StatusFeed';
import type { StatusItem } from '../types';

interface DashboardContentProps {
  initialStatuses: StatusItem[];
}

export default function DashboardContent({ initialStatuses }: DashboardContentProps) {
  const [statuses, setStatuses] = useState<StatusItem[]>(Array.isArray(initialStatuses) ? initialStatuses : []);

  const handleStatusCreated = (status: StatusItem) => {
    setStatuses((previous) => [status, ...previous]);
  };

  const handleToggleLike = async (statusId: string, like: boolean) => {
    setStatuses((previous) =>
      previous.map((item) =>
        item.id === statusId
          ? {
              ...item,
              is_liked: like,
              like_count: Math.max(0, item.like_count + (like ? 1 : -1))
            }
          : item
      )
    );

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId, like })
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถบันทึกการกดถูกใจได้');
      }
    } catch (error) {
      console.error(error);
      setStatuses((previous) =>
        previous.map((item) =>
          item.id === statusId
            ? {
                ...item,
                is_liked: !like,
                like_count: Math.max(0, item.like_count + (like ? -1 : 1))
              }
            : item
        )
      );
    }
  };

  const handleCreateComment = async (statusId: string, body: string) => {
    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId, body })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'ไม่สามารถคอมเม้นท์ได้');
      }

      const data = await response.json();
      const updated = data?.status as StatusItem | undefined;
      if (updated) {
        setStatuses((previous) =>
          previous.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <StatusComposer onCreated={handleStatusCreated} />
      <StatusFeed
        statuses={statuses}
        onToggleLike={handleToggleLike}
        onCreateComment={handleCreateComment}
      />
    </div>
  );
}
