import React from 'react';
import { Story, Comment, User, Page, Party } from '../types';
import CommentSection from '../components/CommentSection';

interface StoryDetailPageProps {
  story: Story;
  comments: Comment[];
  party?: Party;
  currentUser: User | null;
  onAddComment: (storyId: string, text: string) => void;
  setPage: (page: Page) => void;
}

const ImpactSnapshot: React.FC<{ party?: Party }> = ({ party }) => (
    <div className="bg-stone-100 p-6 rounded-lg my-8">
        <h3 className="text-xl font-semibold text-brand-text mb-4 text-center">임팩트 스냅샷</h3>
        <p className="text-center text-sm text-brand-text/70 mb-6">이 스토리가 만들어낸 긍정적인 영향력이에요!</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-3xl font-bold text-brand-primary">{party?.impact?.itemsExchanged || 45}+</p>
                <p className="text-sm text-brand-text/80">참여를 통한 의류 교환</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-brand-primary">{party?.impact?.waterSaved.toLocaleString() || '150,000'}+</p>
                <p className="text-sm text-brand-text/80">절약된 물 (L)</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-brand-primary">{party?.impact?.co2Reduced.toFixed(1) || '320.5'}+</p>
                <p className="text-sm text-brand-text/80">절감된 CO₂ (kg)</p>
            </div>
        </div>
    </div>
);

const StoryDetailPage: React.FC<StoryDetailPageProps> = ({ story, comments, party, currentUser, onAddComment, setPage }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={() => setPage(Page.COMMUNITY)} 
        className="text-brand-primary hover:text-brand-primary-dark font-semibold mb-6 inline-flex items-center"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i>
        커뮤니티로 돌아가기
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-80 object-cover"
        />
        <div className="p-8">
          <h1 className="text-4xl font-bold text-brand-text mb-4">{story.title}</h1>
          <div className="flex items-center space-x-4 text-brand-text/80 mb-6 pb-6 border-b border-stone-200">
            <div className="flex items-center">
                 <i className="fa-solid fa-user-circle text-lg mr-2 text-brand-primary"></i>
                 <span>작성자: {story.author}</span>
            </div>
             {party && (
                <div className="flex items-center">
                    <i className="fa-solid fa-calendar-check text-lg mr-2 text-brand-secondary"></i>
                    <span>연관 파티: {party.title}</span>
                </div>
             )}
          </div>
          
          <div className="prose prose-lg max-w-none text-brand-text/90 leading-relaxed mb-8">
            {story.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mb-8">
            {story.tags.map(tag => (
                <span key={tag} className="inline-block bg-brand-secondary/50 text-brand-primary-dark text-sm font-bold mr-2 mb-2 px-4 py-2 rounded-full">
                    {tag}
                </span>
            ))}
          </div>
          
          <ImpactSnapshot party={party} />

          <CommentSection 
            storyId={story.id} 
            comments={comments} 
            currentUser={currentUser} 
            onAddComment={onAddComment}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;