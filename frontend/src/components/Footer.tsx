import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-stone-200/80 mt-16">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-brand-text/60">
                <p>&copy; {new Date().getFullYear()} Ot-gil. 지속가능한 패션을 향한 한 걸음.</p>
            </div>
        </footer>
    );
};

export default Footer;