import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import InnerHeader from "../../components/Coupon/CouponHeader";
import ProductInventoryTable from "../../Store/ProductInventory/ProductInventoryTable";
import api from "../../utils/api";
import { StatusEntity } from "../../utils/StatusEntity";
import { DeleteEntity } from "../../utils/DeleteEntity";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import MilkLoader from "../../utils/MilkLoader";
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";

const TimeSlotList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState([]);
  const [filteredTime, setFilteredTime] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [store_id, setStore_id] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;
  const { setValue } = useForm();

  useEffect(() => {
    const token = Cookies.get("token");
    const storeIdFromCookie = Cookies.get("store_id");

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded, "decoded token");
    }

    if (storeIdFromCookie) {
      setValue("store_id", storeIdFromCookie);
      setStore_id(storeIdFromCookie);
    }
  }, [setValue]);

  useEffect(() => {
    async function fetchTime() {
      if (!store_id) return;

      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get(`/time/all/${store_id}`);
        console.log("Fetched time:", response.data);
        setTime(response.data);
        setFilteredTime(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching time:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }

    fetchTime();
  }, [store_id]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = time.filter((item) =>
      Object.values(item).some((value) =>
        value && typeof value === "object"
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(querySearch)
            )
          : String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredTime(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("Time", id);
    if (success) {
      const updatedTime = time.filter((timeItem) => timeItem.id !== id);
      setTime(updatedTime);
      setFilteredTime(updatedTime);
      setTotalPages(Math.ceil(updatedTime.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/store/add-timeslot", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "Time",
        id,
        currentStatus,
        setFilteredTime,
        filteredTime,
        field
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{
        color: status === 1 ? "#0064DC" : "#e9ecef",
      }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = [
    "S.No.",
    "Min Time",
    "Max Time",
    "Status",
  ];

  const fields = [
    "index",
    "mintime",
    "maxtime",
    "status",
  ];

  const tableData = filteredTime
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((timeItem, index) => ({
      id: timeItem.id,
      index: (page - 1) * itemsPerPage + index + 1,
      mintime: timeItem.mintime || "N/A",
      maxtime: timeItem.maxtime || "N/A",
      status: renderStatus(timeItem.status, timeItem.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Time Slots Management"} />
        <ProductInventoryTable
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
          totalItems={filteredTime.length}
          itemsPerPage={itemsPerPage}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default TimeSlotList;