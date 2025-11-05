import React, { useState } from 'react';

const NewsletterSignup: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            alert(`감사합니다! ${email} 주소로 옷길의 소식을 보내드릴게요.`);
            setEmail('');
        }
    };

    return (
        <div className="bg-brand-secondary p-8 rounded-xl shadow-lg text-white">
            <div className="max-w-xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-2">옷길 뉴스레터 구독하기</h3>
                <p className="mb-6 opacity-90">
                    지속가능한 패션 트렌드, 커뮤니티의 새로운 소식, 다가오는 이벤트를 가장 먼저 만나보세요.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        className="flex-grow px-4 py-3 rounded-md text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-secondary-dark"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-white text-brand-secondary-dark font-bold px-6 py-3 rounded-md hover:bg-brand-background transition-colors"
                    >
                        구독하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewsletterSignup;