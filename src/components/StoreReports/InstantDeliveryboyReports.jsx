import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useDebounce } from 'use-debounce';
import Header from '../../common/Header';
import { useNavigate } from 'react-router-dom';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { ReactComponent as Download } from '../../assets/images/Download.svg';
import { ReactComponent as LeftArrow } from '../../assets/images/Left Arrow.svg';
import { ReactComponent as RightArrow } from '../../assets/images/Right Arrow.svg';
import { NotificationManager } from 'react-notifications';

const CombinedDeliveryboyReports = () => {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [expandedRider, setExpandedRider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const totalItems = filteredRiders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    fetchRiderReports();
  }, []);

  useEffect(() => {
    // Client-side search filtering
    if (!searchTerm) {
      setFilteredRiders(riders);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = riders.filter((rider) => {
        const matchesRider =
          rider.title?.toLowerCase().includes(lowerSearch) ||
          rider.email?.toLowerCase().includes(lowerSearch) ||
          rider.mobile?.toLowerCase().includes(lowerSearch);

        const matchesOrder = rider.orders.some(
          (order) =>
            order.order_id?.toLowerCase().includes(lowerSearch) ||
            order.status?.toLowerCase().includes(lowerSearch) ||
            order.address?.address?.toLowerCase().includes(lowerSearch) ||
            order.address?.landmark?.toLowerCase().includes(lowerSearch) ||
            order.products.some((product) =>
              product.title?.toLowerCase().includes(lowerSearch)
            ) ||
            order.products.some((product) => product.price === parseFloat(searchTerm))
        );

        return matchesRider || matchesOrder;
      });
      setFilteredRiders(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
    setSelectedItems([]); // Reset selection on search
  }, [debouncedSearch, riders]);

  const fetchRiderReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/rider-reports/rider-reports/combined');
      setRiders(response.data.riders || []);
      setFilteredRiders(response.data.riders || []);
    } catch (error) {
      console.error('Error fetching combined rider reports:', error);
      NotificationManager.removeAll()
      NotificationManager.error('Failed to fetch rider reports.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDownloadAll = async () => {
    try {
      const response = await api.get('/rider-reports/rider-reports/combined/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'combined_rider_reports.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      NotificationManager.removeAll()
      NotificationManager.success('Download successful!');
    } catch (error) {
      console.error('Error downloading all rider reports:', error);
      NotificationManager.removeAll()
      NotificationManager.error('Failed to download all rider reports.');
    }
  };

  const handleDownloadSingleRider = async (rider) => {
    try {
      const response = await api.get(`/rider-reports/rider-reports/${rider.id}/download`, {
        responseType: 'blob',
      });

      const ridername = rider.title
        ? rider.title.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/_+/g, '_').trim()
        : 'unknown_rider';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rider_report_${ridername}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      NotificationManager.removeAll()
      NotificationManager.success('Download successful!');
    } catch (error) {
      console.error('Error downloading single rider report:', error);
      NotificationManager.removeAll()
      NotificationManager.error('Failed to download rider report.');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) {
      NotificationManager.removeAll()
      NotificationManager.error('No riders selected for download!');
      return;
    }

    try {
      const response = await api.post(
        '/rider-reports/rider-reports/selected/download',
        { riderIds: selectedItems },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'selected_rider_reports.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      NotificationManager.removeAll()
      NotificationManager.success('Download successful!');
    } catch (error) {
      console.error('Error downloading selected rider reports:', error);
      NotificationManager.removeAll()
      NotificationManager.error('Failed to download selected rider reports.');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allItems = currentRows.map((rider) => rider.id);
      setSelectedItems((prev) => [...new Set([...prev, ...allItems])]);
    } else {
      const remainingItems = selectedItems.filter(
        (id) => !currentRows.some((rider) => rider.id === id)
      );
      setSelectedItems(remainingItems);
    }
  };

  const handleSelectItem = (event, riderId) => {
    if (event.target.checked) {
      setSelectedItems((prev) => [...prev, riderId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== riderId));
    }
  };

  const toggleRider = (riderId) => {
    setExpandedRider(expandedRider === riderId ? null : riderId);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);
  const currentRows = filteredRiders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-center p-4 space-y-4 md:space-y-0 ml-6">
        <h3
          className="flex items-center text-lg font-medium cursor-pointer"
          onClick={handleBackClick}
        >
          <NavigateBeforeIcon className="mr-1 text-[#393849]" />
          <span className="text-[#393939]">Deliveryboy Reports</span>
        </h3>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto mr-6">
          <div className="relative w-full sm:w-[250px]">
            <input
              type="text"
              placeholder="Search riders, orders, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md w-full text-[12px]"
            />
          </div>
          <button
            onClick={handleDownloadAll}
            className="bg-[#393185] text-white px-4 py-2 rounded-md flex items-center"
          >
            Download All
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="bg-[#393185] text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Selected
            </button>
          )}
        </div>
      </div>

      <div className="relative p-4 flex-1 mx-6">
        <div className="table-container bg-white border border-[#EAEAEA] shadow-sm rounded p-4 max-w-[77vw]">
          <div className="w-full max-h-[55vh] overflow-auto scrollbar-color">
            <table className="text-sm min-w-full table-auto">
              <thead className="text-[12px]">
                <tr className="border-b-[1px] border-[#F3E6F2]">
                  <th className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      onChange={handleSelectAll}
                      checked={currentRows.length > 0 && currentRows.every((rider) => selectedItems.includes(rider.id))}
                      aria-label="Select All"
                    />
                  </th>
                  <th className="p-2 text-center font-medium">S.No.</th>
                  <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                    Rider Name
                  </th>
                  <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                    Total Orders
                  </th>
                  <th className="p-2 font-medium text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-[12px] font-medium text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-[12px] font-medium text-gray-500">
                      No Data available
                    </td>
                  </tr>
                ) : (
                  currentRows.map((rider, index) => (
                    <React.Fragment key={rider.id}>
                      <tr
                        className="border-b-[1px] border-[#F3E6F2] hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRider(rider.id)}
                      >
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            onChange={(e) => handleSelectItem(e, rider.id)}
                            checked={selectedItems.includes(rider.id)}
                            aria-label={`Select Rider ${index + 1}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                          {rider.title || '-'}
                        </td>
                        <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                          {rider.orders?.length || 0}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center">
                            {rider.orders?.length > 0 && (
                              <Download
                                className="w-5 h-5 text-blue-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSingleRider(rider);
                                }}
                              />
                            )}
                            </div>
                          </td>
                        </tr>
                        {expandedRider === rider.id && (
                          <tr>
                            <td colSpan="5" className="p-4 bg-gray-100">
                              <div className="w-full max-h-[40vh] overflow-auto scrollbar-color">
                                {rider.orders?.length > 0 ? (
                                  rider.orders.map((order) => (
                                    <div key={order.id} className="border rounded-md p-4 bg-white mb-4">
                                      <h3 className="text-[14px] font-semibold text-gray-800 mb-2">
                                        Order ID: {order.order_id || 'N/A'} (Status: {order.status || 'N/A'})
                                      </h3>
                                      <table className="text-sm min-w-full table-auto">
                                        <thead className="text-[12px] border-b-[1px] border-[#F3E6F2]">
                                          <tr>
                                            <th className="p-2 font-medium text-left">Order Type</th>
                                            <th className="p-2 font-medium text-left">Date</th>
                                            <th className="p-2 font-medium text-left">Product Title</th>
                                            <th className="p-2 font-medium text-left">Image</th>
                                            <th className="p-2 font-medium text-left">Quantity</th>
                                            <th className="p-2 font-medium text-left">Price</th>
                                            <th className="p-2 font-medium text-left">Address</th>
                                            <th className="p-2 font-medium text-left">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.products?.length > 0 ? (
                                            order.products.map((product) => (
                                              <tr key={product.id} className="p-2 text-left text-[12px] font-medium text-gray-500">
                                                <td className="p-2">{order.orderType || '-'}</td>
                                                <td className="p-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                                                <td className="p-2">{product.title || '-'}</td>
                                                <td className="p-2">
                                                  {product.img ? (
                                                    <img
                                                      src={product.img}
                                                      alt={product.title}
                                                      className="h-8 w-8 object-cover rounded"
                                                    />
                                                  ) : '-'}
                                                </td>
                                                <td className="p-2">{product.quantity || 0}</td>
                                                <td className="p-2">${product.price || 0}</td>
                                                <td className="p-2">
                                                  {order.address
                                                    ? `${order.address.address || ''}${order.address.landmark ? ', ' + order.address.landmark : ''}`
                                                    : '-'}
                                                </td>
                                                <td className="p-2">{order.status || '-'}</td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="8" className="p-2 text-center text-[12px] font-medium text-gray-500">
                                                No products in this order
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-[12px] font-medium text-gray-500">
                                    No orders available for this rider
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalItems > 0 && (
              <div className="pagination-container flex items-center justify-between mt-4 flex-wrap gap-4 w-full">
                <div className="showing-container text-[#717171] font-medium text-[12px]">
                  Showing <span className="text-black">{startItem}-{endItem}</span> of{' '}
                  <span className="text-black">{totalItems}</span> items
                </div>
                <div className="flex items-center font-medium text-[12px] gap-4">
                  <button
                    className={`bg-[#F3E6F2] p-2 rounded flex items-center gap-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className={`bg-[#393185] text-white p-2 rounded flex items-center gap-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </div>
      );
      
    };

    export default CombinedDeliveryboyReports;