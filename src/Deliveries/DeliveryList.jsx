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
import InnerHeader from './DeliveryHeader';

const DeliveryList = () => {

  const navigate = useNavigate();
  const [delivery, setdelivery] = useState([]);
  const [filtereddelivery, setFiltereddelivery] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();
  // const { isLoading, setIsLoading } = useload();

  useEffect(() => {
    async function fetchdelivery() {
      try {
        const response = await api.get("/delivery/all");
        console.log("Fetched delivery:", response.data);
        setdelivery(response.data);
        setFiltereddelivery(response.data);
      } catch (error) {
        console.error("Error fetching delivery:", error);
      }
    }
    fetchdelivery();
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
    const filteredData = delivery.filter(item =>
      Object.values(item).some(value =>
        typeof value === 'object' && value !== null
          ? Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(querySearch)
          )
          : String(value).toLowerCase().includes(querySearch)
      )
    );
    setFiltereddelivery(filteredData);
    setCurrentPage(1);
  };

  // Handle sorting
  const sortData = (key) => {
    handleSort(filtereddelivery, key, sortConfig, setSortConfig, setFiltereddelivery);
  };

  const indexOfLastdelivery = currentPage * itemsPerPage;
  const indexOfFirstdelivery = indexOfLastdelivery - itemsPerPage;
  const currentdelivery = filtereddelivery.slice(indexOfFirstdelivery, indexOfLastdelivery);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filtereddelivery.length / itemsPerPage);

  const handledelete = async (id) => {
    const success = await DeleteEntity('Delivery', id);
    if (success) {
      const updateddelivery = delivery.filter((delivery) => delivery.id !== id);
      setdelivery(updateddelivery);
      setFiltereddelivery(updateddelivery);
    }
  };

  // for update 
  const updatedelivery = (id) => {
    navigate('/add-delivery', { state: { id: id } })
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Delivery", id, currentStatus, setFiltereddelivery, filtereddelivery, field);
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
          <InnerHeader onSearch={handleSearch} name={"Delivery List"} />
          {/* Card */}
          <div className="py-6 px-6 h-full w-[1000px] overflow-scroll scrollbar-none">
            <div className="bg-white  w-full rounded-xl border border-[#EAE5FF] py-4 px-3 overflow-x-auto scrollbar-none">
              <div className="relative sm:rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="table-head text-xs uppercase font-medium text-white">
                    <tr>
                      <th className="px-4 py-3 min-w-[103px]">
                        Sr. No
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('id')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('id')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[50px]">
                        Deliveries Title
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('title')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('title')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[50px]">
                      Deliveries Digit
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('img')} />
                        </div>
                      </th>

                      <th className="px-4 py-3 min-w-[50px]">
                      Deliveries Status
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                          <GoArrowDown className=" hover:text-gray-700 cursor-pointer" onClick={() => sortData('status')} />
                        </div>
                      </th>
                      <th className="px-4 py-3 min-w-[50px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentdelivery.length > 0 ? (
                      currentdelivery.map((delivery, index) => (
                        <tr key={delivery.id} className="h-[70px]"> {/* Adjust the height */}
                          <td className="px-4 py-1">{index + 1 + indexOfFirstdelivery}</td> {/* Reduce padding */}
                          <td className="px-4 py-1">{delivery?.title || "N/A"}</td>
                          <td className="px-4 py-1">
                            {delivery.img && delivery.img.trim() !== '' ? (
                              <img   src={delivery.img}  className="w-10 h-10 object-cover rounded-full" height={50} width={50} loading="lazy"  alt=""
                                onError={(e) => {
                                  if (  e.target.src !==  'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg'  ) {
                                    e.target.src = 'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg';
                                  }
                                }}
                              />
                            ) : (
                              <img  src="https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg" height={50}   width={50}   loading="lazy"   alt="" />
                            )}
                          </td>
                          <td>
                            <FontAwesomeIcon
                              className="h-7 w-16 cursor-pointer"
                              style={{ color: delivery.status === 1 ? "#393185" : "#e9ecef" }}
                              icon={delivery.status === 1 ? faToggleOn : faToggleOff}
                              onClick={() => handleToggleChange(delivery.id, delivery.status, "status")} 
                            />
                          </td>
                          <td className="px-4 py-1">
                            <NotificationContainer />
                            <button
                              className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition mr-2"
                              onClick={() => {
                                updatedelivery(delivery.id);
                              }}
                            >
                              <FaPen />
                            </button>
                            <button
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                              onClick={() => {
                                handledelete(delivery.id);
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
                          No delivery found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
            <div className="bottom-0 left-0 w-full bg-[#f7fbff] py-4 flex justify-between items-center">
              <span className="text-sm font-normal text-gray-500">
                Showing <span className="font-semibold text-gray-900">{indexOfFirstdelivery + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastdelivery, filtereddelivery.length)}</span> of <span className="font-semibold text-gray-900">{filtereddelivery.length}</span>
              </span>
              <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 gap-3">
                <li>
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    className={`previous-button ${filtereddelivery.length === 0 ? 'cursor-not-allowed' : ''}`}
                    disabled={currentPage === 1 || filtereddelivery.length === 0}
                    title={filtereddelivery.length === 0 ? 'No data available' : ''}
                  >
                    <img src="/image/action/Left Arrow.svg" alt="Left" /> Previous
                  </button>
                </li>
                <li>
                  <span className="current-page">
                    Page {filtereddelivery.length > 0 ? currentPage : 0} of {filtereddelivery.length > 0 ? totalPages : 0}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    className={`next-button ${filtereddelivery.length === 0 ? 'cursor-not-allowed button-disable' : ''}`}
                    disabled={currentPage === totalPages || filtereddelivery.length === 0}
                    title={filtereddelivery.length === 0 ? 'No data available' : ''}
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

export default DeliveryList