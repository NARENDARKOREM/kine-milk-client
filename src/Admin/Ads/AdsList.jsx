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

  const fetchAds = async () => {
    setIsLoading(true);
    setShowLoader(true);
    try {
      const response = await api.get("/ads/fetch-ads", {
        withCredentials: true,
      });
      console.log("Fetched ads:", response.data);
      setAds(response.data);
      setFilteredAds(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching ads:", error);
      NotificationManager.error("Error fetching ads", "Error");
    } finally {
      setIsLoading(false);
      setShowLoader(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Refreshing ads due to navigation state");
      fetchAds();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleImageClick = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setShowModal(true);
    }
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
    const filteredData = ads.filter((ad) => {
      const screenNameMatch = ad.screenName?.toLowerCase().includes(querySearch);
      const planTypeMatch = ad.planType?.toLowerCase().includes(querySearch);
      const startDateMatch = ad.startDateTime
        ?.toLowerCase()
        .includes(querySearch);
      const endDateMatch = ad.endDateTime
        ?.toLowerCase()
        .includes(querySearch);
      const statusMatch =
        (ad.status === 1 ? "published" : "unpublished")
          .toLowerCase()
          .includes(querySearch);

      return (
        screenNameMatch ||
        planTypeMatch ||
        startDateMatch ||
        endDateMatch ||
        statusMatch
      );
    });

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
    navigate("/admin/add-ads", { state: { id, refresh: true } });
  };

  const handleToggleChange = async (id, currentStatus, field, startDateTime) => {
    const now = new Date().toISOString();
    if (startDateTime && startDateTime > now) {
      NotificationManager.error(
        "Cannot toggle status for an ad with a future start date. It will be published automatically when the start time is reached.",
        "Error"
      );
      return;
    }
    try {
      await StatusEntity("Ads", id, currentStatus, setFilteredAds, filteredAds, field);
    } catch (error) {
      console.error("Error toggling ad status:", error);
    }
  };

  const sortData = (key) => {
    handleSort(filteredAds, key, setSortConfig, setFilteredAds);
  };

  const renderImage = (img) => {
    const defaultImage =
      "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg";
    const imageSrc = img
      ? encodeURI(img.replace(/%(?![0-9A-Fa-f]{2})/g, "%25")) + `?t=${Date.now()}`
      : defaultImage;

    return (
      <img
        src={imageSrc}
        alt="Ad"
        className="w-10 h-10 object-cover rounded-full cursor-pointer"
        onError={(e) => {
          console.warn(`Failed to load image: ${img}`);
          e.target.src = defaultImage;
        }}
        onClick={() => img && handleImageClick(img)}
        height={50}
        width={50}
        loading="lazy"
      />
    );
  };

  const renderStatus = (status, id, startDateTime) => {
    const statusLabel = status === 1 ? "Published" : "Unpublished";
    const now = new Date().toISOString();
    const isFutureStart = startDateTime && startDateTime > now;

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
    return dateTime || "-";
  };

  const columns = ["S.No.", "Ad Image", "Screen Name", "Plan Type", "Start Date", "End Date", "Status"];
  const fields = ["index", "image", "screenName", "planType", "startDateTime", "endDateTime", "status"];

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
              src={`${encodeURI(selectedImage.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"))}?t=${Date.now()}`}
              alt="Enlarged Ad"
              className="max-w-full max-h-[70vh] object-contain"
              onError={(e) => {
                console.warn(`Failed to load enlarged image: ${selectedImage}`);
                e.target.src =
                  "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsList;