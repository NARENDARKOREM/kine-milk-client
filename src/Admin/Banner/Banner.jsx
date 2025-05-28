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

const Banner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
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
    async function fetchBanners() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/banner/fetch-banners", {
          withCredentials: true,
        });
        setBanners(response.data);
        setFilteredBanners(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching banners:", error);
        NotificationManager.removeAll();
        NotificationManager.error("Error fetching banners", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchBanners();
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
    const filteredData = banners.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue).toLowerCase().includes(querySearch)
            )
          : String(value).toLowerCase().includes(querySearch)
      )
    );
    setFilteredBanners(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("Banner", id);
    if (success) {
      const updatedBanners = banners.filter((banner) => banner.id !== id);
      setBanners(updatedBanners);
      setFilteredBanners(updatedBanners);
      setTotalPages(Math.ceil(updatedBanners.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-banner", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "Banner",
        id,
        currentStatus,
        setFilteredBanners,
        filteredBanners,
        field
      );
    } catch (error) {
      console.error("Error toggling banner status:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Error updating banner status", "Error");
    }
  };

  const sortData = (key) => {
    handleSort(filteredBanners, key, setSortConfig, setFilteredBanners);
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Banner"
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

  const renderStatus = (status, id) => {
    const statusLabel = status === 1 ? "Published" : "Unpublished";
    return (
      <div className="flex items-center">
        <FontAwesomeIcon
          className="h-7 w-16 cursor-pointer"
          style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
          icon={status === 1 ? faToggleOn : faToggleOff}
          onClick={() => handleToggleChange(id, status, "status")}
        />
        <span className="ml-2 text-sm">{statusLabel}</span>
      </div>
    );
  };

  const renderTime = (time) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const columns = ["S.No.", "Banner Image", "Plan Type", "Start Time", "End Time", "Status"];

  const fields = ["index", "image", "planType", "startTime", "endTime", "status"];

  const tableData = filteredBanners
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((banner, index) => ({
      id: banner.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(banner.img),
      planType: banner.planType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      startTime: renderTime(banner.startTime),
      endTime: renderTime(banner.endTime),
      status: renderStatus(banner.status, banner.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Banner List"} />
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
          totalItems={filteredBanners.length}
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
          aria-label="Enlarged Banner Image"
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
              alt="Enlarged Banner"
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

export default Banner;