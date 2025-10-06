'use client';

import { useState } from 'react';
import type { Comment, StatusItem } from '../types';

interface StatusCardProps {
  status: StatusItem;
  onToggleLike: (statusId: string, like: boolean) => Promise<void>;
  onCreateComment: (statusId: string, body: string) => Promise<void>;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

export default function StatusCard({ status, onToggleLike, onCreateComment }: StatusCardProps) {
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const commentPlaceholder = 'เขียนความคิดเห็น...';

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await onToggleLike(status.id, !status.is_liked);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    try {
      await onCreateComment(status.id, comment.trim());
      setComment('');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <article className="card space-y-4 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{status.owner.full_name}</h3>
          <p className="text-xs text-slate-500">{status.owner.email}</p>
        </div>
        <time className="text-xs text-slate-400">{formatDate(status.created_at)}</time>
      </header>
      <p className="whitespace-pre-wrap text-sm text-slate-700">{status.body}</p>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1 ${status.is_liked ? 'text-primary-600' : 'text-slate-500'}`}
        >
          <span>{status.is_liked ? 'ยกเลิกถูกใจ' : 'ถูกใจ'}</span>
          <span className="font-semibold">{status.like_count}</span>
        </button>
        <span>ความคิดเห็น {status.comments.length}</span>
      </div>
      <div className="space-y-3">
        {status.comments.length > 0 && (
          <ul className="space-y-2">
            {status.comments.map((item: Comment) => (
              <li key={item.id} className="rounded-lg bg-slate-100 px-4 py-3 text-sm">
                <p className="font-medium text-slate-700">{item.owner.full_name}</p>
                <p className="text-slate-600">{item.body}</p>
                <time className="text-xs text-slate-400">{formatDate(item.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={commentPlaceholder}
            className="flex-1"
          />
          <button type="submit" className="primary" disabled={commentLoading || !comment.trim()}>
            {commentLoading ? 'กำลังส่ง' : 'ส่ง'}
          </button>
        </form>
      </div>
    </article>
  );
}