import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../common/Header";
import InnerHeader from "../../components/Coupon/CouponHeader";
import ProductInventoryTable from "./ProductInventoryTable";
import api from "../../utils/api";
import { StatusEntity } from "../../utils/StatusEntity";
import { DeleteEntity } from "../../utils/DeleteEntity";
import Cookies from "js-cookie";

const ProductInventoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const storeId = Cookies.get("store_id");
        const response = await api.get("/productinventory/getallproductinv", {
          params: { store_id: storeId },
        });
        console.log(response, "rrrrrrrrrrrrrrrrrrrr");
        setProducts(response.data);
        setFilteredProducts(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching products:", error);
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

  const filteredData = products.filter((item) => {
    const title = item.inventoryProducts?.title || "";
    
    const totalQuantity = item.storeWeightOptions?.reduce(
      (sum, option) => sum + (option.quantity || 0),
      0
    );

    const totalSubscriptionQuantity = item.storeWeightOptions?.reduce(
      (sum, option) => sum + (option.subscription_quantity || 0),
      0
    );

    const couponTitle = item.coupons?.map((coupon) => coupon.coupon_title).join(", ") || "";
    const couponValue = item.coupons?.map((coupon) => coupon.coupon_value).join(", ") || "";

    return (
      title.toLowerCase().includes(querySearch) ||
      String(totalQuantity).toLowerCase().includes(querySearch) ||
      String(totalSubscriptionQuantity).toLowerCase().includes(querySearch) ||
      couponTitle.toLowerCase().includes(querySearch) ||
      couponValue.toLowerCase().includes(querySearch)
    );
  });

  setFilteredProducts(filteredData);
  setPage(1);
  setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
};


  const handleDelete = async (id) => {
    const success = await DeleteEntity("product_Inventory", id);
    if (success) {
      const updatedProducts = products.filter((productItem) => productItem.id !== id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setTotalPages(Math.ceil(updatedProducts.length / itemsPerPage));
    }
  };

  const handleEdit = (id) => {
    navigate("/store/add-productinv", { state: { id } });
  };

  const handleInventoryClick = (product_inventory_id) => {
    navigate(`/inventory/${product_inventory_id}`);
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity(
        "product-Inventory",
        id,
        currentStatus,
        setFilteredProducts,
        filteredProducts,
        field
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
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
      onClick={() => handleImageClick(img)}
      height={50}
      width={50}
      loading="lazy"
    />
  );

  const renderInventoryButton = (product_inventory_id) => (
    <div
      className="flex items-center bg-[#bcb9da] justify-center py-2 px-7 rounded-[10px] cursor-pointer text-[#393185] text-[12px] font-medium"
      onClick={() => handleInventoryClick(product_inventory_id)}
    >
      Inventory
    </div>
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
    "Product Image",
    "Product Title",
    "Instant Quantity",
    "Subscription Quantity",
    "Coupon Title",
    "Coupon Value",
    { label: "Inventory", style: { textAlign: "center" } },
    "Status",
  ];

  const fields = [
    "index",
    "image",
    "title",
    "quantity",
    "subscription_quantity",
    "coupon_title",
    "coupon_value",
    "inventory",
    "status",
  ];

  const tableData = filteredProducts
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((product, index) => {
      // Calculate total quantity and subscription quantity from storeWeightOptions
      const totalQuantity = product.storeWeightOptions.reduce(
        (sum, option) => sum + (option.quantity || 0),
        0
      );
      const totalSubscriptionQuantity = product.storeWeightOptions.reduce(
        (sum, option) => sum + (option.subscription_quantity || 0),
        0
      );

      return {
        id: product.id,
        index: (page - 1) * itemsPerPage + index + 1,
        image: renderImage(product.inventoryProducts?.img),
        title: product.inventoryProducts?.title || "N/A",
        quantity: totalQuantity,
        subscription_quantity: totalSubscriptionQuantity,
        inventory: renderInventoryButton(product.id),
        coupon_title:
          product.coupons?.length > 0
            ? product.coupons.map((coupon) => coupon.coupon_title).join(", ")
            : "N/A",
        coupon_value:
          product.coupons?.length > 0
            ? product.coupons.map((coupon) => coupon.coupon_value).join(", ")
            : "N/A",
        status: renderStatus(product.status, product.id),
      };
    });

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Product Inventory List"} />
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
          handleInventoryClick={handleInventoryClick}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
        />
        <NotificationContainer />
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-label="Enlarged Product Image"
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

export default ProductInventoryList;