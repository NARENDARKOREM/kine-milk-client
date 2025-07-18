import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from '../../common/Header';
import InnerHeader from '../../components/Coupon/CouponHeader';
import ProductInventoryTable from '../../Store/ProductInventory/ProductInventoryTable';
import api from '../../utils/api';
import { StatusEntity } from '../../utils/StatusEntity';
import { handleSort } from '../../utils/sorting';
import { DeleteEntity } from '../../utils/DeleteEntity';
import { ReactComponent as Edit } from '../../assets/images/Edit.svg';
import { ReactComponent as Delete } from '../../assets/images/Delete.svg';

const ListUnitOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
  fetchUnits();
}, []); // ✅ only run once when component mounts


  const fetchUnits = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const response = await api.get('/units/all');
      console.log('Fetched units:', response.data.units);
      const unitData = response.data.units || [];
      setUnits(unitData);
      setFilteredUnits(unitData);
      setTotalPages(Math.ceil(unitData.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching units:', error);
      NotificationManager.error('Failed to fetch units', 'Error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 2000);
    }
  };

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = units.filter((item) =>
      (item.name?.toLowerCase().includes(querySearch) ||
       item.unit?.toLowerCase().includes(querySearch))
    );
    setFilteredUnits(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const sortData = (key) => {
    handleSort(filteredUnits, key, sortConfig, setSortConfig, setFilteredUnits);
  };

 const handleDelete = async (id) => {
  try {
    const result = await DeleteEntity('Unit', id);

    if (result === true) {
      const updatedUnits = units.filter((u) => u.id !== id);
      const updatedFiltered = filteredUnits.filter((u) => u.id !== id);

      setUnits(updatedUnits);
      setFilteredUnits(updatedFiltered);

      const newTotalPages = Math.ceil(updatedFiltered.length / itemsPerPage);
      setTotalPages(newTotalPages);

      if ((page > 1) && ((page - 1) * itemsPerPage >= updatedFiltered.length)) {
        setPage(page - 1);
      }

      // NotificationManager.success('Unit deleted successfully', 'Success');
    } else {
      console.log(`Deletion of Unit ${id} was cancelled or failed`);
    }
  } catch (error) {
    console.error('Deletion error:', error);
    NotificationManager.error('Failed to delete unit', 'Error');
  }
};



  const handleEdit = (id) => {
    const unit = units.find((u) => u.id === id);
    navigate('/admin/add-weight-volume', { state: { unit } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity('Unit', id, currentStatus, setFilteredUnits, filteredUnits, field);
      NotificationManager.removeAll();
      NotificationManager.success('Unit status updated successfully', 'Success');
    } catch (error) {
      console.error('Error toggling unit status:', error);
      NotificationManager.removeAll();
      NotificationManager.error('Failed to toggle unit status', 'Error');
    }
  };

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? '#0064DC' : '#e9ecef' }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, 'status')}
    />
  );

  const columns = ['S.No.', 'Weight/Volume', 'Unit', 'Status'];

  const fields = ['index', 'name', 'unit', 'status'];

  const tableData = filteredUnits
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((unit, index) => ({
      id: unit.id,
      index: (page - 1) * itemsPerPage + index + 1,
      name: unit.name || 'N/A',
      unit: unit.unit || 'N/A',
      status: renderStatus(unit.status, unit.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader name="Weight/Volume List" onSearch={handleSearch} />
        <ProductInventoryTable
        key={filteredUnits.length}
          columns={columns}
          data={tableData}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          fields={fields}
          showLoader={showLoader}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleToggleChange={handleToggleChange}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          totalItems={filteredUnits.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default ListUnitOptions;