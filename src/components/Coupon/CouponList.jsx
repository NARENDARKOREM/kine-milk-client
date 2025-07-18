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

const CouponList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [coupon, setCoupon] = useState([]);
  const [filteredCoupon, setFilteredCoupon] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    // Dates are already in IST, just format them
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    async function fetchCoupon() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/coupon/all");
        const formattedCoupons = (response.data || []).map((couponItem) => ({
          ...couponItem,
          display_start_date: formatDate(couponItem.start_date),
          display_end_date: formatDate(couponItem.end_date),
          raw_start_date: couponItem.start_date ? new Date(couponItem.start_date) : null,
          raw_end_date: couponItem.end_date ? new Date(couponItem.end_date) : null,
        }));
        setCoupon(formattedCoupons);
        setFilteredCoupon(formattedCoupons);
        setTotalPages(Math.ceil(formattedCoupons.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching Coupon:", error);
        NotificationManager.error("Failed to fetch coupons", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchCoupon();
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

    const filteredData = coupon.filter((item) => {
      const statusText = item.status === 1 ? "published" : "unpublished";

      return (
        String(item.coupon_title || "").toLowerCase().includes(querySearch) ||
        String(item.subtitle || "").toLowerCase().includes(querySearch) ||
        String(item.coupon_code || "").toLowerCase().includes(querySearch) ||
        String(item.display_start_date || "").toLowerCase().includes(querySearch) ||
        String(item.display_end_date || "").toLowerCase().includes(querySearch) ||
        String(item.min_amt || "").toLowerCase().includes(querySearch) ||
        String(item.coupon_val || "").toLowerCase().includes(querySearch) ||
        statusText.includes(querySearch)
      );
    });

    setFilteredCoupon(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const sortData = (key) => {
    handleSort(filteredCoupon, key, sortConfig, setSortConfig, setFilteredCoupon);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#393185",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete(`/coupon/delete/${id}`);
      if (response.status === 200) {
        const updatedCoupons = coupon.filter((c) => c.id !== id);
        setCoupon(updatedCoupons);
        setFilteredCoupon(updatedCoupons);
        setTotalPages(Math.ceil(updatedCoupons.length / itemsPerPage));
      } else {
        throw new Error("Failed to delete");
      }
      NotificationManager.removeAll();
      NotificationManager.success('Coupon deleted successfully', 'Success');
    } catch (error) {
      console.error("Error deleting coupon:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Failed to delete coupon", "Error", 3000);
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-coupon", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Coupon", id, currentStatus, setFilteredCoupon, filteredCoupon, field);
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      NotificationManager.removeAll();
      NotificationManager.error("Failed to update coupon status", "Error", 3000);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(
      imageUrl && imageUrl.trim() !== ""
        ? imageUrl.replace(/"/g, "")
        : "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
    );
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Coupon"
      className="w-10 h-10 object-cover rounded-full cursor-pointer"
      onError={(e) =>
        (e.target.src =
          "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
      }
      onClick={() => openImageModal(img)}
      height={50}
      width={50}
      loading="lazy"
    />
  );

  const renderStatus = (status, id, rawStartDate, rawEndDate) => {
    let statusLabel = status === 1 ? "Published" : "Unpublished";
    const now = new Date();
    const isStartDateFuture = rawStartDate && rawStartDate > now;
    const isEndDatePassed = rawEndDate && rawEndDate <= now;
    const isToggleDisabled = (isStartDateFuture || isEndDatePassed) && status === 0;

    return (
      <div className="flex items-center">
        <FontAwesomeIcon
          className={`h-7 w-16 ${isToggleDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
          icon={status === 1 ? faToggleOn : faToggleOff}
          onClick={isToggleDisabled ? null : () => handleToggleChange(id, status, "status")}
        />
        <span className="ml-2 text-sm">{statusLabel}</span>
      </div>
    );
  };

  const columns = [
    "S.No.",
    "Image",
    "Title",
    "Subtitle",
    "Code",
    "Start Date",
    "End Date",
    "Min Amount",
    "Discount",
    "Status",
  ];

  const fields = [
    "index",
    "image",
    "coupon_title",
    "subtitle",
    "coupon_code",
    "display_start_date",
    "display_end_date",
    "min_amt",
    "coupon_val",
    "status",
  ];

  const tableData = filteredCoupon
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((coupon, index) => ({
      id: coupon.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(coupon.coupon_img?.replace(/"/g, "")),
      coupon_title: coupon.coupon_title || "N/A",
      subtitle: coupon.subtitle || "N/A",
      coupon_code: coupon.coupon_code || "N/A",
      display_start_date: coupon.display_start_date || "N/A",
      display_end_date: coupon.display_end_date || "N/A",
      min_amt: coupon.min_amt || "N/A",
      coupon_val: coupon.coupon_val || "N/A",
      status: renderStatus(coupon.status, coupon.id, coupon.raw_start_date, coupon.raw_end_date),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="Coupon Management" />
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
          totalItems={filteredCoupon.length}
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
          aria-label="Enlarged Coupon Image"
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
              alt="Enlarged Coupon"
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

export default CouponList;