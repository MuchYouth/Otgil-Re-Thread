import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-24 h-24 border-8'
    };

    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-brand-secondary border-t-transparent`}></div>
    );
};

export default Spinner;