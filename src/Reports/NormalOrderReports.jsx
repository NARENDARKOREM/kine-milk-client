import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import ReportsTitle from './ReportsTitle';
import OrderReportsTable from './OrderReportsTable';
import api from '../utils/api';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const NormalOrderReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const reportType = 'normal';

  useEffect(() => {
    async function fetchStores() {
      setIsLoadingStores(true);
      try {
        const response = await api.get('/store/fetch');
        console.log('Fetched stores:', response.data.stores);
        setStores(response.data.stores || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
        NotificationManager.error('Failed to load stores');
      } finally {
        setIsLoadingStores(false);
      }
    }
    fetchStores();
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleFromDateChange = (e) => setFromDate(e.target.value);

  const handleToDateChange = (e) => {
    const selectedToDate = e.target.value;
    if (fromDate && selectedToDate < fromDate) {
      NotificationManager.error('To date cannot be before from date');
      return;
    }
    setToDate(selectedToDate);
  };

  const handleStoreChange = (selectedOption) => {
    const newStoreId = selectedOption.value;
    console.log('Selected storeId:', newStoreId, 'Label:', selectedOption.label);
    setStoreId(newStoreId);
  };

  const handleDownloadAll = async () => {
    try {
      const params = { fromDate, toDate, storeId: storeId || undefined };
      console.log('Download all params:', params);
      const response = await api.get(`/orders/${reportType}-orders/download`, {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_orders.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading all orders:', error);
      NotificationManager.error('Failed to download report');
    }
  };

  console.log('Passing to OrderReportsTable:', { searchTerm, fromDate, toDate, storeId });

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <ReportsTitle
        title="Instant Order Reports"
        searchPlaceholder="Search orders..."
        onSearch={handleSearch}
        onDownloadClick={handleDownloadAll}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        storeId={storeId}
        stores={stores}
        onStoreChange={handleStoreChange}
        isLoadingStores={isLoadingStores}
      />
      <OrderReportsTable
        reportType={reportType}
        searchTerm={searchTerm}
        fromDate={fromDate}
        toDate={toDate}
        storeId={storeId}
      />
      <NotificationContainer />
    </div>
  );
};

export default NormalOrderReports;