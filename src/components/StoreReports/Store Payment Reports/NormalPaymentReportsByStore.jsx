import React, { useState } from 'react';
import Header from '../../../common/Header';
import ReportsTitle from '../../../Reports/ReportsTitle';
import PaymentReportsTableByStore from './PaymentReportsTableByStore';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import api from '../../../utils/api';
import Cookies from 'js-cookie';

const NormalPaymentReportsByStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const reportType = 'normal';

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);

  const handleDownloadAll = async () => {
    try {
      const store_id = Cookies.get('store_id');
      if (!store_id) {
        throw new Error('Store ID not found in cookies');
      }
      const response = await api.get('/payments/normal-payments-by-store/download', {
        params: { store_id, fromDate, toDate },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'normal_payments_by_store.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.removeAll()
      NotificationManager.success('Download successful!');
    } catch (error) {
      console.error('Error downloading all normal payments:', error);
      NotificationManager.removeAll()
      NotificationManager.error('Failed to download normal payments.');
    }
  };

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <ReportsTitle
        title="Instant Payment Reports"
        searchPlaceholder="Search payments..."
        onSearch={handleSearch}
        onDownloadClick={handleDownloadAll}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
      />
      <PaymentReportsTableByStore
        reportType={reportType}
        searchTerm={searchTerm}
        fromDate={fromDate}
        toDate={toDate}
      />
      <NotificationContainer />
    </div>
  );
};

export default NormalPaymentReportsByStore;