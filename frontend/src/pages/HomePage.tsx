import React, { useEffect, useRef } from 'react';
import { Page } from '../types';

// Custom hook for scroll animation
const useScrollAnimation = <T extends HTMLElement>(delay: number = 0) => {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        element.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [delay]);

    return ref;
};

interface HomePageProps {
  setPage: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-brand-background p-8 rounded-lg border border-stone-200/80 h-full flex flex-col text-left">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-secondary/40 text-brand-primary-dark mb-5">
      <i className={`fa-solid ${icon} text-3xl`}></i>
    </div>
    <h3 className="text-xl font-bold text-brand-text mb-2">{title}</h3>
    <p className="text-brand-text/70 flex-grow">{children}</p>
  </div>
);


const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const card1Ref = useScrollAnimation<HTMLDivElement>();
  const card2Ref = useScrollAnimation<HTMLDivElement>(200);
  const card3Ref = useScrollAnimation<HTMLDivElement>(400);

  return (
    <div className="animate-fade-in">
      <main>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-brand-text leading-tight">
                당신의 옷에게<br/>
                새로운 이야기를.
                </h1>
                <p className="mt-8 text-lg text-brand-text/70 max-w-lg mx-auto md:mx-0 md:leading-relaxed">
                지속가능한 패션의 흐름에 동참하세요. Ot-gil에서 사용하지 않는 옷을 교환하고, 새로운 스타일을 발견하며 탄소 발자국을 줄여보세요.
                </p>
                <button
                    onClick={() => setPage(Page.BROWSE)}
                    className="group mt-12 inline-flex items-center space-x-3 bg-brand-text text-brand-background font-bold py-4 px-10 rounded-full hover:bg-black transition-all duration-300 shadow-lg"
                >
                    <span>교환 시작하기</span>
                    <i className="fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1.5"></i>
                </button>
            </div>
            <div className="relative h-96 md:h-[500px]">
                <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop" alt="Stylish clothing on a rack" className="absolute top-0 left-0 md:left-10 w-3/5 h-auto object-cover rounded-lg shadow-2xl transform -rotate-3" />
                <img src="https://images.unsplash.com/photo-1551647467-33a39036733f?q=80&w=800&auto=format&fit=crop" alt="Hands exchanging a piece of clothing" className="absolute bottom-0 right-0 w-1/2 h-auto object-cover rounded-lg shadow-xl transform rotate-2" />
            </div>
            </div>
        </div>

        {/* Features Section */}
        <section className="bg-white py-24">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-brand-text">이용 방법</h2>
                    <p className="text-brand-text/60 mt-2 text-lg">간단하고 지속가능한 방법으로 당신의 옷장을 새롭게.</p>
                </div>
                <div className="flex flex-wrap items-stretch -mx-4">
                    <div ref={card1Ref} className="w-full md:w-4/12 px-4 mb-8 scroll-animate">
                        <FeatureCard icon="fa-shirt" title="간편한 의류 교환">
                           몇 번의 클릭만으로 당신의 옷을 등록하고, 다른 사람들의 멋진 옷들을 둘러보세요. 새로운 아이템을 발견하는 즐거움을 되찾아보세요.
                        </FeatureCard>
                    </div>
                    <div ref={card2Ref} className="w-full md:w-4/12 px-4 mb-8 scroll-animate">
                         <FeatureCard icon="fa-seedling" title="나의 영향력 측정">
                            옷을 교환할 때마다 얼마나 많은 물을 절약하고 CO₂를 줄이는지 확인하세요. 당신이 만드는 긍정적인 변화를 직접 목격할 수 있습니다.
                        </FeatureCard>
                    </div>
                    <div ref={card3Ref} className="w-full md:w-4/12 px-4 mb-8 scroll-animate">
                         <FeatureCard icon="fa-users" title="지속가능한 커뮤니티">
                            Ot-gil은 단순한 교환 플랫폼을 넘어, 의식 있는 소비자들이 함께하는 커뮤니티입니다. 지속가능한 라이프스타일을 향한 당신의 여정을 공유하세요.
                        </FeatureCard>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;