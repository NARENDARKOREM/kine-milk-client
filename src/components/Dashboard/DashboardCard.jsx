import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaImages, FaTags, FaShoppingCart, FaClipboardList, FaTicketAlt, FaQuestionCircle, FaStore, FaUserShield, FaUsers, FaDatabase } from "react-icons/fa";
import api from "../../utils/api"
const DashboardCard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/admindash/dashboard");
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      Object.keys(dashboardData).forEach((key) => {
        let start = 0;
        let end = dashboardData[key];

        const duration = 1000;
        const stepTime = 20;
        const steps = Math.ceil(duration / stepTime);
        const increment = end / steps;

        let currentValue = start;
        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= end) {
            currentValue = end;
            clearInterval(interval);
          }
          setCounts((prevCounts) => ({
            ...prevCounts,
            [key]: Math.floor(currentValue),
          }));
        }, stepTime);
      });
    }
  }, [dashboardData]);

  // Define the card details for each section with respective icons
  const cards = [
    { key: "banners", title: "BANNERS", icon: <FaImages className="text-[#393185] text-3xl" /> },
    { key: "categories", title: "CATEGORIES", icon: <FaTags className="text-[#393185] text-3xl" /> },
    { key: "products", title: "PRODUCTS", icon: <FaShoppingCart className="text-[#393185] text-3xl" /> },
    { key: "productImages", title: "PRODUCT IMAGES", icon: <FaClipboardList className="text-[#393185] text-3xl" /> },
    { key: "coupons", title: "COUPONS", icon: <FaTicketAlt className="text-[#393185] text-3xl" /> },
    { key: "faqs", title: "FAQs", icon: <FaQuestionCircle className="text-[#393185] text-3xl" /> },
    { key: "stores", title: "STORES", icon: <FaStore className="text-[#393185] text-3xl" /> },
    { key: "admins", title: "ADMINS", icon: <FaUserShield className="text-[#393185] text-3xl" /> },
    { key: "users", title: "USERS", icon: <FaUsers className="text-[#393185] text-3xl" /> },
    { key: "totalRecords", title: "TOTAL RECORDS", icon: <FaDatabase className="text-[#393185] text-3xl" /> },
  ];

  

  return (
    <div className="overflow-auto scrollbar-none">
      <div className="py-1 px-3 overflow-x-auto scrollbar-none">
        <div className="relative sm:rounded-lg">
          <div className="px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, index) => (
                <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 max-w-xs w-full transition-transform duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Icon Container - Remains on the Left */}
                <div className="bg-[#F2F6FE] p-4 rounded-lg flex items-center justify-center w-[4vw] h-full">
                  {card.icon}
                </div>
              
                {/* Text Container - Centered */}
                <div className="flex flex-col items-center justify-center flex-grow">
                  <motion.p
                    className="text-2xl font-extrabold text-[#393185]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {counts?.[card.key] ?? 0}
                  </motion.p>
                  <h6 className="text-sm text-[#25064C] font-semibold mt-1 text-center">
                    {card.title}
                  </h6>
                </div>
              </motion.div>
              
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
