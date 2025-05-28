import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { FaBox, FaClock, FaShoppingCart, FaClipboardList, FaMotorcycle, FaHourglassStart } from 'react-icons/fa';
import api from '../../utils/api';

const StoreDashboardCard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const store_id = Cookies.get('store_id');
        console.log('Store ID from cookies:', store_id);
        if (!store_id) {
          console.error('Store ID not found in cookies');
          return;
        }

        const response = await api.get(`/storedash/dashboard/${store_id}`);
        console.log('Updated Dashboard API response:', response.data);
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          console.error('API response unsuccessful:', response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!dashboardData) return;

    const flatCounts = {
      productInventory: dashboardData.productInventory || 0,
      times: dashboardData.times || 0,
      riders: dashboardData.riders || 0,
      normalPending: dashboardData.normalPending || 0,
      normalProcessing: dashboardData.normalProcessing || 0,
      normalCompleted: dashboardData.normalCompleted || 0,
      normalCancelled: dashboardData.normalCancelled || 0,
      subscribePending: dashboardData.subscribePending || 0,
      subscribeProcessing: dashboardData.subscribeProcessing || 0,
      subscribeCompleted: dashboardData.subscribeCompleted || 0,
      subscribeCancelled: dashboardData.subscribeCancelled || 0,
      newNormalOrders: dashboardData.normalProcessing || 0,
      newSubscribeOrders: dashboardData.subscribeProcessing || 0,
    };

    Object.keys(flatCounts).forEach((key) => {
      let start = 0;
      let end = flatCounts[key] || 0;
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
  }, [dashboardData]);

  const cards = [
    { key: 'productInventory', title: 'PRODUCTS', icon: <FaBox className="text-[#393185] text-3xl" />, path: '/store/productinv-list' },
    { key: 'times', title: 'TIME SLOTS', icon: <FaClock className="text-[#393185] text-3xl" />, path: '/store/rider-timeslot' },
    { key: 'normalPending', title: 'PENDING INSTANT ORDERS', icon: <FaShoppingCart className="text-[#393185] text-3xl" />, path: '/store/pending-order' },
    { key: 'normalCompleted', title: 'COMPLETED INSTANT ORDERS', icon: <FaShoppingCart className="text-[#393185] text-3xl" />, path: '/store/completed-order' },
    { key: 'normalCancelled', title: 'CANCELLED INSTANT ORDERS', icon: <FaShoppingCart className="text-[#393185] text-3xl" />, path: '/store/cancelled-order' },
    { key: 'subscribePending', title: 'PENDING SUBSCRIBE ORDERS', icon: <FaClipboardList className="text-[#393185] text-3xl" />, path: '/store/subpending-order' },
    { key: 'subscribeCompleted', title: 'COMPLETED SUBSCRIBE ORDERS', icon: <FaClipboardList className="text-[#393185] text-3xl" />, path: '/store/subcompleted-order' },
    { key: 'subscribeCancelled', title: 'CANCELLED SUBSCRIBE ORDERS', icon: <FaClipboardList className="text-[#393185] text-3xl" />, path: '/store/subcancelled-order' },
    { key: 'newNormalOrders', title: 'NEW INSTANT ORDERS', icon: <FaHourglassStart className="text-[#393185] text-3xl" /> },
    { key: 'newSubscribeOrders', title: 'NEW SUBSCRIBE ORDERS', icon: <FaHourglassStart className="text-[#393185] text-3xl" />, },
    { key: 'riders', title: 'RIDERS', icon: <FaMotorcycle className="text-[#393185] text-3xl" />, path: '/store/rider-list' },
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
                  className={`bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 max-w-xs w-full transition-transform duration-300 hover:scale-105 ${card.path ? 'cursor-pointer' : 'cursor-default'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => card.path && navigate(card.path)}
                >
                  <div className="bg-[#F2F6FE] p-4 rounded-lg flex items-center justify-center w-[4vw] h-full">
                    {card.icon}
                  </div>
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

export default StoreDashboardCard;