import React, { useState, useEffect,useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../../../utils/api';
import { NotificationManager } from 'react-notifications';
import Cookies from 'js-cookie';
import { ReactComponent as Download } from '../../../assets/images/Download.svg';
import { ReactComponent as LeftArrow } from '../../../assets/images/Left Arrow.svg';
import { ReactComponent as RightArrow } from '../../../assets/images/Right Arrow.svg';

const PaymentReportsTableByStore = ({ reportType = 'normal', searchTerm, fromDate, toDate }) => {
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const store_id = Cookies.get('store_id');
  const itemsPerPage = 10;

  useEffect(() => {
    if (store_id) {
      fetchPayments();
    } else {
      NotificationManager.removeAll()
      NotificationManager.error('Store ID not found in cookies');
    }
  }, [fromDate, toDate, currentPage, store_id]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const endpoint = reportType === 'normal' ? 'normal-payments-by-store' : 'subscribe-payments-by-store';
      const params = {
        store_id,
        fromDate,
        toDate,
        page: currentPage,
        limit: itemsPerPage,
      };
      if (reportType === 'normal') {
        params.search = debouncedSearch; // Keep search for normal payments
      }
      const response = await api.get(`/payments/${endpoint}`, { params });
      const { payments, total } = response.data;
      setPayments(payments || []);
      setTotalItems(total || 0);
    } catch (error) {
      console.error(`Error fetching ${reportType} payments:`, error.response || error);
      NotificationManager.removeAll()
      NotificationManager.error(`Failed to fetch ${reportType} payments.`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    if (reportType !== 'subscribe' || !debouncedSearch) {
      return payments;
    }
    const searchLower = debouncedSearch.toLowerCase();
    return payments.filter(payment =>
      [
        payment.order_id || '',
        new Date(payment.order_date).toLocaleDateString() || '',
        payment.end_date ? new Date(payment.end_date).toLocaleDateString() : '',
        payment.username || '',
        payment.store_name || '',
        String(payment.delivery_charge || 0),
        String(payment.coupon_amount || 0),
        String(payment.tax || 0),
        String(payment.subtotal || 0),
        String(payment.total_amount || 0),
        payment.transaction_id || '',
      ].some(field => field.toLowerCase().includes(searchLower))
    );
  }, [payments, debouncedSearch, reportType]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const downloadCSV = (data, filename) => {
    if (!data.length) {
      NotificationManager.removeAll()
      NotificationManager.error('No data selected for download!');
      return;
    }

    const headers = [
      'Order ID',
      'Order Date',
      ...(reportType === 'subscribe' ? ['End Date'] : []),
      'Username',
      'Store Name',
      'Delivery Charge',
      'Coupon Amount',
      'Tax',
      'Subtotal',
      'Total Amount',
      'Transaction ID',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map(payment =>
          [
            payment.order_id || 'N/A',
            new Date(payment.order_date).toLocaleDateString() || 'N/A',
            ...(reportType === 'subscribe'
              ? [payment.end_date ? new Date(payment.end_date).toLocaleDateString() : 'N/A']
              : []),
            payment.username || 'N/A',
            payment.store_name || 'N/A',
            payment.delivery_charge || 0,
            payment.coupon_amount || 0,
            payment.tax || 0,
            payment.subtotal || 0,
            payment.total_amount || 0,
            payment.transaction_id || 'N/A',
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    NotificationManager.removeAll()
    NotificationManager.success('Download successful!');
  };

  const handleSingleDownload = (payment) => {
    downloadCSV([payment], `${reportType}_payment_${payment.order_id}.csv`);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const columns = [
    'Order ID',
    'Order Date',
    ...(reportType === 'subscribe' ? ['End Date'] : []),
    'Username',
    'Store Name',
    'Delivery Charge',
    'Coupon Amount',
    'Tax',
    'Subtotal',
    'Total Amount',
    'Transaction ID',
  ];

  return (
    <div className="reports-container p-4 flex-1">
      <div className="table-container bg-white border border-[#EAEAFF] shadow-sm rounded-md p-4 max-w-[77vw]">
        <div className="w-full max-h-[55vh] overflow-auto scrollbar-color">
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
                    colSpan={columns.length + 1}
                    className="p-2 text-center text-[12px] font-medium text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="p-2 text-center text-[12px] font-medium text-gray-500"
                  >
                    No Data available
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <tr key={payment.order_id} className="border-b-[1px] border-[#F3E6F2]">
                    <td className="p-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.order_id || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {new Date(payment.order_date).toLocaleDateString() || '-'}
                    </td>
                    {reportType === 'subscribe' && (
                      <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                        {payment.end_date ? new Date(payment.end_date).toLocaleDateString() : '-'}
                      </td>
                    )}
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.username || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.store_name || '-'}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.delivery_charge || 0}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.coupon_amount || 0}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.tax || 0}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.subtotal || 0}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.total_amount || 0}
                    </td>
                    <td className="p-2 text-left text-[12px] font-medium text-gray-500" style={{ minWidth: '120px' }}>
                      {payment.transaction_id || '-'}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        <Download
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                          onClick={() => handleSingleDownload(payment)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
      </div>
    </div>
  );
};

export default PaymentReportsTableByStore;