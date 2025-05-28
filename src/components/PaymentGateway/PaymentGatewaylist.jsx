import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import { NotificationManager } from "react-notifications";
import { FaPen, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../common/Loader";
import api from "../../utils/api"
const PaymentGatewayList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPaymentGateways();
  }, []);

  const fetchPaymentGateways = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        "/payment-gateways"
      );
      setPaymentGateways(response.data);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
    }
    setIsLoading(false);
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await api.put(`/payment-gateways/${id}`, {
        [field]: currentStatus === 1 ? 0 : 1,
      });
      fetchPaymentGateways();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this payment gateway?")
    )
      return;
    try {
      await api.delete(`/payment-gateways/${id}`);
      NotificationManager.success("Payment Gateway deleted successfully!");
      fetchPaymentGateways();
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      NotificationManager.error("Failed to delete payment gateway.");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = paymentGateways.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(paymentGateways.length / itemsPerPage);

  return (
    <div>
      {isLoading && <Loader />}
      <Header />
      <InnerHeader name="Payment Gateway Management" />
      <div className="py-6 px-6 h-full overflow-hidden">
        <div className="bg-white w-full rounded-xl border border-gray-300 overflow-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-[#393185] text-white">
              <tr>
                <th className="px-2 py-3 whitespace-nowrap">S. No</th>
                <th className="px-2 py-3 whitespace-nowrap">Payment Gateway</th>
                <th className="px-2 py-3 whitespace-nowrap">
                  Payment Gateway Subtitle
                </th>
                <th className="px-2 py-3 whitespace-nowrap">
                  Payment Gateway Image
                </th>
                <th className="px-2 py-3 whitespace-nowrap">
                  Payment Gateway Status
                </th>
                <th className="px-2 py-3 whitespace-nowrap">Show on Wallet</th>
                <th className="px-2 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((gateway, index) => (
                  <tr key={gateway.id}>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {gateway.name || "N/A"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {gateway.subtitle || "N/A"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {gateway.image ? (
                        <img
                          src={gateway.image}
                          alt="Gateway"
                          className="h-12 w-12 object-cover rounded-md border"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <FontAwesomeIcon
                        className="h-7 w-16 cursor-pointer"
                        style={{
                          color: gateway.status === 1 ? "#0064DC" : "#e9ecef",
                        }}
                        icon={gateway.status === 1 ? faToggleOn : faToggleOff}
                        onClick={() =>
                          handleToggleChange(
                            gateway.id,
                            gateway.status,
                            "status"
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <FontAwesomeIcon
                        className="h-7 w-16 cursor-pointer"
                        style={{
                          color:
                            gateway.show_on_wallet === 1
                              ? "#0064DC"
                              : "#e9ecef",
                        }}
                        icon={
                          gateway.show_on_wallet === 1
                            ? faToggleOn
                            : faToggleOff
                        }
                        onClick={() =>
                          handleToggleChange(
                            gateway.id,
                            gateway.show_on_wallet,
                            "show_on_wallet"
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <button className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition mr-2">
                        <FaPen />
                      </button>
                      <button
                        className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        onClick={() => handleDelete(gateway.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-white">
                    No payment gateways found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGatewayList;
