import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import api from "../utils/api";
import MilkLoader from "../utils/MilkLoader";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ReactComponent as LeftArrow } from "../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../assets/images/Right Arrow.svg";
import { ReactComponent as Download } from "../assets/images/Download.svg";

const OrderReportsTable = ({ reportType = "normal", searchTerm, fromDate, toDate, storeId }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [page, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const itemsPerPage = 10;
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchOrders();
  }, [fromDate, toDate, page, storeId]);

  useEffect(() => {
    // Filter orders locally based on searchTerm
    const lowerSearchTerm = debouncedSearch.toLowerCase();
    const filtered = orders.filter((order) =>
      [
        String(order.order_id),
        order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A",
        order.username || "N/A",
        order.store_name || "N/A",
        order.order_status || "N/A",
        order.user_mobile_no || "N/A",
        order.timeslot || "N/A",
      ].some((field) => field.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredOrders(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [debouncedSearch, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const params = {
        fromDate,
        toDate,
        storeId: storeId || undefined,
        page,
        limit: itemsPerPage,
      };
      const response = await api.get(`/orders/${reportType}-orders`, { params });
      console.log(response, "rrrrrrrrrrrrrrrrrrrr");
      const { orders, total, totalPages } = response.data;
      setOrders(orders || []);
      setFilteredOrders(orders || []);
      setTotalItems(total || 0);
      setTotalPages(totalPages || 1);
    } catch (error) {
      NotificationManager.error(
        `Failed to fetch orders: ${error.response?.data?.message || error.message}`,
        "Error",
        3000
      );
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 2000);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const params = { fromDate, toDate, storeId: storeId || undefined };
      const response = await api.get(`/orders/${reportType}-orders/download`, {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_orders.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.success("All orders downloaded successfully", "Success", 3000);
    } catch (error) {
      NotificationManager.error("Failed to download all orders", "Error", 3000);
    }
  };

  const handleSingleDownload = async (orderId) => {
    if (!orderId) {
      NotificationManager.error("Order ID is missing", "Error", 3000);
      return;
    }
    try {
      const response = await api.get(`/orders/${reportType}-orders/download/${orderId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_order_${orderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.success(`Order ${orderId} downloaded successfully`, "Success", 3000);
    } catch (error) {
      NotificationManager.error(`Failed to download order ${orderId}`, "Error", 3000);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setCurrentPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setCurrentPage(page + 1);
    }
  };

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className="p-4 flex-1 overflow-auto scrollbar-color h-[65vh] bg-[#f7fbff]">
      <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
        <table className="w-full text-[12px]" aria-label="Orders report table">
          <thead className="text-[12px] text-black font-bold">
            <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
              <th className="p-2 font-medium text-left">S.No.</th>
              <th className="p-2 font-medium text-left">Order ID</th>
              <th className="p-2 font-medium text-left">Order Date</th>
              <th className="p-2 font-medium text-left">Username</th>
              <th className="p-2 font-medium text-left">Store Name</th>
              <th className="p-2 font-medium text-left">Order Status</th>
              <th className="p-2 font-medium text-left">User Mobile No</th>
              {reportType === "subscribe" && (
                <>
                  <th className="p-2 font-medium text-left">Start Date</th>
                  <th className="p-2 font-medium text-left">End Date</th>
                </>
              )}
              <th className="p-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {showLoader ? (
              <tr>
                <td colSpan={reportType === "subscribe" ? 10 : 8} className="text-center py-2">
                  <div className="flex justify-center items-center h-64 w-full">
                    <MilkLoader />
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={reportType === "subscribe" ? 10 : 8} className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]">
                  {storeId ? "Orders are not found for this store" : debouncedSearch ? "No orders match the search" : "No data available"}
                </td>
              </tr>
            ) : (
              filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((order, index) => (
                <tr key={order.order_id} className="border-b border-[#F3E6F2]">
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {(page - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.order_id || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.username || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.store_name || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.order_status || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {order.user_mobile_no || "N/A"}
                  </td>
                  {reportType === "subscribe" && (
                    <>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {order.start_date ? new Date(order.start_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {order.end_date ? new Date(order.end_date).toLocaleDateString() : "N/A"}
                      </td>
                    </>
                  )}
                  <td className="p-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Download
                        className="w-5 h-5 text-blue-500 cursor-pointer"
                        onClick={() => handleSingleDownload(order.order_id)}
                        aria-label={`Download order ${order.order_id}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
          <div className="text-[#71717A] font-medium text-[12px]">
            Showing <span className="text-black">{startItem}-{endItem}</span> of{" "}
            <span className="text-black">{totalItems}</span> items
          </div>
          <div className="flex items-center font-medium text-[12px] gap-4">
            <button
              className={`flex items-center gap-2 bg-[#F3E6F2] p-2 rounded ${
                page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={handlePrevious}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <LeftArrow className="w-4 h-4" />
              Previous
            </button>
            <div className="text-[#393185]">
              Page {String(page).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
            </div>
            <button
              className={`flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={handleNext}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
              <RightArrow className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReportsTable;