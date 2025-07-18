import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { FaTimes } from "react-icons/fa";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../common/Header";
import InnerHeader from "../Product/ProductHeader";
import ProductInventoryTable from "../Store/ProductInventory/ProductInventoryTable";
import api from "../utils/api";
import { handleSort } from "../utils/sorting";
import { StatusEntity } from "../utils/StatusEntity";
import { DeleteEntity } from "../utils/DeleteEntity";
import { ReactComponent as Edit } from "../assets/images/Edit.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/Delete.svg"; // ✅ renamed


const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
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
    async function fetchProduct() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/product/all");
        console.log("Fetched product:", response.data);
        const normalizedData = (response.data || []).map((product) => ({
          ...product,
          weightOptions: Array.isArray(product.weightOptions)
            ? product.weightOptions
            : [],
        }));
        setProduct(normalizedData);
        setFilteredProduct(normalizedData);
        setTotalPages(Math.ceil(normalizedData.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching product:", error);
        NotificationManager.error("Error fetching products", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchProduct();
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
  const filteredData = product.filter((item) => {
    const title = String(item.title || "").toLowerCase();
    const discount = String(item.discount || "").toLowerCase();
    const outOfStock = item.out_of_stock ? "yes" : "no";

    const mrp_price =
      Array.isArray(item.weightOptions) && item.weightOptions.length > 0
        ? String(item.weightOptions[0].mrp_price || "").toLowerCase()
        : "";

    const normal_price =
      Array.isArray(item.weightOptions) && item.weightOptions.length > 0
        ? String(item.weightOptions[0].normal_price || "").toLowerCase()
        : "";

    return (
      title.includes(querySearch) ||
      discount.includes(querySearch) ||
      mrp_price.includes(querySearch) ||
      normal_price.includes(querySearch) ||
      outOfStock.includes(querySearch)
    );
  });

  setFilteredProduct(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const sortData = (key) => {
    handleSort(filteredProduct, key, sortConfig, setSortConfig, setFilteredProduct);
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("Product", id);
    if (success) {
      const updatedProduct = product.filter((p) => p.id !== id);
      setProduct(updatedProduct);
      setFilteredProduct(updatedProduct);
      setTotalPages(Math.ceil(updatedProduct.length / itemsPerPage));
      // NotificationManager.success("Product deleted successfully", "Success");
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-product", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Product", id, currentStatus, setFilteredProduct, filteredProduct, field);
      // NotificationManager.success("Product status updated successfully", "Success");
    } catch (error) {
      console.error("Error toggling product status:", error);
      NotificationManager.error("Error updating product status", "Error");
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(
      imageUrl && imageUrl.trim() !== ""
        ? imageUrl
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
      alt="Product"
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

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = [
    "S.No.",
    "Product Name",
    "Product Image",
    
    "Discount",
    "MRP Price",
    "Instant Price",
    "Out of Stock",
    "Status",
  ];

  const fields = [
    "index",
    "title",
    "image",
    
    "discount",
    "mrp_price",
    "normal_price",
    "out_of_stock",
    "status",
  ];

  const tableData = filteredProduct
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((product, index) => ({
      id: product.id,
      index: (page - 1) * itemsPerPage + index + 1,
      title: product.title || "N/A",
      image: renderImage(product.img),
      status: renderStatus(product.status, product.id),
      discount: product.discount || "N/A",
      mrp_price:
        Array.isArray(product.weightOptions) && product.weightOptions.length > 0
          ? product.weightOptions[0].mrp_price || "N/A"
          : "N/A",
      normal_price:
        Array.isArray(product.weightOptions) && product.weightOptions.length > 0
          ? product.weightOptions[0].normal_price || "N/A"
          : "N/A",
      out_of_stock: product.out_of_stock ? "Yes" : "No",
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="Product List" />
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
          totalItems={filteredProduct.length}
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
              alt="Enlarged Product"
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

export default ProductList;