import React, { useEffect, useState } from 'react';
import Header from '../../common/Header';
import DashboardHeader from './DashboardHeader';
import StoreDashboardCard from './StoreDashboardCard';
import MilkLoader from '../../utils/MilkLoader';

const StoreDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setShowLoader(true);
    const simulateLoad = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (error) {
        console.error('Error in loading:', error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    };

    simulateLoad();
  }, []);

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff] overflow-auto">
        <Header />
        <DashboardHeader />
        {showLoader ? (
          <div className="flex justify-center items-center h-64">
            <MilkLoader />
          </div>
        ) : (
          <StoreDashboardCard />
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;