import React, { useEffect, useState } from 'react';
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import { FaPen, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import InnerHeader from '../Coupon/CouponHeader';
import { handleSort } from '../../utils/sorting';
import { StatusEntity } from '../../utils/StatusEntity';
import api from "../../utils/api"
const StoreListPayout = () => {
  const navigate = useNavigate();
  const [Stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await api.get("/store/fetch");
        console.log("API Response:", response.data); // Debugging: Log the API response
        setStores(response.data);
        setFilteredStores(response.data.stores);
      } catch (error) {
        console.error("Error fetching Stores:", error);
      }
    }
    fetchStores();
  }, []);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = Stores.filter(store =>
      Object.values(store).some(value =>
        String(value).toLowerCase().includes(querySearch)
      )
    );
    setFilteredStores(filteredData);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      const response = await api.delete(`/stores/delete/${id}`);
      if (response.status === 200) {
        NotificationManager.success("Store deleted successfully!");
        setFilteredStores(prevStores => prevStores.filter(store => store.id !== id));
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      NotificationManager.error("Failed to delete store.");
    }
  };

  const updateStore = (id) => {
    navigate('/admin/add-store', { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Stores", id, currentStatus, setFilteredStores, filteredStores, field);
    } catch (error) {
      console.error(error);
    }
  };

  const sortData = (key) => {
    handleSort(filteredStores, key, sortConfig, setSortConfig, setFilteredStores);
  };

  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = Array.isArray(filteredStores) ? filteredStores.slice(indexOfFirstStore, indexOfLastStore) : [];
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  console.log("Current Stores:", currentStores); // Debugging: Log the current stores to be rendered

  return (
    <div>
      <Header />
      <InnerHeader onSearch={handleSearch} name="Payout List Management" />
      <div className="py-6 px-6 h-full overflow-hidden">
  <div className="bg-white w-full rounded-xl h-[63vh] border border-gray-300 py-4 px-3 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
    <table className="min-w-full text-sm text-left text-gray-700 border-collapse border border-gray-300">
      <thead className="bg-gray-200 border border-gray-300">
        <tr>
          <th className="px-4 py-3 border border-gray-300">S. No</th>
          <th className="px-4 py-3 border border-gray-300">Amount</th>
          <th className="px-4 py-3 border border-gray-300">Store Name</th>
          <th className="px-4 py-3 border border-gray-300">Transfer Details</th>
          <th className="px-4 py-3 border border-gray-300">Transfer Type</th>
          <th className="px-4 py-3 border border-gray-300">Vendor Mobile</th>
          <th className="px-4 py-3 border border-gray-300">Transfer Photo</th>
          <th className="px-4 py-3 border border-gray-300">Status</th>
          <th className="px-4 py-3 border border-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};

export default StoreListPayout;