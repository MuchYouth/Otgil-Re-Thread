import React, { useState } from 'react';
import { Comment, User, Page } from '../types';

interface CommentSectionProps {
  storyId: string;
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (storyId: string, text: string) => void;
  setPage: (page: Page) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ storyId, comments, currentUser, onAddComment, setPage }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(storyId, newComment);
            setNewComment('');
        }
    };

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "년 전";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "달 전";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "일 전";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "시간 전";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "분 전";
        return Math.floor(seconds) + "초 전";
    };

    return (
        <div className="pt-8 border-t border-stone-200">
            <h3 className="text-2xl font-semibold text-brand-text mb-6">{comments.length}개의 댓글</h3>
            
            {/* Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-8 flex items-start space-x-4">
                    <i className="fa-solid fa-user-circle text-3xl text-stone-400 mt-2"></i>
                    <div className="flex-grow">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="따뜻한 댓글을 남겨주세요..."
                            rows={3}
                            className="w-full p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <button type="submit" className="mt-2 float-right bg-brand-primary text-white font-bold py-2 px-5 rounded-full hover:bg-brand-primary-dark transition-colors">
                            등록
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 text-center bg-stone-100 p-4 rounded-lg">
                    <p className="text-brand-text/80">
                        댓글을 작성하려면{' '}
                        <button onClick={() => setPage(Page.LOGIN)} className="font-bold text-brand-primary hover:underline">
                            로그인
                        </button>
                        {' '}이 필요합니다.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-4">
                         <i className="fa-solid fa-user-circle text-3xl text-stone-400 mt-1"></i>
                         <div className="flex-grow">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-brand-text">{comment.authorNickname}</span>
                                <span className="text-xs text-brand-text/60">{timeSince(comment.timestamp)}</span>
                            </div>
                            <p className="text-brand-text/90 mt-1">{comment.text}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;