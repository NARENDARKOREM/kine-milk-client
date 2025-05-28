import React, { useState, useEffect } from 'react';
import { NotificationManager } from 'react-notifications';
import api from '../../utils/api';
import { useDebounce } from 'use-debounce';
import Header from '../../common/Header';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { AiOutlineDown } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { ReactComponent as Download } from '../../assets/images/Download.svg';
import { ReactComponent as LeftArrow } from '../../assets/images/Left Arrow.svg';
import { ReactComponent as RightArrow } from '../../assets/images/Right Arrow.svg';

const SingleStoreStockReport = () => {
  const [store, setStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryPages, setCategoryPages] = useState({});
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const getStoreIdFromToken = () => {
    const store_id = Cookies.get('store_id');
    console.log('Store ID from cookie:', store_id);
    return store_id;
  };

  useEffect(() => {
    const store_id = getStoreIdFromToken();
    if (store_id) {
      fetchStockReport(store_id);
    } else {
      NotificationManager.error('No store ID found in cookie', 'Error');
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  const fetchStockReport = async (store_id) => {
    setIsLoading(true);
    try {
      const response = await api.get('api/stock-reports/by-store', {
        params: { store_id, search: debouncedSearch },
      });
      console.log('Stock report response:', response.data);
      setStore(response.data.store || null);
      if (response.data.store?.categories) {
        const initialPages = {};
        response.data.store.categories.forEach(category => {
          initialPages[category.id] = 1;
        });
        setCategoryPages(initialPages);
      }
    } catch (error) {
      console.error('Error fetching stock report:', error);
      NotificationManager.error(
        error.response?.data?.message || 'Error fetching stock report',
        'Error'
      );
      setStore(null);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = (data, filename, includeCategory = false) => {
    if (!data.length) {
      NotificationManager.error('No data selected for download!', 'Error');
      return;
    }

    const headers = [
      ...(includeCategory ? ['Category'] : []),
      'Product',
      'Weight',
      'Normal Quantity',
      'Subscription Quantity',
      'Total Stock',
      'Last Updated',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map(item =>
          [
            ...(includeCategory ? [item.category || 'N/A'] : []),
            item.productTitle || 'N/A',
            item.weight || 'N/A',
            item.quantity || 0,
            item.subscription_quantity || 'N/A',
            (item.quantity || 0) + (item.subscription_quantity || 0),
            item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A',
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
    NotificationManager.success('Download successful!', 'Success');
  };

  const handleDownloadAll = () => {
    const store_id = getStoreIdFromToken();
    if (!store_id || !store) {
      NotificationManager.error('No store data available', 'Error');
      return;
    }

    const allProducts = [];
    (filteredCategories.length > 0 ? filteredCategories : store.categories || []).forEach(category => {
      category.products.forEach(product => {
        product.weightDetails.forEach(weight => {
          allProducts.push({
            category: category.title,
            productTitle: product.title,
            weight: weight.weight,
            quantity: weight.quantity,
            subscription_quantity:
              product.subscription_required === 1 ? weight.subscription_quantity : 'N/A',
            lastUpdated: product.lastUpdated,
          });
        });
      });
    });

    downloadCSV(allProducts, `stock_report_${store_id}.csv`, true);
  };

  const handleSingleDownload = (category, product, weight) => {
    downloadCSV(
      [
        {
          productTitle: product.title,
          weight: weight.weight,
          quantity: weight.quantity,
          subscription_quantity:
            product.subscription_required === 1 ? weight.subscription_quantity : 'N/A',
          lastUpdated: product.lastUpdated,
        },
      ],
      `stock_${product.id}_${weight.weight}.csv`
    );
  };

  const handleCategoryChange = selectedOption => {
    setSelectedCategory(selectedOption);
    setCategoryPages(prev => {
      const newPages = { ...prev };
      (store?.categories || []).forEach(category => {
        newPages[category.id] = 1;
      });
      return newPages;
    });
  };

  const handlePageChange = (categoryId, page) => {
    setCategoryPages(prev => ({ ...prev, [categoryId]: page }));
  };

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: `${isFocused ? '2px solid #393185' : '1px solid #B0B0B0'}`,
      boxShadow: isFocused ? 'none' : 'none',
      borderRadius: '5px',
      padding: '0px',
      fontSize: '12px',
      height: '42px',
      width: '200px',
      transition: 'border-color 0.2s ease-in-out',
      '&:hover': { border: '2px solid #393185' },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? '#393185' : isSelected ? '#393185' : 'white',
      color: isFocused || isSelected ? 'white' : '#757575',
      fontSize: '12px',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '12px',
      fontWeight: '600',
      color: '#393185',
    }),
    placeholder: (base) => ({ ...base, color: '#393185', fontSize: '12px' }),
  };

  const categoryOptions = [
    { value: null, label: 'All Categories' },
    ...(store?.categories?.map(category => ({
      value: category.id,
      label: category.title,
    })) || []),
  ];

  const filteredCategories =
    store?.categories?.length > 0
      ? selectedCategory?.value
        ? store.categories.filter(category => category.id === selectedCategory.value)
        : store.categories
      : [];

  if (isLoading) {
    return (
      <div className="bg-[#f7fbff] h-screen flex items-center justify-center">
        <Header />
        <div className="p-4 text-center text-[12px] font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="bg-[#f7fbff] h-screen">
        <Header />
        <div className="container mx-auto p-4">
          <h3
            className="flex items-center text-lg font-medium cursor-pointer mb-4"
            onClick={() => navigate(-1)}
          >
            <NavigateBeforeIcon className="mr-1" />
            Stock Report
          </h3>
          <p className="text-[12px] font-medium text-gray-500">No stock data available for this store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7fbff] min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-center p-4 space-y-4 md:space-y-0 ml-6 mr-6">
        <h3
          className="flex items-center text-lg font-medium cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <NavigateBeforeIcon className="mr-1 text-[#393185]" />
          <span className='text-[#393185]'>Stock Report - {store.title}</span>
        </h3>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {categoryOptions.length > 1 && (
            <Select
              value={categoryOptions.find(option => option.value === selectedCategory?.value)}
              onChange={handleCategoryChange}
              options={categoryOptions}
              styles={customStyles}
              placeholder="Select Category"
              isSearchable={false}
              components={{
                DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                IndicatorSeparator: () => null,
              }}
            />
          )}
          <div className="relative w-full sm:w-[250px]">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md w-full text-[12px]"
            />
          </div>
          <button
            onClick={handleDownloadAll}
            className="bg-[#393185] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            Download All
          </button>
        </div>
      </div>

      <div className="reports-container p-4 flex-1 mx-auto max-w-[77vw]">
        <div className="relative overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Instant Stock Summary */}
          <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Instant Stock Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600 text-[12px]">Total Instant Stock</p>
                <p className="text-2xl font-bold">{store.totalNormalStock || 0}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600 text-[12px]">Total Subscription Stock</p>
                <p className="text-2xl font-bold">{store.totalSubscribeStock || 0}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600 text-[12px]">Total Stock</p>
                <p className="text-2xl font-bold">{store.totalStock || 0}</p>
              </div>
            </div>
          </div>

          {/* Category and Product Tables */}
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => {
              const totalItems = category.products.length;
              const currentPage = categoryPages[category.id] || 1;
              const totalPages = Math.ceil(totalItems / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
              const currentProducts = category.products.slice(startIndex, endIndex);
              const startItem = startIndex + 1;
              const endItem = Math.min(currentPage * itemsPerPage, totalItems);

              return (
                <div key={category.id} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                  {currentProducts.length > 0 ? (
                    <div className="table-container bg-white border border-[#EAEAFF] shadow-sm rounded-md p-4">
                      <table className="text-sm min-w-full table-auto">
                        <thead className="text-[12px]">
                          <tr className="border-b-[1px] border-[#F3E6F2]">
                            <th className="p-2 text-center font-medium">S.No.</th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Product
                            </th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Weight
                            </th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Instant Quantity
                            </th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Subscription Quantity
                            </th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Total Stock
                            </th>
                            <th className="p-2 font-medium text-left whitespace-nowrap" style={{ minWidth: '120px' }}>
                              Last Updated
                            </th>
                            <th className="p-2 font-medium text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProducts.map((product, productIndex) => {
                            const rowSpan = product.weightDetails.length;
                            return product.weightDetails.map((weight, weightIndex) => (
                              <tr
                                key={`${product.id}-${weight.weight}`}
                                className="border-b-[1px] border-[#F3E6F2]"
                              >
                                {weightIndex === 0 ? (
                                  <td
                                    className="p-2 text-center text-[12px] font-medium text-gray-500"
                                    rowSpan={rowSpan}
                                  >
                                    {startIndex + productIndex + 1}
                                  </td>
                                ) : null}
                                {weightIndex === 0 ? (
                                  <td
                                    className="p-2 text-left text-[12px] font-medium text-gray-500"
                                    style={{ minWidth: '120px' }}
                                    rowSpan={rowSpan}
                                  >
                                    {product.title}
                                  </td>
                                ) : null}
                                <td
                                  className="p-2 text-left text-[12px] font-medium text-gray-500"
                                  style={{ minWidth: '120px' }}
                                >
                                  {weight.weight || '-'}
                                </td>
                                <td
                                  className="p-2 text-left text-[12px] font-medium text-gray-500"
                                  style={{ minWidth: '120px' }}
                                >
                                  {weight.quantity || 0}
                                </td>
                                <td
                                  className="p-2 text-left text-[12px] font-medium text-gray-500"
                                  style={{ minWidth: '120px' }}
                                >
                                  {product.subscription_required === 1 ? weight.subscription_quantity || 0 : 'N/A'}
                                </td>
                                <td
                                  className="p-2 text-left text-[12px] font-medium text-gray-500"
                                  style={{ minWidth: '120px' }}
                                >
                                  {(weight.quantity || 0) +
                                    (product.subscription_required === 1 ? weight.subscription_quantity || 0 : 0)}
                                </td>
                                {weightIndex === 0 ? (
                                  <td
                                    className="p-2 text-left text-[12px] font-medium text-gray-500"
                                    style={{ minWidth: '120px' }}
                                    rowSpan={rowSpan}
                                  >
                                    {product.lastUpdated
                                      ? new Date(product.lastUpdated).toLocaleDateString()
                                      : '-'}
                                  </td>
                                ) : null}
                                <td className="p-2 text-center">
                                  <div className="flex justify-center">
                                    <Download
                                      className="w-5 h-5 text-blue-600 cursor-pointer"
                                      onClick={() => handleSingleDownload(category, product, weight)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>

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
                              onClick={() => handlePageChange(category.id, currentPage - 1)}
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
                              onClick={() => handlePageChange(category.id, currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <RightArrow className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12px] font-medium text-gray-500">No products available in this category.</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-[12px] font-medium text-gray-500">No categories or products available for this store.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleStoreStockReport;
