import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: Removed import for non-existent 'Event' type.
import { Story, User, PerformanceReport } from '../types';
import StoryCard from '../components/StoryCard';

interface CommunityPageProps {
  stories: Story[];
  onSelectStory: (id: string) => void;
  currentUser: User | null;
  // FIX: Changed 'eventId' to 'partyId' to match the 'Story' type and resolve prop mismatch.
  onStorySubmit: (storyData: { id?: string; partyId: string; title: string; excerpt: string; content: string; imageUrl: string; tags: string[] }) => void;
  onDeleteStory: (id: string) => void;
  onToggleLike: (storyId: string) => void;
  reports: PerformanceReport[];
  onAddReport: (reportData: { title: string; date: string; excerpt: string }) => void;
}

type CommunitySection = 'STORIES' | 'REPORTS';

const SectionButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-semibold transition-colors duration-200 focus:outline-none border-b-2 ${
      isActive
        ? 'border-brand-primary text-brand-primary'
        : 'border-transparent text-brand-text/60 hover:text-brand-text hover:border-stone-300'
    }`}
  >
    {label}
  </button>
);

const StoryFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    storyToEdit: Story | null;
}> = ({ isOpen, onClose, onSubmit, storyToEdit }) => {
    const [formData, setFormData] = useState({
        // FIX: Changed 'eventId' to 'partyId'.
        partyId: '',
        title: '',
        excerpt: '',
        content: '',
        tags: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (storyToEdit) {
            setFormData({
                // FIX: Changed 'eventId' to 'partyId' to match the Story type.
                partyId: storyToEdit.partyId,
                title: storyToEdit.title,
                excerpt: storyToEdit.excerpt,
                content: storyToEdit.content,
                tags: storyToEdit.tags.join(', '),
            });
            setImagePreview(storyToEdit.imageUrl);
        } else {
            // FIX: Changed 'eventId' to 'partyId' and provided a default value for creating new stories.
            setFormData({ partyId: 'party1', title: '', excerpt: '', content: '', tags: '' });
            setImagePreview(null);
        }
    }, [storyToEdit]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imagePreview) {
            alert('Please select an image.');
            return;
        }
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        onSubmit({ id: storyToEdit?.id, ...formData, imageUrl: imagePreview, tags: tagsArray });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
                <h3 className="text-2xl font-bold mb-6 text-brand-text">{storyToEdit ? '스토리 수정' : '새 스토리 작성'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-text">제목</label>
                        <input type="text" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" required />
                    </div>
                     <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-brand-text">요약 (카드에 표시됩니다)</label>
                        <textarea id="excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" required></textarea>
                    </div>
                     <div>
                        <label htmlFor="content" className="block text-sm font-medium text-brand-text">전체 내용</label>
                        <textarea id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={6} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" required></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text">이미지</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 w-full h-48 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="text-center text-stone-500">
                                    <i className="fa-solid fa-camera text-3xl mb-2"></i>
                                    <p>클릭하여 이미지 선택</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-brand-text">태그 (쉼표로 구분)</label>
                        <input type="text" id="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="#태그1, #태그2" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text bg-stone-100 rounded-full hover:bg-stone-200 mr-2">취소</button>
                        <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-brand-primary rounded-full hover:bg-brand-primary-dark">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CommunityPage: React.FC<CommunityPageProps> = ({ stories, onSelectStory, currentUser, onStorySubmit, onDeleteStory, onToggleLike, reports, onAddReport }) => {
  const [activeSection, setActiveSection] = useState<CommunitySection>('STORIES');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState<Story | null>(null);
  const [isReportFormVisible, setIsReportFormVisible] = useState(false);

  const [reportForm, setReportForm] = useState({ title: '', date: '', excerpt: ''});

  const filteredStories = useMemo(() => {
    if (!searchTerm.startsWith('#') || searchTerm.length < 2) {
      return stories;
    }
    const tagToSearch = searchTerm;
    return stories.filter(story =>
      story.tags.some(tag => tag.toLowerCase().includes(tagToSearch.toLowerCase()))
    );
  }, [stories, searchTerm]);
  
  const handleOpenModal = (story: Story | null = null) => {
    setStoryToEdit(story);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStoryToEdit(null);
  };

  const handleFormSubmit = (data: any) => {
    onStorySubmit(data);
    handleCloseModal();
  };

  const handleReportFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (reportForm.title && reportForm.date && reportForm.excerpt) {
        onAddReport(reportForm);
        setReportForm({ title: '', date: '', excerpt: ''});
        setIsReportFormVisible(false);
      }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'STORIES':
        return (
          <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
              <div className="relative flex-grow max-w-lg">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="태그로 검색 (예: #업사이클링)"
                  className="w-full px-5 py-3 rounded-full border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <i className="fa-solid fa-magnifying-glass absolute right-5 top-1/2 -translate-y-1/2 text-stone-400"></i>
              </div>
               {currentUser && (
                <button onClick={() => handleOpenModal()} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-primary-dark transition-colors shadow-md">
                    <i className="fa-solid fa-feather-pointed mr-2"></i>스토리 작성하기
                </button>
               )}
            </div>
            {filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map(story => (
                  <StoryCard key={story.id} story={story} currentUser={currentUser} onSelect={onSelectStory} onEdit={handleOpenModal} onDelete={onDeleteStory} onToggleLike={onToggleLike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/50 rounded-lg">
                <i className="fa-solid fa-comment-slash text-5xl text-stone-300 mb-4"></i>
                <p className="text-brand-text/60">'{searchTerm}'에 해당하는 스토리가 없습니다.</p>
              </div>
            )}
          </section>
        );
      case 'REPORTS':
        return (
          <section className="animate-fade-in space-y-8">
            {currentUser?.isAdmin && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <button 
                        onClick={() => setIsReportFormVisible(!isReportFormVisible)}
                        className="w-full flex justify-between items-center text-left focus:outline-none"
                        aria-expanded={isReportFormVisible}
                        aria-controls="newsletter-form"
                    >
                        <h3 className="text-xl font-semibold text-brand-text">
                            새 뉴스레터 게시하기
                        </h3>
                        <i className={`fa-solid ${isReportFormVisible ? 'fa-chevron-up' : 'fa-chevron-down'} text-brand-primary transition-transform duration-300`}></i>
                    </button>

                    {isReportFormVisible && (
                        <form 
                            id="newsletter-form"
                            onSubmit={handleReportFormSubmit} 
                            className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end animate-fade-in"
                        >
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reportTitle" className="block text-sm font-medium text-brand-text">제목</label>
                                    <input type="text" id="reportTitle" value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} className="mt-1 w-full form-input rounded-md border-stone-300 focus:border-brand-primary focus:ring-brand-primary" required />
                                </div>
                                <div>
                                    <label htmlFor="reportDate" className="block text-sm font-medium text-brand-text">날짜</label>
                                    <input type="date" id="reportDate" value={reportForm.date} onChange={e => setReportForm({...reportForm, date: e.target.value})} className="mt-1 w-full form-input rounded-md border-stone-300 focus:border-brand-primary focus:ring-brand-primary" required />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="reportExcerpt" className="block text-sm font-medium text-brand-text">요약</label>
                                <textarea id="reportExcerpt" value={reportForm.excerpt} onChange={e => setReportForm({...reportForm, excerpt: e.target.value})} rows={3} className="mt-1 w-full form-input rounded-md border-stone-300 focus:border-brand-primary focus:ring-brand-primary" required></textarea>
                            </div>
                            <button type="submit" className="md:col-start-2 justify-self-end bg-brand-text text-white font-bold py-2 px-6 rounded-full hover:bg-black transition-colors">뉴스레터 게시</button>
                        </form>
                    )}
                </div>
            )}
             <div>
                <h3 className="text-2xl font-bold text-brand-text mb-4">뉴스레터</h3>
                <div className="space-y-4">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white p-6 rounded-lg shadow-md">
                            <p className="text-sm text-brand-text/60">{new Date(report.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long'})}</p>
                            <h4 className="text-lg font-semibold text-brand-text mt-1">{report.title}</h4>
                            <p className="text-brand-text/80 mt-2">{report.excerpt}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <StoryFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} storyToEdit={storyToEdit} />
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">커뮤니티</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
          지속가능한 패션을 사랑하는 사람들의 커뮤니티에 오신 것을 환영합니다. 함께 배우고, 나누고, 성장해요.
        </p>
      </div>

      <div className="flex justify-center border-b border-stone-200 mb-12">
        <SectionButton label="커뮤니티 스토리" isActive={activeSection === 'STORIES'} onClick={() => setActiveSection('STORIES')} />
        <SectionButton label="뉴스레터" isActive={activeSection === 'REPORTS'} onClick={() => setActiveSection('REPORTS')} />
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunityPage;