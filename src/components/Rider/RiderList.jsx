import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
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
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";

const RiderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchRiderAndTimeSlots() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const store_id = Cookies.get("store_id");
        if (!store_id) {
          console.error("store_id not found in cookies");
          return;
        }
        const riderResponse = await api.get(`/rider/all/${store_id}`);
        const timeSlotResponse = await api.get(`/rider-time/getbystore/${store_id}`);

        const ridersWithTimeSlots = riderResponse.data.map(rider => ({
          ...rider,
          timeSlotsDisplay: rider.ride_timeslots && rider.ride_timeslots.length > 0
            ? rider.ride_timeslots
                .map(id => {
                  const slot = timeSlotResponse.data.find(ts => ts.id === id);
                  return slot ? `${slot.mintime} - ${slot.maxtime}` : null;
                })
                .filter(Boolean)
                .join(", ")
            : "N/A"
        }));

        setRiders(ridersWithTimeSlots);
        setFilteredRiders(ridersWithTimeSlots);
        setTotalPages(Math.ceil(ridersWithTimeSlots.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchRiderAndTimeSlots();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showModal) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

 const handleSearch = (event) => {
  const querySearch = event.target.value.toLowerCase();
  const filteredData = riders.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(querySearch);
    const emailMatch = item.email?.toLowerCase().includes(querySearch);
    const mobileMatch = item.mobile?.toLowerCase().includes(querySearch);
    const timeSlotMatch = item.timeSlotsDisplay?.toLowerCase().includes(querySearch);
    return titleMatch || emailMatch || mobileMatch || timeSlotMatch;
  });

  setFilteredRiders(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const handleDelete = async (id) => {
    const success = await DeleteEntity("Rider", id);
    if (success) {
      const updatedRiders = riders.filter((riderItem) => riderItem.id !== id);
      setRiders(updatedRiders);
      setFilteredRiders(updatedRiders);
      setTotalPages(Math.ceil(updatedRiders.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/store/add-Rider", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "Rider",
        id,
        currentStatus,
        setFilteredRiders,
        filteredRiders,
        field
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Rider"
      className="w-10 h-10 object-cover rounded-full cursor-pointer"
      onError={(e) =>
        (e.target.src =
          "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
      }
      onClick={() => handleImageClick(img)}
      height={50}
      width={50}
      loading="lazy"
    />
  );

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
    "Rider Image",
    "Name",
    "Email",
    "Mobile",
    "Time Slots",
    "Status",
  ];

  const fields = [
    "index",
    "image",
    "title",
    "email",
    "mobile",
    "timeSlotsDisplay",
    "status",
  ];

  const tableData = filteredRiders
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((rider, index) => ({
      id: rider.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(rider.img),
      title: rider.title || "N/A",
      email: rider.email || "N/A",
      mobile: rider.mobile || "N/A",
      timeSlotsDisplay: rider.timeSlotsDisplay || "N/A",
      status: renderStatus(rider.status, rider.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Rider List"} />
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
          totalItems={filteredRiders.length}
          itemsPerPage={itemsPerPage}
        />
        <NotificationContainer />
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-label="Enlarged Rider Image"
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-[80vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              <FaTimes size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Rider"
              className="max-w-full max-h-[70vh] object-contain"
              onError={(e) =>
                (e.target.src =
                  "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderList;