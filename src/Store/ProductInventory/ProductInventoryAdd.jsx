import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import Header from "../../common/Header";
import api from "../../utils/api";
import SimpleHeader from "../../common/SimpleHeader";
import { AiOutlineDown } from "react-icons/ai";
import Swal from "sweetalert2";

const ProductInventoryAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: { category_id: "", product_id: "", date: "" },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [storeId, setStoreId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [formData, setFormData] = useState({
    store_id: "",
    category_id: "",
    product_id: "",
    date: "",
    coupons: [],
  });

  // Fetch store ID from cookies
  useEffect(() => {
    const id = Cookies.get("store_id");
    if (!id) {
      console.error("No store_id found in cookies");
      NotificationManager.error("Store ID is missing.");
      return;
    }
    setStoreId(id);
    setFormData((prev) => ({ ...prev, store_id: id }));
  }, []);

  // Fetch categories, products, and inventory details
  useEffect(() => {
    if (!storeId) return;

    async function fetchData() {
      try {
        const response = await api.get(`/productinventory/getproductbystore/${storeId}`);
        const fetchedCategories = response.data.categories || [];
        setCategories(fetchedCategories);

        const fetchedProducts = fetchedCategories.flatMap((category) => category.products || []);
        setProducts(fetchedProducts);

        if (id) {
          const invResponse = await api.get(`/productinventory/getproductinv/${id}`);
          const fetchedData = invResponse.data;

          const product = fetchedProducts.find((p) => p.id === fetchedData.product_id);
          const category = fetchedCategories.find((cat) =>
            cat.products.some((p) => p.id === fetchedData.product_id)
          );

          setFormData({
            store_id: storeId,
            category_id: fetchedData.product?.category?.id || category?.id || "",
            product_id: fetchedData.product_id || "",
            date: fetchedData.date,
            coupons: fetchedData.coupons || [],
          });

          setValue("category_id", fetchedData.product?.category?.id || category?.id || "");
          setValue("product_id", fetchedData.product_id);
          setValue("date", fetchedData.date);

          setSelectedCategory(category || null);

          if (fetchedData.coupons && fetchedData.coupons.length > 0) {
            const selectedCouponOptions = fetchedData.coupons.map((coupon) => ({
              value: coupon.id,
              label: coupon.coupon_title,
            }));
            setSelectedCoupons(selectedCouponOptions);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        NotificationManager.error(
          error.response?.status === 500
            ? "Server error: Failed to fetch data. Please try again later."
            : "Failed to fetch data."
        );
      }
    }

    fetchData();
  }, [storeId, id, setValue]);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/coupon/all");
        const formattedCoupons = response.data.map((coupon) => ({
          value: coupon.id,
          label: coupon.coupon_title,
        }));
        setCoupons(formattedCoupons);
      } catch (error) {
        NotificationManager.error("Failed to fetch coupons");
      }
    };
    fetchCoupons();
  }, []);

  // Handle category selection
  const handleCategoryChange = async (selectedOption) => {
    const categoryId = selectedOption ? selectedOption.value : "";
    const category = categories.find((cat) => cat.id === categoryId);
    setSelectedCategory(category);
    setFormData((prevData) => ({
      ...prevData,
      category_id: categoryId,
      product_id: "",
    }));

    setValue("category_id", categoryId, { shouldValidate: true });
    setValue("product_id", "");
    await trigger("category_id");
  };

  // Handle product selection
  const handleProductChange = async (selectedOption) => {
    const productId = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({
      ...prevData,
      product_id: productId,
    }));

    setValue("product_id", productId, { shouldValidate: true });
    await trigger("product_id");
  };

  // Form submission
  const onSubmit = async (data) => {
    if (!formData.category_id) {
      NotificationManager.removeAll();
      NotificationManager.error("Please select a category.");
      return;
    }
    if (!formData.product_id) {
      NotificationManager.removeAll();
      NotificationManager.error("Please select a product.");
      return;
    }

    try {
      const payload = {
        product_id: data.product_id,
        category_id: data.category_id,
        date: data.date || new Date().toISOString().split("T")[0],
        store_id: storeId,
        coupons: selectedCoupons.map((coupon) => coupon.value),
      };

      if (id) payload.id = id;

      const response = await api.post(
        "/productinventory/upsert-productinv",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      NotificationManager.removeAll();
      NotificationManager.success(
        id
          ? "Product Inventory updated successfully!"
          : "Product Inventory added successfully!"
      );

      setTimeout(() => navigate("/store/productinv-list"), 2000);
    } catch (error) {
      console.error("Error during submission:", error);

      if (error.response && error.response.status === 409) {
        Swal.fire({
          title: "Product Already Exists",
          text: "This product is already added. Would you like to go to the product list to modify it?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#393185",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go to Product List",
          cancelButtonText: "Dismiss",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/store/productinv-list");
          }
        });
      } else {
        NotificationManager.removeAll();
        NotificationManager.error(
          id
            ? "Failed to update Product Inventory."
            : "Failed to add Product Inventory."
        );
      }
    }
  };

  // Custom styles for Select components
  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: `${isFocused ? "2px solid #393185" : "1px solid #B0B0B0"}`,
      boxShadow: isFocused ? "none" : "none",
      borderRadius: "5px",
      padding: "0px",
      fontSize: "12px",
      height: "42px",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { border: "2px solid #393185" },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#393185" : isSelected ? "#393185" : "white",
      color: isFocused || isSelected ? "white" : "#757575",
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      fontWeight: "600",
      color: "#393185",
    }),
    placeholder: (base) => ({ ...base, color: "#393185", fontSize: "12px" }),
  };

  // Category options for dropdown
  const categoryOptions = [
    { value: "", label: "Select Category", isDisabled: true },
    ...(Array.isArray(categories) && categories.length > 0
      ? categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))
      : []),
  ];

  // Product options filtered by selected category
  const productOptions = [
    { value: "", label: "Select Product", isDisabled: true },
    ...(selectedCategory && Array.isArray(selectedCategory.products)
      ? selectedCategory.products.map((product) => ({
          value: product.id,
          label: product.title,
        }))
      : []),
  ];

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <div className="container">
            <SimpleHeader name={"Product Inventory Management"} />
            <div className="h-full px-3 max-w-5xl">
              <div className="bg-white rounded-xl border py-4 px-6 h-[68vh] w-[79vw] overflow-scroll scrollbar-none">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-1 gap-6"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-left">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={categoryOptions.find(
                          (option) => option.value === formData.category_id
                        )}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        styles={customStyles}
                        placeholder="Select Category"
                        isSearchable={false}
                        components={{
                          DropdownIndicator: () => (
                            <AiOutlineDown className="w-4 h-4" />
                          ),
                          IndicatorSeparator: () => null,
                        }}
                      />
                      {errors.category_id && (
                        <p className="text-red-500 text-sm">
                          {errors.category_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-left">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={productOptions.find(
                          (option) => option.value === formData.product_id
                        )}
                        onChange={handleProductChange}
                        options={productOptions}
                        styles={customStyles}
                        placeholder="Select Product"
                        isSearchable={false}
                        isDisabled={!selectedCategory}
                        components={{
                          DropdownIndicator: () => (
                            <AiOutlineDown className="w-4 h-4" />
                          ),
                          IndicatorSeparator: () => null,
                        }}
                      />
                      {errors.product_id && (
                        <p className="text-red-500 text-sm">
                          {errors.product_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-1">
                    <div className="relative">
                      <label className="text-sm font-medium block text-left text-gray-700 mb-1">
                        Select Coupons
                      </label>
                      <Select
                        isMulti
                        options={coupons}
                        value={selectedCoupons}
                        onChange={(selectedOptions) =>
                          setSelectedCoupons(selectedOptions || [])
                        }
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.375rem",
                            boxShadow: "none",
                            "&:hover": { borderColor: "#cbd5e0" },
                          }),
                          menu: (provided) => ({
                            ...provided,
                            borderRadius: "0.375rem",
                            border: "1px solid #e2e8f0",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? "#393185"
                              : "white",
                            color: state.isFocused ? "white" : "#2d3748",
                            "&:hover": {
                              backgroundColor: "#393185",
                              color: "white",
                            },
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: "#393185",
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            color: "white",
                          }),
                          multiValueRemove: (provided) => ({
                            ...provided,
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#2d3748",
                              color: "white",
                            },
                          }),
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 bg-[#393185] w-[13vw] text-white py-2 px-4 rounded self-start"
                  >
                    {id ? "Update Inventory" : "Add Inventory"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default ProductInventoryAdd;