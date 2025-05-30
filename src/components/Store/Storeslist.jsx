import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { FaTimes } from "react-icons/fa";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import ProductInventoryTable from "../../Store/ProductInventory/ProductInventoryTable";
import api from "../../utils/api";
import { handleSort } from "../../utils/sorting";
import { StatusEntity } from "../../utils/StatusEntity";
import Swal from "sweetalert2";
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";

const StoresList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchStores() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/store/fetch");
        console.log("API Response:", response.data);
        const storesData = (response.data?.stores || []).map((store) => ({
          ...store,
          rimg: store.rimg ? store.rimg.replace(/\s/g, "%20") : "",
          cover_img: store.cover_img ? store.cover_img.replace(/\s/g, "%20") : "",
        }));
        setStores(storesData);
        setFilteredStores(storesData);
        setTotalPages(Math.ceil(storesData.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching Stores:", error);
        NotificationManager.removeAll();
        NotificationManager.error("Failed to fetch stores", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        closeImageModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isModalOpen]);

 const handleSearch = (event) => {
  const querySearch = event.target.value.toLowerCase();
  const filteredData = stores.filter((store) =>
    (store.title || "").toLowerCase().includes(querySearch)
  );
  setFilteredStores(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const sortData = (key) => {
    handleSort(filteredStores, key, sortConfig, setSortConfig, setFilteredStores);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete(`/store/delete/${id}`);
      if (response.status === 200) {
        const updatedStores = stores.filter((store) => store.id !== id);
        setStores(updatedStores);
        setFilteredStores(updatedStores);
        setTotalPages(Math.ceil(updatedStores.length / itemsPerPage));
        // NotificationManager.success("Store deleted successfully", "Success", 3000);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Failed to delete store", "Error", 3000);
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-store", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Stores", id, currentStatus, setFilteredStores, filteredStores, field);
      // NotificationManager.success("Store status updated successfully", "Success", 3000);
    } catch (error) {
      console.error("Error toggling store status:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Failed to update store status", "Error", 3000);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(
      imageUrl || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
    );
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const renderImage = (img, alt) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt={alt}
      className="h-10 w-10 object-cover rounded-full cursor-pointer"
      onError={(e) =>
        (e.target.src =
          "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
      }
      onClick={() => openImageModal(img)}
      height={40}
      width={40}
      loading="lazy"
    />
  );

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = ["S.No.", "Store Image", "Cover Image", "Store Name", "Status"];

  const fields = ["index", "store_image", "cover_image", "store_name", "status"];

  const tableData = filteredStores
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((store, index) => ({
      id: store.id,
      index: (page - 1) * itemsPerPage + index + 1,
      store_image: renderImage(store.rimg, "Store"),
      cover_image: renderImage(store.cover_img, "Cover"),
      store_name: store.title || "N/A",
      status: renderStatus(store.status, store.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="Store Management" />
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
          totalItems={filteredStores.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer />
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeImageModal}
          role="dialog"
          aria-label="Enlarged Store Image"
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-[80vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closeImageModal}
              aria-label="Close Modal"
            >
              <FaTimes size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Store Image"
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

export default StoresList;