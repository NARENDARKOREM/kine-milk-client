import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import api from "../utils/api";
import MilkLoader from "../utils/MilkLoader";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ReactComponent as LeftArrow } from "../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../assets/images/Right Arrow.svg";
import { ReactComponent as Download } from "../assets/images/Download.svg";

const PaymentReportsTable = ({ reportType = "normal", searchTerm, fromDate, toDate, storeId }) => {
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const itemsPerPage = 10;
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchPayments();
  }, [debouncedSearch, fromDate, toDate, currentPage, storeId]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const params = {
        search: debouncedSearch,
        fromDate,
        toDate,
        storeId: storeId || undefined,
        page: currentPage,
        limit: itemsPerPage,
      };
      const response = await api.get(`/payments/${reportType}-payments`, { params });
      const { payments, total, totalPages } = response.data;
      setPayments(payments || []);
      setTotalItems(total || 0);
      setTotalPages(totalPages || 1);
    } catch (error) {
      NotificationManager.error(
        `Failed to fetch payments: ${error.response?.data?.message || error.message}`,
        "Error",
        3000
      );
      setPayments([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 2000);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const params = { fromDate, toDate, storeId: storeId || undefined };
      const response = await api.get(`/payments/${reportType}-payments/download`, {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_payments.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.success("All payments downloaded successfully", "Success", 3000);
    } catch (error) {
      NotificationManager.error("Failed to download all payments", "Error", 3000);
    }
  };

  const handleSingleDownload = async (orderId) => {
    try {
      const response = await api.get(`/payments/${reportType}-payments/download/${orderId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_payment_${orderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      NotificationManager.success(`Payment ${orderId} downloaded successfully`, "Success", 3000);
    } catch (error) {
      NotificationManager.error(`Failed to download payment ${orderId}`, "Error", 3000);
    }
  };

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
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="p-4 flex-1 overflow-auto scrollbar-color h-[65vh] bg-[#f7fbff]">
      <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
        <table className="w-full text-[12px]" aria-label="Payment reports table">
          <thead className="text-[12px] text-black font-bold">
            <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
              <th className="p-2 font-medium text-left">Sr. No</th>
              <th className="p-2 font-medium text-left">Order ID</th>
              <th className="p-2 font-medium text-left">Order Date</th>
              <th className="p-2 font-medium text-left">Username</th>
              <th className="p-2 font-medium text-left">Store Name</th>
              <th className="p-2 font-medium text-left">Delivery Charge</th>
              <th className="p-2 font-medium text-left">Coupon Amount</th>
              {reportType === "subscribe" && (
                <th className="p-2 font-medium text-left">End Date</th>
              )}
              <th className="p-2 font-medium text-left">Tax</th>
              <th className="p-2 font-medium text-left">Subtotal</th>
              <th className="p-2 font-medium text-left">Total Amount</th>
              <th className="p-2 font-medium text-left">Transaction ID</th>
              <th className="p-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {showLoader ? (
              <tr>
                <td colSpan={reportType === "subscribe" ? 13 : 12} className="text-center py-2">
                  <div className="flex justify-center items-center h-64 w-full">
                    <MilkLoader />
                  </div>
                </td>
              </tr>
            ) : payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment.order_id} className="border-b border-[#F3E6F2]">
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.order_id || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.order_date ? new Date(payment.order_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.username || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.store_name || "N/A"}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.delivery_charge || 0}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.coupon_amount || 0}
                  </td>
                  {reportType === "subscribe" && (
                    <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                      {payment.end_date ? new Date(payment.end_date).toLocaleDateString() : "N/A"}
                    </td>
                  )}
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.tax || 0}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.subtotal || 0}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.total_amount || 0}
                  </td>
                  <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                    {payment.transaction_id || "N/A"}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Download
                        className="w-5 h-5 text-blue-500 cursor-pointer"
                        onClick={() => handleSingleDownload(payment.order_id)}
                        aria-label={`Download payment ${payment.order_id}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={reportType === "subscribe" ? 13 : 12}
                  className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                >
                  {storeId ? "Payments are not found for this store" : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-4 px-4">
          <div className="text-[#71717A] font-medium text-[12px]">
            Showing <span className="text-black">{startItem}-{endItem}</span> of{" "}
            <span className="text-black">{totalItems}</span> items
          </div>
          <div className="flex items-center font-medium text-[12px] gap-4">
            <button
              className={`flex items-center gap-2 bg-[#F3E6F2] p-2 rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={handlePrevious}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <LeftArrow className="w-4 h-4" />
              Previous
            </button>
            <div className="text-[#393185]">
              Page {String(currentPage).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
            </div>
            <button
              className={`flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
      </div>
      {/* {totalItems > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            className="bg-[#393185] text-white px-4 py-2 rounded hover:bg-[#2a247d] transition"
            onClick={handleDownloadAll}
            aria-label="Download all payments"
          >
            Download All Payments
          </button>
        </div>
      )} */}
    </div>
  );
};

export default PaymentReportsTable;