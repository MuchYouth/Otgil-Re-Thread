import React, { useState } from 'react';
import { Page } from '../types';

interface LoginPageProps {
  onLogin: (email: string) => void; // 반환 타입을 boolean에서 void로 변경 (비동기 처리 때문)
  setPage: (page: Page) => void;
}

// A simple social login button component
const SocialButton: React.FC<{
  provider: 'Kakao' | 'Naver' | 'Google' | 'Facebook';
  bgColor: string;
  textColor: string;
  icon: string | React.ReactNode;
  onClick: () => void;
}> = ({ provider, bgColor, textColor, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{ backgroundColor: bgColor, color: textColor, border: bgColor === '#FFFFFF' ? '1px solid #e5e7eb' : 'none' }}
            className="w-full flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90"
        >
            {typeof icon === 'string' ? <i className={`fa-brands ${icon} text-lg mr-2`}></i> : icon}
            {provider}
        </button>
    );
};


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // [수정됨] 백엔드와 통신하는 진짜 로그인 함수
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // 에러 초기화

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
        // 1. FastAPI OAuth2Form은 JSON이 아니라 FormData를 받습니다.
        const formData = new FormData();
        formData.append("username", email); // [중요] 백엔드는 'username'이라는 필드명을 원함 (값은 이메일)
        formData.append("password", password);

        // 2. 백엔드로 요청 보내기
        const response = await fetch("http://localhost:8000/users/login", {
            method: "POST",
            body: formData, // FormData는 자동으로 Content-Type을 설정하므로 헤더 생략 가능
        });

        // 3. 실패 처리 (400, 401 등)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "로그인에 실패했습니다.");
        }

        // 4. 성공 처리
        const data = await response.json();
        
        // 토큰 저장 (매우 중요)
        localStorage.setItem("access_token", data.access_token);
        
        // 부모 컴포넌트에 "로그인 성공함!" 알리기
        onLogin(email); 

    } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "서버 통신 중 오류가 발생했습니다.");
    }
  };

  const handleSocialLogin = () => {
    // 소셜 로그인은 나중에 구현
    alert("아직 구현되지 않은 기능입니다.");
  };

  const naverIcon = (
    <span className="font-extrabold text-lg mr-2 leading-none">N</span>
  );
  const kakaoIcon = (
    <i className="fa-solid fa-comment text-lg mr-2"></i>
  );


  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-brand-background animate-fade-in py-12">
      <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">로그인</h2>
          <p className="mt-2 text-sm text-brand-text/70">
            다시 만나서 반가워요!
          </p>
        </div>

        <div>
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-text">이메일 주소</label>
                <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="you@example.com"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-text">비밀번호</label>
                <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="********"
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
                <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                로그인
                </button>
            </div>
            </form>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-stone-500 text-xs">소셜 계정으로 계속하기</span>
                <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <SocialButton provider="Kakao" bgColor="#FEE500" textColor="#191919" icon={kakaoIcon} onClick={handleSocialLogin} />
                <SocialButton provider="Naver" bgColor="#03C75A" textColor="#FFFFFF" icon={naverIcon} onClick={handleSocialLogin} />
                <SocialButton provider="Google" bgColor="#FFFFFF" textColor="#444444" icon="fa-google" onClick={handleSocialLogin} />
                <SocialButton provider="Facebook" bgColor="#1877F2" textColor="#FFFFFF" icon="fa-facebook-f" onClick={handleSocialLogin} />
            </div>
        </div>

        <p className="text-sm text-center text-brand-text/70 pt-4">
          계정이 없으신가요?{' '}
          <button onClick={() => setPage(Page.SIGNUP)} className="font-medium text-brand-primary hover:text-brand-primary-dark">
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;