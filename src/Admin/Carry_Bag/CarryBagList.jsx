import React, { useState, useEffect } from "react";
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

const CarryBagList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [carryBags, setCarryBags] = useState([]);
  const [filteredCarryBags, setFilteredCarryBags] = useState([]);
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
    async function fetchCarryBags() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/carrybag/all", {
          withCredentials: true,
        });
        console.log(response,"fghjkjhgfdfg")
        setCarryBags(response.data);
        setFilteredCarryBags(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching carry bags:", error);
        NotificationManager.error("Error fetching carry bags", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchCarryBags();
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
  const filteredData = carryBags.filter((item) => {
    return (
      String(item.planType).toLowerCase().includes(querySearch) ||
      String(item.cost).toLowerCase().includes(querySearch) ||
      String(item.status === 1 ? "published" : "unpublished").includes(querySearch)
    );
  });
  setFilteredCarryBags(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const handleDelete = async (id) => {
    const success = await DeleteEntity("CarryBag", id);
    if (success) {
      const updatedCarryBags = carryBags.filter(
        (carryBag) => carryBag.id !== id
      );
      setCarryBags(updatedCarryBags);
      setFilteredCarryBags(updatedCarryBags);
      setTotalPages(Math.ceil(updatedCarryBags.length / itemsPerPage));
    //   NotificationManager.success("Carry bag deleted successfully", "Success");
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-carrybag", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "CarryBag",
        id,
        currentStatus,
        setFilteredCarryBags,
        filteredCarryBags,
        field
      );
    //   NotificationManager.success("Carry bag status updated successfully", "Success");
    } catch (error) {
      console.error("Error toggling carry bag status:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Error updating carry bag status", "Error");
    }
  };

  const sortData = (key) => {
    handleSort(filteredCarryBags, key, setSortConfig, setFilteredCarryBags);
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Carry Bag"
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
    let statusLabel = status === 1 ? "Published" : "Unpublished";

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

  const columns = ["S.No.", "Image", "Plan Type", "Cost (INR)", "Status"];

  const fields = ["index", "image", "planType", "cost", "status"];

  const tableData = filteredCarryBags
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((carryBag, index) => ({
      id: carryBag.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(carryBag.bagImage),
      planType: carryBag.planType,
      cost: carryBag.cost,
      status: renderStatus(carryBag.status, carryBag.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Carry Bag List"} />
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
          totalItems={filteredCarryBags.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer style={{ zIndex: 10000 }} />
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-label="Enlarged Carry Bag Image"
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
              alt="Enlarged Carry Bag"
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

export default CarryBagList;