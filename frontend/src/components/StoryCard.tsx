import React from 'react';
import { Story, User } from '../types';

interface StoryCardProps {
  story: Story;
  currentUser: User | null;
  onSelect: (id: string) => void;
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
  onToggleLike: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, currentUser, onSelect, onEdit, onDelete, onToggleLike }) => {
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    onEdit(story);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    onDelete(story.id);
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(story.id);
  };

  const isLiked = currentUser && story.likedBy.includes(currentUser.id);

  return (
    <button
      onClick={() => onSelect(story.id)}
      className="bg-white rounded-lg shadow-lg overflow-hidden group flex flex-col text-left transform hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-brand-text mb-1">{story.title}</h3>
        <p className="text-brand-text/50 text-xs mb-2">by {story.author}</p>
        <p className="text-brand-text/80 text-sm flex-grow">{story.excerpt}</p>
        <div className="mt-4">
            {story.tags.map(tag => (
                <span key={tag} className="inline-block bg-brand-secondary/50 text-brand-primary-dark text-xs font-bold mr-2 mb-2 px-3 py-1 rounded-full">
                    {tag}
                </span>
            ))}
        </div>
        <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
            <button 
                onClick={handleLikeClick}
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                    isLiked ? 'text-red-500' : 'text-stone-500 hover:text-red-400'
                }`}
                aria-label="Like story"
            >
                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                <span>{story.likes}</span>
            </button>
            {currentUser && currentUser.id === story.userId && (
                <div className="flex justify-end gap-3">
                    <button onClick={handleEditClick} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        <i className="fa-solid fa-pen-to-square mr-1"></i>수정
                    </button>
                    <button onClick={handleDeleteClick} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                        <i className="fa-solid fa-trash mr-1"></i>삭제
                    </button>
                </div>
            )}
        </div>
      </div>
    </button>
  );
};

export default StoryCard;