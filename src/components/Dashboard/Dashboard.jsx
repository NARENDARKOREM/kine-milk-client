import React, { useEffect, useState } from "react";
import Header from "../../common/Header";
import DashboardHeader from "./DashboardHeader";
import DashboardCard from "./DashboardCard";
import MilkLoader from "../../utils/MilkLoader"; // Import MilkLoader
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false); // Tracks actual loading state (e.g., API calls)
  const [showLoader, setShowLoader] = useState(true); // Controls loader visibility

  // Simulate a loading effect on mount (replace with actual API call if needed)
  useEffect(() => {
    setShowLoader(true); // Show loader on mount
    // Simulate data loading (or replace with real API call)
    const simulateLoad = async () => {
      setIsLoading(true);
      try {
        // Simulate a quick load (e.g., no actual delay here, just for demo)
        await new Promise((resolve) => setTimeout(resolve, 0)); // Replace with real API call if needed
      } catch (error) {
        console.error("Error in loading:", error);
      } finally {
        setIsLoading(false);
        // Ensure loader shows for at least 2 seconds
        setTimeout(() => {
          setShowLoader(false);
        }, 2000); // 2000ms = 2 seconds
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
          <div className="flex justify-center items-center h-64 w-full">
            <MilkLoader />
          </div>
        ) : (
          <DashboardCard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;