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
  const commentPlaceholder = 'แสดงความคิดเห็นของคุณ...';

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

  const likeButtonClass = status.is_liked
    ? 'bg-primary-50 text-primary-600'
    : 'text-cocoa-400 hover:bg-white/60 hover:text-primary-600';

  return (
    <article className="card space-y-5 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-cocoa-600">{status.owner.full_name}</h3>
          <p className="text-xs text-cocoa-400">{status.owner.email}</p>
        </div>
        <time className="text-xs text-cocoa-300">{formatDate(status.created_at)}</time>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-cocoa-500">{status.body}</p>
      <div className="flex flex-wrap items-center gap-4 rounded-full bg-sand-100/70 px-4 py-2 text-sm text-cocoa-400">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-2 rounded-full px-3 py-1 transition-colors ${likeButtonClass}`}
        >
          <span>{status.is_liked ? 'เลิกถูกใจ' : 'ถูกใจ'}</span>
          <span className="font-semibold">{status.like_count}</span>
        </button>
        <span>ความคิดเห็น {status.comments.length}</span>
      </div>
      <div className="space-y-3">
        {status.comments.length > 0 && (
          <ul className="space-y-3">
            {status.comments.map((item: Comment) => (
              <li key={item.id} className="rounded-xl border border-sand-200 bg-white/80 px-4 py-3 text-sm">
                <p className="font-medium text-cocoa-600">{item.owner.full_name}</p>
                <p className="text-cocoa-500">{item.body}</p>
                <time className="text-xs text-cocoa-300">{formatDate(item.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={commentPlaceholder}
            className="flex-1"
          />
          <button type="submit" className="primary sm:w-auto" disabled={commentLoading || !comment.trim()}>
            {commentLoading ? 'กำลังส่ง' : 'ส่ง'}
          </button>
        </form>
      </div>
    </article>
  );
}
