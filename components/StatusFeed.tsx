'use client';

import StatusCard from './StatusCard';
import type { StatusItem } from '../types';

interface StatusFeedProps {
  statuses: StatusItem[];
  onToggleLike: (statusId: string, like: boolean) => Promise<void>;
  onCreateComment: (statusId: string, body: string) => Promise<void>;
}

export default function StatusFeed({ statuses, onToggleLike, onCreateComment }: StatusFeedProps) {
  if (!statuses.length) {
    return (
      <div className="card p-6 text-center text-sm text-cocoa-400">
        ยังไม่มีการอัปเดต ลองเป็นคนแรกที่แชร์เรื่องราวของคุณ!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statuses.map((status) => (
        <StatusCard
          key={status.id}
          status={status}
          onToggleLike={onToggleLike}
          onCreateComment={onCreateComment}
        />
      ))}
    </div>
  );
}
