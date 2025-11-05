
import React from 'react';
import { User, ImpactStats } from '../types';
import ImpactDashboard from '../components/ImpactDashboard';

interface DashboardPageProps {
  user: User;
  stats: ImpactStats;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">나의 영향력 대시보드</h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-stone-600">
          당신의 작은 실천이 만들어낸 긍정적인 변화를 확인해보세요.
        </p>
      </div>
      <ImpactDashboard user={user} stats={stats} />
    </div>
  );
};

export default DashboardPage;
