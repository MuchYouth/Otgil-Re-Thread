import React from 'react';

interface AdminStatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-3xl text-white`}></i>
      </div>
      <div>
        <p className="text-stone-500 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminStatCard;