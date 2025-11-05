import React, { useState, useRef } from 'react';
import { generateClothingInfo, ClothingInfo } from '../services/geminiService';
import { ClothingCategory, Party, GoodbyeTag, HelloTag } from '../types';
import Spinner from '../components/Spinner';

interface UploadPageProps {
  onItemAdd: (
    item: Omit<ClothingInfo, 'description'> & { description: string, size: string, imageUrl: string },
    options: {
        goodbyeTag?: GoodbyeTag;
        helloTag?: HelloTag;
        selectedPartyId?: string | null;
    }
  ) => void;
  acceptedParties: Party[];
}

const UploadPage: React.FC<UploadPageProps> = ({ onItemAdd, acceptedParties }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('T-SHIRT');
  const [size, setSize] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tagType, setTagType] = useState<'GOODBYE' | 'HELLO'>('GOODBYE');

  const [goodbyeTag, setGoodbyeTag] = useState<GoodbyeTag>({
    metWhen: '',
    metWhere: '',
    whyGot: '',
    wornCount: 0,
    whyLetGo: '',
    finalMessage: '',
  });

  const [helloTag, setHelloTag] = useState<HelloTag>({
    receivedFrom: '',
    receivedAt: '',
    firstImpression: '',
    helloMessage: '',
  });

  const [selectedParty, setSelectedParty] = useState<string>('GENERAL'); // GENERAL or partyId
  
  const standardInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as string'));
            }
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      setError('먼저 이미지를 선택해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(imageFile);
      const info = await generateClothingInfo(base64Image);
      setName(info.name);
      setDescription(info.description);
      setCategory(info.category);
    } catch (err) {
      setError((err as Error).message || "이미지 분석 중 오류가 발생했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (tagType === 'GOODBYE') {
        setGoodbyeTag(prev => ({ ...prev, [name]: name === 'wornCount' ? Number(value) : value }));
    } else {
        setHelloTag(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !size || !imagePreview) {
        setError('옷 기본 정보를 모두 입력해주세요.');
        return;
    }

    const itemData = { name, description, category, size, imageUrl: imagePreview };
    
    if (tagType === 'GOODBYE') {
        const partyId = selectedParty === 'GENERAL' ? null : selectedParty;
        onItemAdd(itemData, { goodbyeTag, selectedPartyId: partyId });
    } else { // HELLO
        onItemAdd(itemData, { helloTag });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">내 옷 등록하기</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
          당신의 옷에게 새로운 이야기를 선물하고, 다음 주인을 찾아주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* Step 1: Basic Info */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-brand-text mb-6 border-b pb-4">1. 옷 기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-stone-500">
                    <i className="fa-solid fa-camera text-4xl mb-2"></i>
                    <p>클릭하여 이미지 선택</p>
                  </div>
                )}
              </div>
              <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={!imageFile || isLoading}
                  className="mt-4 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-brand-primary-dark transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                  {isLoading ? <Spinner size="sm" /> : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>AI로 분석하기</>}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-text">이름</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={standardInputClasses} required />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-brand-text">설명</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={standardInputClasses} required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-brand-text">카테고리</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as ClothingCategory)} className={standardInputClasses} required>
                        <option>T-SHIRT</option><option>JEANS</option><option>DRESS</option><option>JACKET</option><option>ACCESSORY</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="size" className="block text-sm font-medium text-brand-text">사이즈</label>
                    <input type="text" id="size" value={size} onChange={e => setSize(e.target.value)} className={standardInputClasses} placeholder="예: M, 95" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Tag Type Selection & Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-brand-text mb-6 border-b pb-4">2. 태그 종류 선택 및 작성</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
             <button type="button" onClick={() => setTagType('GOODBYE')} className={`p-4 rounded-lg border-2 text-center transition-all ${tagType === 'GOODBYE' ? 'border-brand-primary bg-brand-primary/10 shadow-md' : 'border-stone-200 bg-white hover:border-brand-primary/50'}`}>
                <i className="fa-solid fa-hand-holding-heart text-2xl text-brand-primary mb-2"></i>
                <span className="block font-bold text-brand-text">Goodbye 태그</span>
                <span className="text-xs text-brand-text/70">떠나보낼 옷의 이야기를 작성합니다.</span>
             </button>
             <button type="button" onClick={() => setTagType('HELLO')} className={`p-4 rounded-lg border-2 text-center transition-all ${tagType === 'HELLO' ? 'border-brand-secondary bg-brand-secondary/10 shadow-md' : 'border-stone-200 bg-white hover:border-brand-secondary/50'}`}>
                <i className="fa-solid fa-hand-sparkles text-2xl text-brand-secondary mb-2"></i>
                <span className="block font-bold text-brand-text">Hello 태그</span>
                <span className="text-xs text-brand-text/70">나에게 온 옷의 이야기를 작성합니다.</span>
            </button>
          </div>

          {tagType === 'GOODBYE' ? (
             <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text">언제 만났나요?</label>
                  <input type="text" name="metWhen" value={goodbyeTag.metWhen} onChange={handleTagChange} className={standardInputClasses} placeholder="예: 2022년 여름" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-brand-text">어디서 만났나요?</label>
                  <input type="text" name="metWhere" value={goodbyeTag.metWhere} onChange={handleTagChange} className={standardInputClasses} placeholder="예: 성수동 빈티지샵" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text">왜 갖게 되었나요?</label>
                <input type="text" name="whyGot" value={goodbyeTag.whyGot} onChange={handleTagChange} className={standardInputClasses} placeholder="예: 색감이 너무 예뻐서" />
              </div>
               <div>
                  <label className="block text-sm font-medium text-brand-text">몇 번이나 입었나요?</label>
                  <input type="number" name="wornCount" value={goodbyeTag.wornCount} onChange={handleTagChange} className={standardInputClasses} />
                </div>
              <div>
                <label className="block text-sm font-medium text-brand-text">왜 떠나보내나요?</label>
                <textarea name="whyLetGo" value={goodbyeTag.whyLetGo} onChange={handleTagChange} rows={2} className={standardInputClasses} placeholder="예: 스타일이 바뀌어서"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text">떠나보내며 한마디</label>
                <textarea name="finalMessage" value={goodbyeTag.finalMessage} onChange={handleTagChange} rows={2} className={standardInputClasses} placeholder="예: 좋은 주인 만나 행복하길!"></textarea>
              </div>
           </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text">누구에게서 받았나요?</label>
                  <input type="text" name="receivedFrom" value={helloTag.receivedFrom} onChange={handleTagChange} className={standardInputClasses} placeholder="예: EcoFashionista" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-brand-text">어디서 만났나요?</label>
                  <input type="text" name="receivedAt" value={helloTag.receivedAt} onChange={handleTagChange} className={standardInputClasses} placeholder="예: 21% 파티에서" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text">첫인상은 어땠나요?</label>
                <input type="text" name="firstImpression" value={helloTag.firstImpression} onChange={handleTagChange} className={standardInputClasses} placeholder="예: 나에게 딱 맞는 옷이라고 생각했어요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text">새로운 옷에게 한마디</label>
                <textarea name="helloMessage" value={helloTag.helloMessage} onChange={handleTagChange} rows={2} className={standardInputClasses} placeholder="예: 앞으로 잘 부탁해, 나의 새로운 최애템!"></textarea>
              </div>
           </div>
          )}
        </div>

        {/* Step 3: Listing Options (Only for GOODBYE tags) */}
        {tagType === 'GOODBYE' && (
          <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-brand-text mb-6 border-b pb-4">3. 등록 방식 선택</h3>
              <div>
                <label htmlFor="listing-options" className="block text-sm font-medium text-brand-text mb-2">이 옷을 어떻게 내놓을까요?</label>
                <select 
                  id="listing-options"
                  value={selectedParty}
                  onChange={e => setSelectedParty(e.target.value)}
                  className={standardInputClasses}
                >
                    <option value="GENERAL">옷장에 먼저 보관하기 (나중에 파티 선택)</option>
                    {acceptedParties.map(party => (
                      <option key={party.id} value={party.id}>21% 파티 출품: {party.title}</option>
                    ))}
                </select>
                {acceptedParties.length === 0 && (
                  <p className="text-xs text-brand-text/60 mt-2">참가 승인된 21% 파티가 있는 경우, 여기에 목록이 표시됩니다.</p>
                )}
              </div>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        <button type="submit" className="w-full bg-brand-text text-white font-bold py-4 px-4 rounded-full hover:bg-black transition-colors text-lg">
          내 옷 등록 완료하기
        </button>
      </form>
    </div>
  );
};

export default UploadPage;