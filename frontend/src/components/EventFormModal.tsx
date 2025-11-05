import React, { useState, useEffect } from 'react';
import { Party } from '../types';

interface PartyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Updated the onSubmit prop type to be more specific for both create and update scenarios, resolving type errors.
    onSubmit: (partyData: Party | Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status'>) => void;
    eventToEdit: Party | null; // Renamed for clarity, though prop name from parent is the same
}

const PartyFormModal: React.FC<PartyFormModalProps> = ({ isOpen, onClose, onSubmit, eventToEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        imageUrl: '',
        details: '', // Will be a newline-separated string
    });

    // Helper to convert "Month Day, Year" or other parseable formats to "YYYY-MM-DD"
    const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            // Check if the date is valid
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error("Error parsing date for input:", e);
            return '';
        }
    };
    
    // Helper to convert "YYYY-MM-DD" to a readable format
    const formatDateForDisplay = (dateString: string): string => {
        if (!dateString) return '';
        return dateString; // Keep it as YYYY-MM-DD which is fine
    };


    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                setFormData({
                    title: eventToEdit.title,
                    description: eventToEdit.description,
                    date: formatDateForInput(eventToEdit.date),
                    location: eventToEdit.location,
                    imageUrl: eventToEdit.imageUrl,
                    details: eventToEdit.details.join('\n'),
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    date: '',
                    location: '',
                    imageUrl: '',
                    details: '',
                });
            }
        }
    }, [eventToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const partyData = {
            ...formData,
            date: formatDateForDisplay(formData.date), // Convert back to display format
            details: formData.details.split('\n').filter(Boolean),
        };
        
        if (eventToEdit) {
            onSubmit({ ...eventToEdit, ...partyData });
        } else {
            onSubmit(partyData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
                <h3 className="text-xl font-bold mb-4 text-brand-text">{eventToEdit ? '21% 파티 수정' : '새 21% 파티 추가'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-text">파티명</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-stone-300" required />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-brand-text">날짜</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-stone-300" required />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-brand-text">장소</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-stone-300" required />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-text">이미지 URL</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-stone-300" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text">설명</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md border-stone-300" required></textarea>
                    </div>
                     <div>
                        <label htmlFor="details" className="block text-sm font-medium text-brand-text">상세 정보 (한 줄에 하나씩)</label>
                        <textarea name="details" id="details" value={formData.details} onChange={handleChange} rows={4} className="mt-1 w-full p-2 border rounded-md border-stone-300"></textarea>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text bg-stone-100 rounded-full hover:bg-stone-200">취소</button>
                        <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-brand-primary rounded-full hover:bg-brand-primary-dark">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartyFormModal;
