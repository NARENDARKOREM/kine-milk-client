import React, { useState } from 'react';
import Header from '../../../common/Header';
import ReportsTitle from '../../../Reports/ReportsTitle';
import OrderReportsTableByStore from './OrderReportsTableByStore';
import api from '../../../utils/api';
import Cookies from 'js-cookie';

const SubscribeOrderReportsByStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const reportType = 'subscribe';

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);

  const handleDownloadAll = async () => {
    try {
      const store_id = Cookies.get('store_id');
      if (!store_id) {
        throw new Error('Store ID not found in cookies');
      }
      const response = await api.get('/orders/subscribe-orders-by-store/download', {
        params: { store_id, fromDate, toDate },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'subscribe_orders_by_store.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading all subscribe orders:', error);
    }
  };

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <ReportsTitle
        title="Subscribe Order Reports"
        searchPlaceholder="Search orders..."
        onSearch={handleSearch}
        onDownloadClick={handleDownloadAll}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
      />
      <OrderReportsTableByStore
        reportType={reportType}
        searchTerm={searchTerm}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
};

export default SubscribeOrderReportsByStore;