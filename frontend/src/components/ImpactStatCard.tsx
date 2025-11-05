import React from 'react';

interface ImpactStatCardProps {
    icon: string;
    label: string;
    value: string;
    color: string;
}

const ImpactStatCard: React.FC<ImpactStatCardProps> = ({ icon, label, value, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                <i className={`fa-solid ${icon} text-3xl text-white`}></i>
            </div>
            <div>
                <p className="text-brand-text/60 text-sm">{label}</p>
                <p className="text-2xl font-bold text-brand-text">{value}</p>
            </div>
        </div>
    );
};

export default ImpactStatCard;