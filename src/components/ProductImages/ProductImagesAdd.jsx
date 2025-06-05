import React, { useEffect, useState, useRef } from "react";
import Header from "../../common/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { NotificationManager, NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import SimpleHeader from "../../common/SimpleHeader";
import MilkLoader from "../../utils/MilkLoader";

const ProductImagesAdd = () => {
const {
  register,
  handleSubmit,
  setValue,
  getValues,
  watch,
  trigger,
  formState: { errors },
} = useForm({
  defaultValues: {
    pid: "",
    status: "0",
    images: [],
  },
  mode: "onChange",
});


  const location = useLocation();
  const navigate = useNavigate();
  const { image_id } = location.state || {};
  const [product, setProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState([]); // Unified state for all images (new and existing)
  const [imagePreviews, setImagePreviews] = useState([]); // Previews for display
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Watch the current values of pid and status
  const pid = watch("pid");
  const status = watch("status");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get("/product/all");
        setProduct(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        NotificationManager.error("Failed to fetch products", "Error", 3000);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/category/all");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        NotificationManager.error("Failed to fetch categories", "Error", 3000);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
useEffect(() => {
  register("images", {
    validate: (value) => {
      if (!value || value.length === 0) return "At least one image is required";
      return true;
    },
  });
}, [register]);
  useEffect(() => {
    if (image_id) {
      const fetchbyProductimageId = async () => {
        try {
          const response = await api.get(`/product-images/getbyid/${image_id}`);
          const fetchData = response.data;

          setValue("pid", fetchData?.product_id || "");
          setValue("status", fetchData?.status?.toString() || "0");

          if (fetchData?.category_id) {
            setSelectedCategory(fetchData.category_id);
            const filtered = product.filter((prod) => prod.cat_id === fetchData.category_id) || [];
            setFilteredProducts(filtered);
          }

          let imageUrls = fetchData.img || [];
          if (typeof imageUrls === "string") {
            try {
              imageUrls = JSON.parse(imageUrls.replace(/'/g, '"'));
            } catch (e) {
              console.error("Error parsing img string:", e);
              imageUrls = [imageUrls];
            }
          }

          const validImages = imageUrls
            .filter((url) => url && typeof url === "string" && url.trim() !== "")
            .map((url) => ({ url: url.replace(/"/g, ""), isExisting: true }));

          setImages(validImages);
          setImagePreviews(validImages.map((img) => img.url));
          setValue("images", validImages);
        } catch (error) {
          console.error("Error fetching product images:", error);
          NotificationManager.error("Failed to load product images", "Error", 3000);
        }
      };
      fetchbyProductimageId();
    }
  }, [image_id, setValue, product]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = product.filter((prod) => prod.cat_id === selectedCategory);
      setFilteredProducts(filtered);
      if (!filtered.some((prod) => prod.id === pid)) {
        setValue("pid", "");
      }
    } else {
      setFilteredProducts(product);
    }
  }, [selectedCategory, product, pid, setValue]);

 const handleChange = (e) => {
  const { files } = e.target;
  if (files.length === 0) return;

  const filesArray = Array.from(files);
  const validFiles = [];
  const invalidFiles = [];

  filesArray.forEach((file) => {
    if (file.size > 1 * 1024 * 1024) {
      invalidFiles.push(file.name);
    } else {
      validFiles.push(file);
    }
  });

  if (invalidFiles.length > 0) {
    NotificationManager.error("Each image must be 1MB or less", "Error", 3000);
    fileInputRef.current.value = "";
    return;
  }

  if (validFiles.length > 0) {
    const newImages = validFiles.map((file) => ({
      file,
      isExisting: false,
      url: URL.createObjectURL(file),
    }));
    const updatedImages = [...images, ...newImages];

    setImages(updatedImages);
    setImagePreviews(updatedImages.map((img) => img.url));

    setValue("images", updatedImages, { shouldValidate: true }); // Important!
    trigger("images"); // Manually trigger validation
    fileInputRef.current.value = "";
  }
};

  const handleSelectChange = (name) => (selectedOption) => {
    if (name === "cat_id") {
      setSelectedCategory(selectedOption?.value || "");
    } else if (name === "pid") {
      setValue("pid", selectedOption?.value || "", { shouldValidate: true });
    } else if (name === "status") {
      setValue("status", selectedOption?.value || "", { shouldValidate: true });
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    setImagePreviews(updatedImages.map((img) => img.url));
    setValue("images", updatedImages);
    if (updatedImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("onSubmit - images:", images, "data:", data);

    try {
      if (!data.pid) {
        NotificationManager.error("Product is required", "Error", 3000);
        setIsSubmitting(false);
        return;
      }

      const form = new FormData();
      if (image_id) {
        form.append("id", image_id);
      }
      form.append("product_id", data.pid);
      form.append("status", data.status);

      const existingImageUrls = images
        .filter((img) => img.isExisting)
        .map((img) => img.url);
      if (existingImageUrls.length > 0) {
        form.append("existing_images", JSON.stringify(existingImageUrls));
      }

      const newFiles = images.filter((img) => !img.isExisting).map((img) => img.file);
      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          form.append("img", file);
        });
      }

      const response = await api.post("/product-images/imgupsert", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      NotificationManager.success(
        image_id ? "Product image updated successfully" : "Product image added successfully",
        "Success",
        3000
      );
      setTimeout(() => {
        navigate("/admin/product-images-list");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.error ||
        (image_id ? "Failed to update product image" : "Failed to add product image");
      NotificationManager.error(errorMessage, "Error", 3000);
      if (
        error.response?.status === 400 &&
        errorMessage === "Image size must be 1MB or less"
      ) {
        setImages(images.filter((img) => img.isExisting));
        setImagePreviews(images.filter((img) => img.isExisting).map((img) => img.url));
        setValue("images", images.filter((img) => img.isExisting));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: isFocused ? "2px solid #393185" : "1px solid #B0B0B0",
      boxShadow: "none",
      borderRadius: "5px",
      padding: "0px",
      fontSize: "12px",
      height: "42px",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": {
        border: "2px solid #393185",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 10001,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 10001,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#B0B0B0" : isFocused ? "#393185" : "white",
      color: isSelected ? "white" : isFocused ? "white" : "#757575",
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      fontWeight: "600",
      color: "#393185",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#393185",
      fontSize: "12px",
    }),
  };

  const productOptions = [
    ...(Array.isArray(filteredProducts) && filteredProducts.length > 0
      ? filteredProducts.map((prod) => ({
          value: prod.id,
          label: prod.title,
        }))
      : []),
  ];

  const categoryOptions = [
    ...(Array.isArray(categories) && categories.length > 0
      ? categories.map((cat) => ({
          value: cat.id,
          label: cat.title,
        }))
      : []),
  ];

  const statusOptions = [
    { value: "1", label: "Publish" },
    { value: "0", label: "Unpublish" },
  ];

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <SimpleHeader name="Product Images Management" />
          <div className="container p-6">
            {isSubmitting ? (
              <div className="flex justify-center items-center h-64 w-full">
                <MilkLoader />
              </div>
            ) : (
              <div className="bg-white rounded-xl border w-[76vw] border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-2 mt-6">
                    <div className="flex flex-col">
                      <label
                        htmlFor="cat_id"
                        className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                      >
                        Select Category <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={categoryOptions.find((option) => option.value === selectedCategory)}
                        onChange={handleSelectChange("cat_id")}
                        options={categoryOptions}
                        styles={customStyles}
                        placeholder={
                          categoryOptions.length > 0 ? "Select Category" : "No Categories available"
                        }
                        isSearchable={false}
                        components={{
                          DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                          IndicatorSeparator: () => null,
                        }}
                      />
                      {errors.cat_id && (
                        <span className="text-red-500 text-xs">{errors.cat_id.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="pid"
                        className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                      >
                        Select Product <span className="text-red-500">*</span>
                      </label>
                      <Select
                        {...register("pid", { required: "Product is required" })}
                        value={productOptions.find((option) => option.value === pid)}
                        onChange={handleSelectChange("pid")}
                        options={productOptions}
                        styles={customStyles}
                        placeholder={
                          selectedCategory && productOptions.length > 0
                            ? "Select Product"
                            : selectedCategory
                            ? "No Products available"
                            : "Select a category first"
                        }
                        isSearchable={false}
                        isDisabled={selectedCategory === ""}
                        components={{
                          DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                          IndicatorSeparator: () => null,
                        }}
                      />
                      {errors.pid && (
                        <span className="text-red-500 text-xs">{errors.pid.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-2 mt-6">
                    <div>
                      <label className="block text-left">
                        Image <span className="text-red-500">*</span>
                      </label>
                      <input
  type="file"
  multiple
  onChange={handleChange}
  name="images"
  className="border p-2 rounded w-full"
  accept="image/*"
  ref={fileInputRef}
/>
{errors.images && (
  <span className="text-red-500 text-xs">{errors.images.message}</span>
)}
                      <div className="flex flex-wrap mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative m-2">
                            <img
                              src={preview}
                              alt={`Product Image ${index + 1}`}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-0 right-0 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label
                        className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                      >
                        Status <span className="text-red-500">*</span>
                      </label>
                      <Select
                        {...register("status", { required: "Status is required" })}
                        value={statusOptions.find((option) => option.value === status)}
                        onChange={handleSelectChange("status")}
                        options={statusOptions}
                        styles={customStyles}
                        placeholder="Select Status"
                        isSearchable={false}
                        components={{
                          DropdownIndicator: () => <AiOutlineDown className="w-4 h-4 mr-2" />,
                          IndicatorSeparator: null,
                        }}
                      />
                      {errors.status && (
                        <span className="text-red-500 text-xs">{errors.status.message}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`mt-6 bg-[#393185] text-white py-2 px-4 rounded flex items-center justify-center ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : null}
                    {isSubmitting ? "Submitting..." : image_id ? "Update Image" : "Add Image"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default ProductImagesAdd;