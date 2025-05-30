import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../../../utils/api';
import { NotificationManager } from 'react-notifications';
import Cookies from 'js-cookie';
import { ReactComponent as Download } from '../../../assets/images/Download.svg';
import { ReactComponent as LeftArrow } from '../../../assets/images/Left Arrow.svg';
import { ReactComponent as RightArrow } from '../../../assets/images/Right Arrow.svg';

const OrderReportsTableByStore = ({ reportType = 'normal', searchTerm, fromDate, toDate }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const store_id = Cookies.get('store_id');
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (store_id) {
      fetchOrders();
    } else {
      NotificationManager.error('Store ID not found in cookies');
    }
  }, [fromDate, toDate, currentPage, store_id]);

  useEffect(() => {
    // Client-side search filtering
    if (!debouncedSearch) {
      setFilteredOrders(orders);
      setTotalItems(orders.length);
    } else {
      const lowerSearch = debouncedSearch.toLowerCase();
      const filtered = orders.filter((order) =>
        order.order_id?.toLowerCase().includes(lowerSearch) ||
        new Date(order.order_date).toLocaleDateString().toLowerCase().includes(lowerSearch) ||
        order.username?.toLowerCase().includes(lowerSearch) ||
        order.store_name?.toLowerCase().includes(lowerSearch) ||
        order.order_status?.toLowerCase().includes(lowerSearch) ||
        order.user_mobile_no?.toLowerCase().includes(lowerSearch)
      );
      setFilteredOrders(filtered);
      setTotalItems(filtered.length);
      setCurrentPage(1); // Reset to first page on search
    }
  }, [debouncedSearch, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const endpoint = reportType === 'normal' ? 'normal-orders-by-store' : 'subscribe-orders-by-store';
      const response = await api.get(`/orders/orders/${endpoint}`, {
        params: {
          store_id,
          fromDate,
          toDate,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      const { orders, total } = response.data;
      setOrders(orders || []);
      setFilteredOrders(orders || []);
      // Set totalItems based on backend total if no search, else it will be set by search filter
      if (!debouncedSearch) {
        setTotalItems(total || 0);
      }
    } catch (error) {
      console.error(`Error fetching ${reportType} orders:`, error);
      NotificationManager.removeAll()
      NotificationManager.error(`Failed to fetch ${reportType} orders.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleDownload = async (order) => {
    try {
      const endpoint = reportType === 'normal' ? 'normal-orders-by-store' : 'subscribe-orders-by-store';
      const response = await api.get(`/orders/orders/${endpoint}/${order.order_id}/download`, {
        params: { store_id },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_order_${order.order_id}_by_store.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.deleteObjectURL(url);
      NotificationManager.removeAll()
      NotificationManager.success('Download successful');
    } catch (error) {
      console.error(`Error downloading single ${reportType} order:`, error);
      NotificationManager.removeAll()
      NotificationManager.error(`Failed to download single ${reportType} order.`);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);
  const currentRows = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    'Order ID',
    'Order Date',
    'Username',
    'Store Name',
    'Order Status',
    'User Mobile No',
    ...(reportType === 'subscribe' ? ['Timeslot'] : []),
  ];

  return (
    <div className="reports-container p-4 flex-1">
      <div className="table-container bg-white border border-[#EAEAFF] shadow-sm rounded-md p-4 max-w-[77vw]">
        <div className="w-full max-h-[54vh] overflow-auto scrollbar-color">
          <table className="text-sm min-w-full table-auto">
            <thead className="text-[12px]">
              <tr className="border-b-[1px] border-[#F3E6F2]">
                <th className="p-2 text-center font-medium">S.No.</th>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="p-2 font-medium text-left whitespace-nowrap"
                    style={{ minWidth: '120px' }}
                  >
                    {column}
                  </th>
                ))}
                <th className="p-2 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="p-2 text-center text-[12px] font-medium text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="p-2 text-center text-[12px] font-medium text-gray-500"
                  >
                    No Data available
                  </td>
                </tr>
              ) : (
                currentRows.map((order, index) => (
                  <tr key={order.order_id} className="border-b-[1px] border-[#F3E6F2]">
                    <td className="p-2 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.order_id || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.username || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.store_name || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.order_status || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {order.user_mobile_no || '-'}
                    </td>
                    {reportType === 'subscribe' && (
                      <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                        {order.timeslots || '-'}
                      </td>
                    )}
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        <Download
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                          onClick={() => handleSingleDownload(order)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="pagination-container flex items-center justify-between mt-4 flex-wrap gap-4 w-full">
            <div className="showing-container text-[#71717A] font-medium text-[12px]">
              Showing <span className="text-black">{startItem}-{endItem}</span> of{' '}
              <span className="text-black">{totalItems}</span> items
            </div>
            <div className="flex items-center font-medium text-[12px] gap-4">
              <button
                className={`bg-[#F3E6F2] p-2 rounded flex items-center gap-2 ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                <LeftArrow className="w-5 h-5 text-gray-600" />
                Previous
              </button>
              <div className="text-[#393185]">
                Page {String(currentPage).padStart(2, '0')} of {String(totalPages).padStart(2, '0')}
              </div>
              <button
                className={`bg-[#393185] text-white p-2 rounded flex items-center gap-2 ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
                <RightArrow className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReportsTableByStore;