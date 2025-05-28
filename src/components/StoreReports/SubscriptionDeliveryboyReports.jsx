import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import MilkLoader from '../../utils/MilkLoader';
import { useDebounce } from 'use-debounce';
import Header from '../../common/Header';
import { useNavigate } from 'react-router-dom';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";


const SubscriptionDeliveryboyReports = () => {
  const [riders, setRiders] = useState([]);
  const [expandedRider, setExpandedRider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  useEffect(() => {
    fetchRiderReports();
  }, [debouncedSearch]);

  const fetchRiderReports = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const response = await api.get('/rider-reports/subscription', {
        params: { search: debouncedSearch },
      });
      setRiders(response.data.riders || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching subscription rider reports:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 2000);
    }
  };
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDownloadAll = async () => {
    try {
      const response = await api.get('/rider-reports/subscription/download', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all_riders_subscription_report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading all subscription rider reports:', error);
    }
  };

  const handleDownloadSingleRider = async (riderId) => {
    try {
      const response = await api.get(
        `/rider-reports/subscription/download/${riderId}`,
        {
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rider_subscription_report_${riderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading single rider subscription report:', error);
    }
  };

  const toggleRider = (riderId) => {
    setExpandedRider(expandedRider === riderId ? null : riderId);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRiders = riders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(riders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Header />
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
      <h3
  className="flex items-center text-lg font-medium cursor-pointer"
  onClick={handleBackClick}
>
  <NavigateBeforeIcon className="mr-1" />
  Subscribe Deliveryboy Reports
</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search riders, orders, products, prices, addresses, statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-80 focus:outline-none focus:ring-2 focus:ring-[#393185]"
          />
          <button
            onClick={handleDownloadAll}
            className="bg-[#393185] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a2566]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download All
          </button>
        </div>
      </div>

      <div className="mx-6">
        <div className="bg-white rounded-xl shadow-md max-h-[60vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-[#393185] text-white text-xs uppercase font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Rider Name</th>
                <th className="px-6 py-3">Total Orders</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {showLoader ? (
                <tr>
                  <td colSpan="3" className="text-center py-2">
                    <div className="flex justify-center items-center h-64 w-full">
                      <MilkLoader />
                    </div>
                  </td>
                </tr>
              ) : currentRiders.length > 0 ? (
                currentRiders.map((rider) => (
                  <React.Fragment key={rider.id}>
                    <tr
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRider(rider.id)}
                    >
                      <td className="px-6 py-4">{rider.title || 'N/A'}</td>
                      <td className="px-6 py-4">{rider.orders?.length || 0}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingleRider(rider.id);
                          }}
                          className="bg-[#393185] text-white p-2 rounded-full hover:bg-[#2a2566]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedRider === rider.id && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 bg-gray-100">
                          <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                            <div className="space-y-4">
                              {rider.orders?.length > 0 ? (
                                rider.orders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="border rounded-lg p-4 bg-white"
                                  >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                      Order ID: {order.order_id || 'N/A'} (Status:{' '}
                                      {order.status || 'N/A'})
                                    </h3>
                                    <table className="w-full text-sm text-gray-700">
                                      <thead className="bg-gray-200">
                                        <tr>
                                          <th className="px-4 py-2">Product Title</th>
                                          <th className="px-4 py-2">Image</th>
                                          <th className="px-4 py-2">Quantity</th>
                                          <th className="px-4 py-2">Price</th>
                                          <th className="px-4 py-2">Address</th>
                                          <th className="px-4 py-2">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.products?.length > 0 ? (
                                          order.products.map((product) => (
                                            <tr key={product.id} className="border-b">
                                              <td className="px-4 py-2">
                                                {product.title || 'N/A'}
                                              </td>
                                              <td className="px-4 py-2">
                                                {product.img ? (
                                                  <img
                                                    src={product.img}
                                                    alt={product.title}
                                                    className="h-10 w-10 object-cover rounded"
                                                  />
                                                ) : (
                                                  'N/A'
                                                )}
                                              </td>
                                              <td className="px-4 py-2">
                                                {product.quantity || 0}
                                              </td>
                                              <td className="px-4 py-2">
                                                ${product.price || 0}
                                              </td>
                                              <td className="px-4 py-2">
                                                {order.address
                                                  ? `${order.address.address || ''}${
                                                      order.address.landmark
                                                        ? ', ' + order.address.landmark
                                                        : ''
                                                    }`
                                                  : 'N/A'}
                                              </td>
                                              <td className="px-4 py-2">
                                                {order.status || 'N/A'}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan="6"
                                              className="text-center py-4 text-gray-500"
                                            >
                                              No products in this order
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  No orders available for this rider
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No riders or orders match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {riders.length > 0 && (
          <div className="bottom-0 left-0 w-full bg-[#f7fbff] py-4 flex justify-between items-center px-6">
            <span className="text-sm font-normal text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {indexOfFirstItem + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(indexOfLastItem, riders.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">{riders.length}</span>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 gap-3">
              <li>
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  className={`previous-button ${
                    riders.length === 0 ? 'cursor-not-allowed' : ''
                  }`}
                  disabled={currentPage === 1 || riders.length === 0}
                  title={riders.length === 0 ? 'No data available' : ''}
                >
                  <img src="/image/action/Left Arrow.svg" alt="Left" /> Previous
                </button>
              </li>
              <li>
                <span className="current-page">
                  Page {riders.length > 0 ? currentPage : 0} of{' '}
                  {riders.length > 0 ? totalPages : 0}
                </span>
              </li>
              <li>
                <button
                  onClick={() =>
                    paginate(
                      currentPage < totalPages ? currentPage + 1 : totalPages
                    )
                  }
                  className={`next-button ${
                    riders.length === 0 ? 'cursor-not-allowed button-disable' : ''
                  }`}
                  disabled={currentPage === totalPages || riders.length === 0}
                  title={riders.length === 0 ? 'No data available' : ''}
                >
                  Next <img src="/image/action/Right Arrow (1).svg" alt="Right" />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDeliveryboyReports;