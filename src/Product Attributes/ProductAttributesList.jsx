import React, { useEffect, useState } from 'react'
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import Header from '../common/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../common/Loader';
import { handleSort } from '../utils/sorting';
import { StatusEntity } from '../utils/StatusEntity';
import { DeleteEntity } from '../utils/DeleteEntity';
import { FaPen, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import InnerHeader from './ProductAttributesHeader';

const ProductAttributesList = () => {
  const navigate = useNavigate();
  const [product, setproduct] = useState([]);
  const [filteredproduct, setFilteredproduct] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();
  // const { isLoading, setIsLoading } = useload();

  useEffect(() => {
    async function fetchproduct() {
      try {
        const response = await api.get("/product-attribute/all");
        console.log("Fetched product:", response.data);
        setproduct(response.data);
        setFilteredproduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }
    fetchproduct();
  }, []);

  useEffect(() => {
    // setIsLoading(true);

    const timer = setTimeout(() => {
      // setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  // }, [location, setIsLoading]);
  }, [location]);

  // Handle search
  // Search functionality
  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = product.filter(item =>
      Object.values(item).some(value =>
        typeof value === 'object' && value !== null
          ? Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(querySearch)
          )
          : String(value).toLowerCase().includes(querySearch)
      )
    );
    setFilteredproduct(filteredData);
    setCurrentPage(1);
  };

  // Handle sorting
  const sortData = (key) => {
    handleSort(filteredproduct, key, sortConfig, setSortConfig, setFilteredproduct);
  };

  const indexOfLastproductAttribute = currentPage * itemsPerPage;
  const indexOfFirstproductAttribute = indexOfLastproductAttribute - itemsPerPage;
  const currentproduct = filteredproduct.slice(indexOfFirstproductAttribute, indexOfLastproductAttribute);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredproduct.length / itemsPerPage);

  const handledelete = async (id) => {
    const success = await DeleteEntity('productAttribute', id);
    if (success) {
      const updatedproduct = product.filter((productAttribute) => productAttribute.id !== id);
      setproduct(updatedproduct);
      setFilteredproduct(updatedproduct);
    }
  };

  // for update 
  const updateproductAttribute = (id) => {
    navigate('/add-product-attribute', { state: { id: id } })
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("productAttribute", id, currentStatus, setFilteredproduct, filteredproduct, field);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div>
        <div>
      {/* {isLoading && <Loader />} */}
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="flex flex-1 flex-col bg-[#f7fbff]">
          {/* Header */}
          <Header />
          {/* Searching, sorting, and main content area */}
          <InnerHeader onSearch={handleSearch} name={"Product Attribute List"} />
          {/* Card */}
          <div className="py-6 px-6 h-full w-[1000px] overflow-scroll scrollbar-none">
            <div className="bg-white  w-full rounded-xl border border-[#EAE5FF] py-4 px-3 overflow-x-auto scrollbar-none">
              <div className="relative sm:rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="table-head text-xs uppercase font-medium text-white">
                    <tr>
                      <th className="px-4 py-3 min-w-[120px]">
                        Sr. No
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('id')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('id')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[180px]">
                        Product Title
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('title')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('title')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[180px]">
                        Product Type
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[180px]">
                        Product Price
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                        </div>
                      </th>

                      <th className="px-4 py-3 min-w-[180px]">
                        Product SPrice
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                        </div>
                      </th>

                      <th className="px-4 py-3 min-w-[200px]">
                        Product Discount
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[220px]">
                        Subscription Required?
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                        </div>
                      </th>

                      <th className="px-4 py-3 min-w-[150px]">
                        Stock Status
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[100px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentproduct.length > 0 ? (
                      currentproduct.map((productAttribute, index) => (
                        <tr key={productAttribute.id} className="h-[70px]"> {/* Adjust the height */}
                          <td className="px-4 py-1">{index + 1 + indexOfFirstproductAttribute}</td> {/* Reduce padding */}
                          <td className="px-4 py-1">{productAttribute?.title || "N/A"}</td>
                          <td className="px-4 py-1">{productAttribute?.title || "N/A"}</td>
                          <td className="px-4 py-1">{productAttribute?.normal_price || "N/A"}</td>
                          <td className="px-4 py-1">{productAttribute?.subscribe_price || "N/A"}</td>
                          <td className="px-4 py-1">{productAttribute?.discount || "N/A"}</td>
                          {/* <td className="px-4 py-1">{productAttribute?.title || "N/A"}</td> */}
                          <td>
                            <FontAwesomeIcon
                              className="h-7 w-16 cursor-pointer"
                              style={{ color: productAttribute.subscription_required === 1 ? "#0064DC" : "#e9ecef" }}
                              icon={productAttribute.subscription_required === 1 ? faToggleOn : faToggleOff}
                              onClick={() => handleToggleChange(productAttribute.id, productAttribute.status, "status")} // Pass 'status' field
                            />
                          </td>
                          <td>
                            <FontAwesomeIcon
                              className="h-7 w-16 cursor-pointer"
                              style={{ color: productAttribute.out_of_stock  > 1 ? "#0064DC" : "#e9ecef" }}
                              icon={productAttribute.subscription_required  > 1 ? 'In Stock' : 'Out Of Stock'}
                            />
                          </td>
                          <td className="px-4 py-1">
                            <NotificationContainer />
                            <button
                              className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition mr-2"
                              onClick={() => {
                                updateproductAttribute(productAttribute.id);
                              }}
                            >
                              <FaPen />
                            </button>
                            <button
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                              onClick={() => {
                                handledelete(productAttribute.id);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-2 text-white">
                          No product Attributes found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
            <div className="bottom-0 left-0 w-full bg-[#f7fbff] py-4 flex justify-between items-center">
              <span className="text-sm font-normal text-gray-900">
                Showing <span className="font-semibold text-gray-900">{indexOfFirstproductAttribute + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastproductAttribute, filteredproduct.length)}</span> of <span className="font-semibold text-gray-900">{filteredproduct.length}</span>
              </span>
              <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 gap-3 gap-3">
                <li>
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    className={`previous-button ${filteredproduct.length === 0 ? 'cursor-not-allowed' : ''}`}
                    disabled={currentPage === 1 || filteredproduct.length === 0}
                    title={filteredproduct.length === 0 ? 'No data available' : ''}
                  >
                    <img src="/image/action/Left Arrow.svg" alt="Left" /> Previous
                  </button>
                </li>
                <li>
                  <span className="current-page">
                    Page {filteredproduct.length > 0 ? currentPage : 0} of {filteredproduct.length > 0 ? totalPages : 0}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    className={`next-button ${filteredproduct.length === 0 ? 'cursor-not-allowed button-disable' : ''}`}
                    disabled={currentPage === totalPages || filteredproduct.length === 0}
                    title={filteredproduct.length === 0 ? 'No data available' : ''}
                  >
                    Next <img src="/image/action/Right Arrow (1).svg" alt="Right" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ProductAttributesList