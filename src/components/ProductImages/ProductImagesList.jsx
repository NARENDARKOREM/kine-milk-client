import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";
import Swal from "sweetalert2";

const ProductImagesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [filteredImages, setFilteredImages] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProductImages = async () => {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/product-images/all");
        const imageData = response.data || [];
        console.log("Fetched product images:", imageData);
        setAllImages(imageData);
        setFilteredImages(imageData);
        setTotalPages(Math.ceil(imageData.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching product images:", error);
        NotificationManager.error("Failed to fetch product images", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    };
    fetchProductImages();
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
  const filteredData = allImages.filter((image) => {
    const productName = image.product?.title?.toLowerCase() || "";
    return productName.includes(querySearch);
  });
  setFilteredImages(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const sortData = (key) => {
    handleSort(filteredImages, key, sortConfig, setSortConfig, setFilteredImages);
  };

  const handleEdit = (id) => {
    navigate(`/admin/add-product-images`, { state: { image_id: id } });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this product image? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting Image ID:", id);
      const response = await api.delete(`/product-images/delete/${id}`);
      if (response.status === 200) {
        const updatedImages = filteredImages.filter((image) => image.id !== id);
        setAllImages(updatedImages);
        setFilteredImages(updatedImages);
        setTotalPages(Math.ceil(updatedImages.length / itemsPerPage));
        NotificationManager.success("Image deleted successfully!", "Success", 3000);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      NotificationManager.error("Failed to delete image.", "Error", 3000);
    }
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("productImage", id, currentStatus, setFilteredImages, filteredImages, field);
      NotificationManager.success("Status updated successfully!", "Success", 3000);
    } catch (error) {
      console.error("Error toggling image status:", error);
      NotificationManager.error("Failed to update status", "Error", 3000);
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

  const renderImage = (img) => (
    <div className="flex space-x-2">
      {Array.isArray(img) && img.length > 0 ? (
        img.slice(0, 3).map((imgUrl, imgIndex) => (
          <img
            key={imgIndex}
            src={imgUrl}
            alt="Product Image"
            className="w-10 h-10 rounded object-cover cursor-pointer"
            onError={(e) =>
              (e.target.src =
                "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
            }
            onClick={() => openImageModal(imgUrl)}
            height={50}
            width={50}
            loading="lazy"
          />
        ))
      ) : (
        <p className="text-gray-500">No images available</p>
      )}
    </div>
  );

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = ["S.No.", "Image", "Product Name", "Status"];

  const fields = ["index", "image", "product_name", "status"];

  const tableData = filteredImages
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((image, index) => ({
      id: image.id,
      index: (page - 1) * itemsPerPage + index + 1,
      image: renderImage(image.img),
      product_name: image.product?.title || "N/A",
      status: renderStatus(image.status, image.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="Product Images Management" />
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
          totalItems={filteredImages.length}
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
          aria-label="Enlarged Product Image"
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
              alt="Enlarged Product Image"
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

export default ProductImagesList;