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

const RiderTimeSlotList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [riderTimeSlots, setRiderTimeSlots] = useState([]);
  const [filteredRiderTimeSlots, setFilteredRiderTimeSlots] = useState([]);
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
    async function fetchRiderTimeSlots() {
      if (!store_id) return;

      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get(`/rider-time/getbystore/${store_id}`);
        console.log("Fetched rider time slots:", response.data);
        setRiderTimeSlots(response.data);
        setFilteredRiderTimeSlots(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching rider time slots:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }

    fetchRiderTimeSlots();
  }, [store_id]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = riderTimeSlots.filter((item) =>
      Object.values(item).some((value) =>
        value && typeof value === "object"
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(querySearch)
            )
          : String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredRiderTimeSlots(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("RiderTimeSlot", id);
    if (success) {
      const updatedSlots = riderTimeSlots.filter((slot) => slot.id !== id);
      setRiderTimeSlots(updatedSlots);
      setFilteredRiderTimeSlots(updatedSlots);
      setTotalPages(Math.ceil(updatedSlots.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/store/addrider-timeslot", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "RiderTimeSlot",
        id,
        currentStatus,
        setFilteredRiderTimeSlots,
        filteredRiderTimeSlots,
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

  const tableData = filteredRiderTimeSlots
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((slot, index) => ({
      id: slot.id,
      index: (page - 1) * itemsPerPage + index + 1,
      mintime: slot.mintime || "N/A",
      maxtime: slot.maxtime || "N/A",
      status: renderStatus(slot.status, slot.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Rider Time Slots Management"} />
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
          totalItems={filteredRiderTimeSlots.length}
          itemsPerPage={itemsPerPage}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default RiderTimeSlotList;