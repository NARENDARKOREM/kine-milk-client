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

const IllustrationImagesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [illustrations, setIllustrations] = useState([]);
  const [filteredIllustrations, setFilteredIllustrations] = useState([]);
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
    async function fetchIllustrations() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/illustration/fetch-illustrations", {
          withCredentials: true,
        });
        console.log(response.data);
        setIllustrations(response.data);
        setFilteredIllustrations(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching illustrations:", error);
        NotificationManager.removeAll();
        NotificationManager.error("Error fetching illustrations", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchIllustrations();
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
    const filteredData = illustrations.filter((item) => {
      const screenNameMatch = item.screenName?.toLowerCase().includes(querySearch);
      const startTimeMatch = item.startTime?.toLowerCase().includes(querySearch);
      const endTimeMatch = item.endTime?.toLowerCase().includes(querySearch);
      const statusMatch =
        (item.status === 1 ? "published" : "unpublished").includes(querySearch);

      return screenNameMatch || startTimeMatch || endTimeMatch || statusMatch;
    });

    setFilteredIllustrations(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("Illustration", id);
    if (success) {
      const updatedIllustrations = illustrations.filter(
        (illustration) => illustration.id !== id
      );
      setIllustrations(updatedIllustrations);
      setFilteredIllustrations(updatedIllustrations);
      setTotalPages(Math.ceil(updatedIllustrations.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-illustration", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "Illustration",
        id,
        currentStatus,
        setFilteredIllustrations,
        filteredIllustrations,
        field
      );
    } catch (error) {
      console.error("Error toggling illustration status:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Error updating illustration status", "Error");
    }
  };

  const sortData = (key) => {
    handleSort(filteredIllustrations, key, setSortConfig, setFilteredIllustrations);
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Illustration"
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
    return time || "N/A";
  };

  const columns = ["S.No.", "Illustration Image", "Screen Name", "Start Time", "End Time", "Status"];

  const fields = ["index", "image", "screenName", "startTime", "endTime", "status"];

  const tableData = filteredIllustrations
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((illustration, index) => ({
      id: illustration.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(illustration.img),
      screenName: illustration.screenName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      startTime: renderTime(illustration.startTime),
      endTime: renderTime(illustration.endTime),
      status: renderStatus(illustration.status, illustration.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Illustration Images List"} />
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
          totalItems={filteredIllustrations.length}
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
          aria-label="Enlarged Illustration Image"
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
              alt="Enlarged Illustration"
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

export default IllustrationImagesList;