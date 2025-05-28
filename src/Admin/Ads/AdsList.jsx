import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import InnerHeader from "../../components/Coupon/CouponHeader";
import ProductInventoryTable from "../../Store/ProductInventory/ProductInventoryTable";
import api from "../../utils/api";
import { StatusEntity } from "../../utils/StatusEntity";
import { handleSort } from "../../utils/sorting";
import { DeleteEntity } from "../../utils/DeleteEntity";
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";

const AdsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchAds() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/ads/fetch-ads", {
          withCredentials: true,
        });
        setAds(response.data);
        setFilteredAds(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching ads:", error);
        NotificationManager.error("Error fetching ads", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchAds();
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
    const filteredData = ads.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue).toLowerCase().includes(querySearch)
            )
          : String(value).toLowerCase().includes(querySearch)
      )
    );
    setFilteredAds(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

   const handleDelete = async (id) => {
    const success = await DeleteEntity("Ads", id);
    if (success) {
      const updatedAds = ads.filter((ad) => ad.id !== id);
      setAds(updatedAds);
      setFilteredAds(updatedAds);
      setTotalPages(Math.ceil(updatedAds.length / itemsPerPage));
      NotificationManager.success("Ad deleted successfully", "Success");
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-ads", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field, startDateTime) => {
    const now = new Date();
    const startDate = startDateTime ? new Date(startDateTime) : null;
    if (startDate && startDate > now) {
      NotificationManager.error(
        "Cannot toggle status for an ad with a future start date. It will be published automatically when the start time is reached.",
        "Error"
      );
      return;
    }
    try {
      await StatusEntity(
        "Ads",
        id,
        currentStatus,
        setFilteredAds,
        filteredAds,
        field
      );
      NotificationManager.success("Ad status updated successfully", "Success");
    } catch (error) {
      console.error("Error toggling ad status:", error);
      NotificationManager.error(error.response?.data?.ResponseMsg || "Error updating ad status", "Error");
    }
  };

  const sortData = (key) => {
    handleSort(filteredAds, key, setSortConfig, setFilteredAds);
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Ad"
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

  const renderStatus = (status, id, startDateTime) => {
    const statusLabel = status === 1 ? "Published" : "Unpublished";
    const now = new Date();
    const startDate = startDateTime ? new Date(startDateTime) : null;
    const isFutureStart = startDate && startDate > now;

    return (
      <div className="flex items-center">
        <FontAwesomeIcon
          className={`h-7 w-16 ${isFutureStart ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
          icon={status === 1 ? faToggleOn : faToggleOff}
          onClick={() => !isFutureStart && handleToggleChange(id, status, "status", startDateTime)}
          title={isFutureStart ? "Cannot toggle status for ads with a future start date." : ""}
        />
        <span className="ml-2 text-sm">{statusLabel}</span>
      </div>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const utcDate = new Date(dateTime);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + istOffset);
    return istDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const columns = ["S.No.", "Ad Image", "Screen Name", "Plan Type", "Status", "Start Date", "End Date"];

  const fields = ["index", "image", "screenName", "planType", "status", "startDateTime", "endDateTime"];

  const tableData = filteredAds
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((ad, index) => ({
      id: ad.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(ad.img),
      screenName: ad.screenName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      planType: ad.planType.charAt(0).toUpperCase() + ad.planType.slice(1),
      status: renderStatus(ad.status, ad.id, ad.startDateTime),
      startDateTime: formatDateTime(ad.startDateTime),
      endDateTime: formatDateTime(ad.endDateTime),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Ads List"} />
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
          totalItems={filteredAds.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer />
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-label="Enlarged Ad Image"
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
              alt="Enlarged Ad"
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

export default AdsList;