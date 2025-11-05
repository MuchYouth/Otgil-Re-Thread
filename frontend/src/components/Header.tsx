import React, { useState } from 'react';
import { Page, User } from '../types';

interface HeaderProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const SidebarNavLink: React.FC<{
  label: string;
  page: Page;
  currentPage: Page;
  setPage: (page: Page) => void;
  closeMenu: () => void;
}> = ({ label, page, currentPage, setPage, closeMenu }) => {
  const handleClick = () => {
    setPage(page);
    closeMenu();
  };
  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 rounded-md text-lg transition-colors ${
        currentPage === page
          ? 'font-bold bg-brand-primary/10 text-brand-primary'
          : 'text-brand-text/80 hover:bg-stone-100'
      }`}
    >
      {label}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentPage, setPage, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 bg-brand-background/80 backdrop-blur-md z-30 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            {/* Left: Menu Icon */}
            <div className="flex-1 flex justify-start">
                <button 
                    onClick={toggleMenu} 
                    className="p-2 rounded-md text-brand-text/70 hover:text-brand-text hover:bg-stone-100 transition-colors"
                    aria-label="Open menu"
                >
                    <i className="fa-solid fa-bars text-2xl"></i>
                </button>
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                 <button onClick={() => { setPage(Page.HOME); closeMenu(); }}>
                    <span className="font-black text-4xl tracking-tighter text-brand-text">OT-GIL</span>
                </button>
            </div>

            {/* Right: User Actions */}
            <div className="flex-1 flex justify-end">
              <div className="flex items-center">
                  {user ? (
                      <>
                          <span className="hidden sm:inline text-brand-text/80 text-sm">환영합니다, {user.nickname}님!</span>
                          <button
                            onClick={() => setPage(Page.MY_PAGE)}
                            aria-label="마이페이지"
                            className="ml-2 sm:ml-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 sm:w-auto sm:h-auto sm:rounded-none sm:bg-transparent sm:hover:bg-transparent text-sm font-medium text-brand-text/70 hover:text-brand-text transition-colors"
                          >
                            <i className="fa-solid fa-user-circle text-xl sm:hidden" aria-hidden="true"></i>
                            <span className="hidden sm:inline">마이페이지</span>
                          </button>
                          <button
                            onClick={onLogout}
                            aria-label="로그아웃"
                            className="ml-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 sm:w-auto sm:h-auto sm:rounded-none sm:bg-transparent sm:hover:bg-transparent text-sm font-medium text-brand-text/70 hover:text-brand-text transition-colors"
                          >
                             <i className="fa-solid fa-right-from-bracket text-xl sm:hidden" aria-hidden="true"></i>
                             <span className="hidden sm:inline">로그아웃</span>
                          </button>
                      </>
                  ) : (
                      <>
                          <button
                            onClick={() => setPage(Page.LOGIN)}
                            aria-label="로그인"
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 sm:w-auto sm:h-auto sm:rounded-md sm:bg-transparent text-sm font-medium text-brand-text/70 hover:text-brand-text transition-colors sm:px-4 sm:py-2"
                            >
                            <i className="fa-solid fa-right-to-bracket text-xl sm:hidden" aria-hidden="true"></i>
                            <span className="hidden sm:inline">로그인</span>
                          </button>
                          <button
                            onClick={() => setPage(Page.SIGNUP)}
                            aria-label="회원가입"
                            className="ml-2 flex items-center justify-center w-10 h-10 bg-brand-primary text-white rounded-full text-sm font-bold hover:bg-brand-primary-dark transition-colors sm:w-auto sm:h-auto sm:px-5 sm:py-2.5"
                          >
                            <i className="fa-solid fa-user-plus text-xl sm:hidden" aria-hidden="true"></i>
                            <span className="hidden sm:inline">회원가입</span>
                          </button>
                      </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </header>

       {/* Overlay */}
       <div 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeMenu}
            aria-hidden="true"
        ></div>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-brand-background shadow-xl z-50 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div>
          <div className="flex justify-between items-center p-4 border-b border-stone-200/80">
            <span className="font-bold text-xl text-brand-text">메뉴</span>
            <button onClick={closeMenu} className="p-2 rounded-md text-brand-text/70 hover:text-brand-text hover:bg-stone-100 transition-colors" aria-label="Close menu">
              <i className="fa-solid fa-times text-2xl"></i>
            </button>
          </div>
          <nav className="p-4">
              <SidebarNavLink label="21% 파티" page={Page.TWENTY_ONE_PERCENT_PARTY} currentPage={currentPage} setPage={setPage} closeMenu={closeMenu} />
              <SidebarNavLink label="이웃의 옷장" page={Page.NEIGHBORS_CLOSET} currentPage={currentPage} setPage={setPage} closeMenu={closeMenu} />
              <SidebarNavLink label="메이커스 허브" page={Page.MAKERS_HUB} currentPage={currentPage} setPage={setPage} closeMenu={closeMenu} />
              <SidebarNavLink label="스토어" page={Page.REWARDS} currentPage={currentPage} setPage={setPage} closeMenu={closeMenu} />
              <SidebarNavLink label="커뮤니티" page={Page.COMMUNITY} currentPage={currentPage} setPage={setPage} closeMenu={closeMenu} />
          </nav>
        </div>
        {user && user.isAdmin && (
            <div className="mt-auto p-4">
                <button
                  onClick={() => { setPage(Page.ADMIN); closeMenu(); }}
                  className={`w-full text-left px-4 py-3 rounded-md text-lg transition-colors bg-brand-text text-white hover:bg-black ${currentPage === Page.ADMIN ? 'ring-2 ring-offset-2 ring-brand-secondary' : ''}`}
                >
                  <i className="fa-solid fa-user-shield mr-3"></i>
                  관리자 페이지
                </button>
            </div>
        )}
      </div>
    </>
  );
};

export default Header;