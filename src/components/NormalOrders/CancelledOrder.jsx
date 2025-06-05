import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import InnerHeader from "../../components/Coupon/CouponHeader";
import ProductInventoryTable from "../../Store/ProductInventory/ProductInventoryTable";
import api from "../../utils/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import MilkLoader from "../../utils/MilkLoader";
import { handleSort } from "../../utils/sorting";

const CancelledOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelledOrder, setCancelledOrder] = useState([]);
  const [filteredCancelledOrder, setFilteredCancelledOrder] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;
  const { setValue } = useForm();
  const status = "Cancelled";

  useEffect(() => {
    const token = Cookies.get("token");
    const storeIdFromCookie = Cookies.get("store_id");

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded, "decoded token");
    }

    if (storeIdFromCookie) {
      setValue("store_id", storeIdFromCookie);

      async function fetchCancelledOrder() {
        if (!status) {
          console.error("Status is missing!");
          return;
        }

        setIsLoading(true);
        setShowLoader(true);
        try {
          const response = await api.get(
            `/normalorder/all/${storeIdFromCookie}/${status}`
          );
          console.log("Fetched cancelledOrder:", response.data);
          setCancelledOrder(response.data.data);
          setFilteredCancelledOrder(response.data.data);
          setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
        } catch (error) {
          console.error("Error fetching cancelledOrder:", error);
        } finally {
          setIsLoading(false);
          setTimeout(() => {
            setShowLoader(false);
          }, 2000);
        }
      }

      fetchCancelledOrder();
    }
  }, [status, setValue]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = cancelledOrder.filter((item) =>
      Object.values(item).some((value) =>
        value && typeof value === "object"
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(querySearch)
            )
          : String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredCancelledOrder(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const sortData = (key) => {
    handleSort(
      filteredCancelledOrder,
      key,
      sortConfig,
      setSortConfig,
      setFilteredCancelledOrder
    );
  };

  const columns = [
    "S.No.",
    "Order Id",
    "Order Date",
    "User Name",
    "Status",
  ];

  const fields = [
    "index",
    "order_id",
    "order_date",
    "user_name",
    "status",
  ];

  const tableData = filteredCancelledOrder
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((order, index) => ({
      id: order.id,
      index: (page - 1) * itemsPerPage + index + 1,
      order_id: order.order_id || "N/A",
      order_date: order.odate ? order.odate.split("T")[0] : "N/A",
      user_name: order.user?.name || "N/A",
      status: order.status || "N/A",
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader
          onSearch={handleSearch}
          name={"Cancelled instant orders"}
        />
        <ProductInventoryTable
          columns={columns}
          data={tableData}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          fields={fields}
          showLoader={showLoader}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          totalItems={filteredCancelledOrder.length}
          itemsPerPage={itemsPerPage}
          showActions={false}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          handleSort={sortData}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default CancelledOrder;