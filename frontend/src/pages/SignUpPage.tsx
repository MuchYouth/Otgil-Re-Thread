import React, { useState } from 'react';
import { Page } from '../types';

interface SignUpPageProps {
    onSignUp: (nickname: string, email: string, phoneNumber: string, userType: 'USER' | 'ADMIN', adminCode: string) => { success: boolean, message: string };
    setPage: (page: Page) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, setPage }) => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'USER' | 'ADMIN'>('USER');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const handleSendCode = () => {
        if (phoneNumber.length < 10) {
            setPhoneError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }
        // Mock API call
        console.log(`Sending verification code to ${phoneNumber}`);
        setPhoneError('');
        setIsCodeSent(true);
    };

    const handleVerifyCode = () => {
        // Mock verification
        if (verificationCode === '123456') {
            setPhoneError('');
            setIsPhoneVerified(true);
            alert('휴대폰 번호가 인증되었습니다!');
        } else {
            setPhoneError('인증번호가 올바르지 않습니다. (힌트: 123456)');
            setIsPhoneVerified(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!nickname || !email || !password) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }
        if (!isPhoneVerified) {
            setError('휴대폰 번호 인증을 먼저 완료해주세요.');
            return;
        }
        if (userType === 'ADMIN' && !adminCode) {
            setError('관리자 코드를 입력해주세요.');
            return;
        }
        const result = onSignUp(nickname, email, phoneNumber, userType, adminCode);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-brand-background animate-fade-in py-12">
            <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">회원가입</h2>
                    <p className="mt-2 text-sm text-brand-text/70">
                        옷길과 함께 지속가능한 패션 여정을 시작하세요.
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-brand-text">계정 종류</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <label className={`relative flex cursor-pointer rounded-lg border bg-white p-3 shadow-sm focus:outline-none ${userType === 'USER' ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-stone-300'}`}>
                                <input type="radio" name="user-type" value="USER" checked={userType === 'USER'} onChange={() => setUserType('USER')} className="sr-only" />
                                <span className="flex flex-1">
                                    <span className="flex flex-col items-center w-full">
                                        <i className="fa-solid fa-user text-xl mb-1"></i>
                                        <span className="block text-sm font-medium">개인</span>
                                    </span>
                                </span>
                            </label>
                            <label className={`relative flex cursor-pointer rounded-lg border bg-white p-3 shadow-sm focus:outline-none ${userType === 'ADMIN' ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-stone-300'}`}>
                                <input type="radio" name="user-type" value="ADMIN" checked={userType === 'ADMIN'} onChange={() => setUserType('ADMIN')} className="sr-only" />
                                <span className="flex flex-1">
                                    <span className="flex flex-col items-center w-full">
                                        <i className="fa-solid fa-building text-xl mb-1"></i>
                                        <span className="block text-sm font-medium">관리자/단체</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-brand-text">닉네임</label>
                        <input id="nickname" name="nickname" type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-text">이메일 주소</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-brand-text">비밀번호</label>
                        <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>

                    {/* Phone Verification Section */}
                    <div className="space-y-2 border-t border-stone-200 pt-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-text">휴대폰 번호 인증</label>
                        <div className="flex gap-2">
                            <input
                                id="phone" name="phone" type="tel" autoComplete="tel" required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="010-1234-5678"
                                disabled={isCodeSent}
                            />
                            <button
                                type="button" onClick={handleSendCode}
                                disabled={isCodeSent}
                                className="flex-shrink-0 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 disabled:bg-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed"
                            >
                                인증번호 발송
                            </button>
                        </div>
                        {isCodeSent && !isPhoneVerified && (
                            <div className="flex gap-2 animate-fade-in">
                                <input
                                    id="code" name="code" type="text" required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                    placeholder="인증번호 6자리 입력"
                                />
                                <button
                                    type="button" onClick={handleVerifyCode}
                                    className="flex-shrink-0 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-secondary hover:bg-brand-secondary-dark"
                                >
                                    인증하기
                                </button>
                            </div>
                        )}
                        {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                        {isPhoneVerified && <p className="text-sm text-green-600"><i className="fa-solid fa-check-circle mr-1"></i>휴대폰 번호가 인증되었습니다.</p>}
                    </div>

                    {userType === 'ADMIN' && (
                        <div className="transition-all duration-300 animate-fade-in">
                            <label htmlFor="adminCode" className="block text-sm font-medium text-brand-text">관리자 코드</label>
                            <input id="adminCode" name="adminCode" type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="관리자/단체 계정용 코드를 입력하세요" />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={!isPhoneVerified}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-stone-400 disabled:cursor-not-allowed"
                        >
                            가입하기
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-brand-text/70">
                    이미 계정이 있으신가요?{' '}
                    <button onClick={() => setPage(Page.LOGIN)} className="font-medium text-brand-primary hover:text-brand-primary-dark">
                        로그인
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;