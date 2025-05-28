import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import MilkLoader from "../utils/MilkLoader";
import Header from "../common/Header";
import { ReactComponent as LeftArrow } from "../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../assets/images/Right Arrow.svg";
import { ReactComponent as Download } from "../assets/images/Download.svg";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
const StockReports = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [expandedStore, setExpandedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchStockReports();
  }, [debouncedSearch]);

  const fetchStockReports = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const response = await api.get("/stock-reports", {
        params: { search: debouncedSearch },
      });
      setStores(response.data.stores || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching stock reports:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 2000);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await api.get("/stock-reports/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all_stores_stock_report.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading all stock reports:", error);
    }
  };

  const handleDownloadSingleStore = async (storeId) => {
    try {
      const response = await api.get(`/stock-reports/download/${storeId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `stock_report_${storeId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading single store stock report:", error);
    }
  };

  const toggleStore = (storeId) => {
    setExpandedStore(expandedStore === storeId ? null : storeId);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStores = stores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(stores.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, stores.length);

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-6 pt-6 gap-4 ml-6 mr-6">
        <div className="font-medium text-left">
          <h3
            className="flex items-center text-lg font-medium cursor-pointer text-[#393185]"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosNewIcon className="mr-1 text-[#393185]" />
            Stock Reports
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#393185]"
          />
          <button
            onClick={handleDownloadAll}
            className="bg-[#393185] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a247d]"
          >
            Download All
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto scrollbar-color h-[70vh] mx-6">
        <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
          <table
            className="w-full text-[12px]"
            aria-label="Stock reports table"
          >
            <thead className="text-[12px] text-black font-bold">
              <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
                <th className="p-2 font-medium text-left">Store Name</th>
                <th className="p-2 font-medium text-left">Total Products</th>
                <th className="p-2 font-medium text-left">Total Stock</th>
                <th className="p-2 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {showLoader ? (
                <tr>
                  <td colSpan="4" className="text-center py-2">
                    <div className="flex justify-center items-center h-64 w-full">
                      <MilkLoader />
                    </div>
                  </td>
                </tr>
              ) : currentStores.length > 0 ? (
                currentStores.map((store) => (
                  <React.Fragment key={store.id}>
                    <tr
                      className="border-b border-[#F3E6F2] hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleStore(store.id)}
                    >
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {store.title || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {store.totalProducts || 0}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {store.totalStock || 0}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Download
                            className="w-5 h-5 text-blue-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSingleStore(store.id);
                            }}
                            aria-label={`Download stock report for store ${store.id}`}
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedStore === store.id && (
                      <tr>
                        <td colSpan="4" className="p-2 bg-gray-100">
                          <div className="max-h-[300px] overflow-y-auto scrollbar-color">
                            <div className="space-y-4">
                              {store.categories.length > 0 ? (
                                store.categories.map((category) => (
                                  <div
                                    key={category.id}
                                    className="border border-[#EAEAFF] rounded-md p-4 bg-white"
                                  >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                      {category.title || "Unnamed Category"}
                                    </h3>
                                    <table className="w-full text-[12px]">
                                      <thead className="text-[12px] text-black font-bold">
                                        <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
                                          <th className="p-2 font-medium text-left">
                                            Product Title
                                          </th>
                                          <th className="p-2 font-medium text-left">
                                            Weight
                                          </th>
                                          <th className="p-2 font-medium text-left">
                                            Stock Quantity
                                          </th>
                                          <th className="p-2 font-medium text-left">
                                            Total Stock
                                          </th>
                                          <th className="p-2 font-medium text-left">
                                            Last Updated
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {category.products.length > 0 ? (
                                          category.products.map((product) => (
                                            <React.Fragment key={product.id}>
                                              {product.weightDetails.length >
                                              0 ? (
                                                product.weightDetails.map(
                                                  (weight, index) => (
                                                    <tr
                                                      key={`${product.id}-${weight.weight}`}
                                                      className="border-b border-[#F3E6F2]"
                                                    >
                                                      {index === 0 && (
                                                        <td
                                                          className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]"
                                                          rowSpan={
                                                            product
                                                              .weightDetails
                                                              .length
                                                          }
                                                        >
                                                          {product.title ||
                                                            "N/A"}
                                                        </td>
                                                      )}
                                                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                        {weight.weight || "N/A"}
                                                      </td>
                                                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                        {weight.quantity || 0}
                                                      </td>
                                                      {index === 0 && (
                                                        <td
                                                          className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]"
                                                          rowSpan={
                                                            product
                                                              .weightDetails
                                                              .length
                                                          }
                                                        >
                                                          {product.stock || 0}
                                                        </td>
                                                      )}
                                                      {index === 0 && (
                                                        <td
                                                          className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]"
                                                          rowSpan={
                                                            product
                                                              .weightDetails
                                                              .length
                                                          }
                                                        >
                                                          {product.lastUpdated
                                                            ? new Date(
                                                                product.lastUpdated
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                        </td>
                                                      )}
                                                    </tr>
                                                  )
                                                )
                                              ) : (
                                                <tr className="border-b border-[#F3E6F2]">
                                                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                    {product.title || "N/A"}
                                                  </td>
                                                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                    N/A
                                                  </td>
                                                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                    0
                                                  </td>
                                                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                    {product.stock || 0}
                                                  </td>
                                                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                                                    {product.lastUpdated
                                                      ? new Date(
                                                          product.lastUpdated
                                                        ).toLocaleDateString()
                                                      : "N/A"}
                                                  </td>
                                                </tr>
                                              )}
                                            </React.Fragment>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan="5"
                                              className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                                            >
                                              No products available in this
                                              category
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]">
                                  No categories available for this store
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                  >
                    No stores available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {stores.length > 0 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4 px-4">
              <div className="text-[#71717A] font-medium text-[12px]">
                Showing{" "}
                <span className="text-black">
                  {startItem}-{endItem}
                </span>{" "}
                of <span className="text-black">{stores.length}</span> items
              </div>
              <div className="flex items-center font-medium text-[12px] gap-4">
                <button
                  className={`flex items-center gap-2 bg-[#F3E6F2] p-2 rounded ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <LeftArrow className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-[#393185]">
                  Page {String(currentPage).padStart(2, "0")} of{" "}
                  {String(totalPages).padStart(2, "0")}
                </div>
                <button
                  className={`flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <RightArrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockReports;
