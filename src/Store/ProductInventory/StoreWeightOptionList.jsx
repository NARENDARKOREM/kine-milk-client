import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import Pagetitle from "../../common/pagetitle";
import Cookies from "js-cookie";
import MilkLoader from "../../utils/MilkLoader";
import { ReactComponent as LeftArrow } from "../../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../../assets/images/Right Arrow.svg";
import api from "../../utils/api";

const StoreWeightOptionList = () => {
  const navigate = useNavigate();
  const { product_inventory_id } = useParams();
  const [weightOptions, setWeightOptions] = useState([]);
  const [filteredWeightOptions, setFilteredWeightOptions] = useState([]);
  const [productName, setProductName] = useState("Inventory List");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchWeightOptions() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const storeId = Cookies.get("store_id");
        if (!storeId) {
          throw new Error("Store ID is missing.");
        }

        // Fetch history from StoreWeightOptionHistory
        const response = await api.get("/storeweightoption/list", {
          params: { store_id: storeId, product_inventory_id, page, limit: itemsPerPage },
        });

        const { storeWeightOptions, totalItems } = response.data;

        // Fetch product details to get product name
        const productResponse = await api.get(`/storeweightoption/getproductinv/${product_inventory_id}`);
        const fetchedProduct = productResponse.data.product;

        const formattedData = storeWeightOptions.map((option, index) => ({
          id: option.id,
          index: (page - 1) * itemsPerPage + index + 1,
          weight: option.weight || "N/A",
          normal_price: option.normal_price || "N/A",
          subscribe_price: option.subscribe_price || "N/A",
          mrp_price: option.mrp_price || "N/A",
          quantity: option.quantity || "N/A",
          subscription_quantity: option.subscription_quantity || "N/A",
          total: option.total || "N/A",
          createdAt: new Date(option.createdAt).toLocaleDateString() || "N/A",
          product_name: fetchedProduct?.title || "Inventory List",
        }));

        setWeightOptions(formattedData);
        setFilteredWeightOptions(formattedData);
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        if (formattedData.length > 0) {
          setProductName(formattedData[0].product_name);
        }
      } catch (error) {
        console.error("Error fetching weight options:", error);
        NotificationManager.error("Failed to fetch weight options.");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchWeightOptions();
  }, [product_inventory_id, page]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = weightOptions.filter((item) =>
      Object.values(item).some((value) =>
        String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredWeightOptions(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, filteredWeightOptions.length);

  const columns = [
    "S.No.",
    "Weight",
    "Instant Price",
    "Subscribe Price",
    "MRP Price",
    "Quantity",
    "Subscription Quantity",
    "Total",
    "Created Date",
  ];

  const fields = [
    "index",
    "weight",
    "normal_price",
    "subscribe_price",
    "mrp_price",
    "quantity",
    "subscription_quantity",
    "total",
    "createdAt",
  ];

  const tableData = filteredWeightOptions
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((option) => ({
      id: option.id,
      index: option.index,
      weight: option.weight,
      normal_price: option.normal_price,
      subscribe_price: option.subscribe_price,
      mrp_price: option.mrp_price,
      quantity: option.quantity,
      subscription_quantity: option.subscription_quantity,
      total: option.total,
      createdAt: option.createdAt,
    }));

  const handleBackClick = () => {
    navigate("/store/productinv-list");
  };

  const handleAddQuantity = () => {
    navigate(`/store/add-weight-option/${product_inventory_id}`);
  };
  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <Pagetitle
          title={`${productName} Quantity History`}
          buttonLabel="Add Quantity"
          onButtonClick={handleAddQuantity}
          searchPlaceholder="Search Quantity History"
          onSearch={handleSearch}
          handleBackClick={handleBackClick}
        />
        <div className="userlist-container p-4 flex-1 overflow-auto scrollbar-color h-[78vh]">
          <div className="usertable-container bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
            <table className="w-full table text-[12px]">
              <thead className="text-[12px] text-black">
                <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="p-2 font-medium text-left"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showLoader ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-2"
                    >
                      <div className="flex justify-center items-center h-64 w-full">
                        <MilkLoader />
                      </div>
                    </td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                    >
                      No weight option history found for this product
                    </td>
                  </tr>
                ) : (
                  tableData.map((item) => (
                    <tr key={item.id} className="border-b border-[#F3E6F2]">
                      {fields.map((field, idx) => (
                        <td
                          key={idx}
                          className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]"
                        >
                          {item[field]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination-container flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="showing-container text-[#71717A] font-medium text-[12px]">
                Showing <span className="text-black">{startItem}-{endItem}</span> of{" "}
                <span className="text-black">{filteredWeightOptions.length}</span> items
              </div>

              <div className="flex items-center font-medium text-[12px] gap-4">
                <button
                  className={`previous-container flex items-center gap-2 bg-[#F3E6F2] p-2 rounded cursor-pointer ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handlePrevious}
                  disabled={page === 1}
                >
                  <LeftArrow className="w-4 h-4" />
                  Previous
                </button>
                <div className="pagenumber-container text-[#393185]">
                  Page {String(page).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
                </div>
                <button
                  className={`next-container flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                    page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleNext}
                  disabled={page === totalPages}
                >
                  Next
                  <RightArrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default StoreWeightOptionList;