import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { useForm, Controller } from "react-hook-form";
import api from "../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import { FaArrowLeft, FaPen, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";
import MilkLoader from "../utils/MilkLoader";
import JoditEditor from "jodit-react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const ProductAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      out_of_stock: 0,
      quantity: "",
      cat_id: "",
      subscription_required: "",
      status: 0,
      description: "",
      discount: "",
      img: null,
      package_type: "",
      batch_number: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    weightOptions: [],
    out_of_stock: 0,
    quantity: "",
    img: null,
    existingImg: null,
    cat_id: "",
    subscription_required: "",
    status: 0,
    description: "",
    discount: "",
    package_type: "",
    batch_number: "",
  });
  const [newWeightOption, setNewWeightOption] = useState({
    weight: "",
    subscribe_price: "",
    normal_price: "",
    mrp_price: "",
  });
  const [editingRow, setEditingRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [storeId, setStoreId] = useState("");
  const admin_id = Cookies.get("admin_id") || "";
  const editor = useRef(null);

  const packageTypeOptions = [
    { value: "tetra_pack", label: "Tetra Pack" },
    { value: "bottle", label: "Bottle" },
    { value: "pouch", label: "Pouch" },
    { value: "box", label: "Box" },
  ];

  useEffect(() => {
    if (id) {
      const fetchProductById = async () => {
        setIsLoading(true);
        setShowLoader(true);
        try {
          const response = await api.get(`/product/getbyid/${id}`);
          const fetchedData = response.data.data;
          const discountValue =
            fetchedData.discount !== null && fetchedData.discount !== undefined
              ? fetchedData.discount
              : "";
          setFormData({
            ...fetchedData,
            weightOptions: fetchedData.weightOptions || [],
            img: null,
            existingImg: fetchedData.img,
            discount: discountValue,
            package_type: fetchedData.package_type || "",
            batch_number: fetchedData.batch_number || "",
          });
          Object.entries(fetchedData).forEach(([key, value]) => {
            if (key !== "weightOptions" && key !== "img") {
              setValue(key, value === null || value === undefined ? "" : value);
            }
          });
        } catch (error) {
          NotificationManager.error("Failed to load Product details.");
        } finally {
          setIsLoading(false);
          setTimeout(() => setShowLoader(false), 2000);
        }
      };
      fetchProductById();
    }
  }, [id, setValue]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/category/all");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchUnits() {
      setIsUnitsLoading(true);
      try {
        const response = await api.get("/units/all");
        setUnits(response.data.units || []);
      } catch (error) {
        console.error("Error fetching units:", error);
        NotificationManager.error("Failed to fetch units");
      } finally {
        setIsUnitsLoading(false);
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    setStoreId(Cookies.get("store_id"));
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "img" && files && files.length > 0) {
      const file = files[0];
      console.log("Selected image:", file.name, file.size, file.type);
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("img", {
          type: "manual",
          message: "Only JPEG, PNG, GIF, or WebP images are allowed",
        });
        e.target.value = "";
        setValue("img", null);
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        setError("img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setValue("img", null);
        return;
      }
      clearErrors("img");
      setFormData((prevData) => ({ ...prevData, img: file }));
      setValue("img", files, { shouldValidate: true });
      await trigger("img");
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setValue(name, value, { shouldValidate: true });
      await trigger(name);
    }
  };

  const handleWeightOptionChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? "" : Math.max(0, parseFloat(value));
    setNewWeightOption((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleEditWeightOptionChange = (index, field, value) => {
    const numericValue =
      field !== "weight" && value !== ""
        ? Math.max(0, parseFloat(value))
        : value;
    setFormData((prevData) => {
      const updatedWeightOptions = [...prevData.weightOptions];
      updatedWeightOptions[index] = {
        ...updatedWeightOptions[index],
        [field]: numericValue,
      };
      return { ...prevData, weightOptions: updatedWeightOptions };
    });
  };

  const addWeightOption = () => {
    if (
      !newWeightOption.weight ||
      !newWeightOption.subscribe_price ||
      !newWeightOption.normal_price ||
      !newWeightOption.mrp_price
    ) {
      setError("weightOptions", {
        type: "manual",
        message: "All weight option fields are required",
      });
      return;
    }
    if (
      newWeightOption.subscribe_price < 0 ||
      newWeightOption.normal_price < 0 ||
      newWeightOption.mrp_price < 0
    ) {
      NotificationManager.error("Price values cannot be negative.");
      return;
    }
    const isDuplicate = formData.weightOptions.some(
      (option) =>
        option.weight.toLowerCase() === newWeightOption.weight.toLowerCase()
    );
    if (isDuplicate) {
      setError("weightOptions", {
        type: "manual",
        message: "This weight option already exists",
      });
      return;
    }
    clearErrors("weightOptions");
    setFormData((prevData) => ({
      ...prevData,
      weightOptions: [...prevData.weightOptions, newWeightOption],
    }));
    setNewWeightOption({
      weight: "",
      subscribe_price: "",
      normal_price: "",
      mrp_price: "",
    });
  };

  const saveEditedWeightOption = (index) => {
    const editedOption = formData.weightOptions[index];
    if (
      !editedOption.weight ||
      !editedOption.subscribe_price ||
      !editedOption.normal_price ||
      !editedOption.mrp_price
    ) {
      setError("weightOptions", {
        type: "manual",
        message: "All weight option fields are required",
      });
      return;
    }
    if (
      editedOption.subscribe_price < 0 ||
      editedOption.normal_price < 0 ||
      editedOption.mrp_price < 0
    ) {
      NotificationManager.error("Price values cannot be negative.");
      return;
    }
    const isDuplicate = formData.weightOptions.some(
      (option, i) =>
        i !== index &&
        option.weight.toLowerCase() === editedOption.weight.toLowerCase()
    );
    if (isDuplicate) {
      setError("weightOptions", {
        type: "manual",
        message: "This weight option already exists",
      });
      return;
    }
    clearErrors("weightOptions");
    setEditingRow(null);
  };

  const deleteWeightOption = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      weightOptions: prevData.weightOptions.filter((_, i) => i !== index),
    }));
  };

  const startEditing = (index) => {
    setEditingRow(index);
  };

  const cancelEditing = () => {
    setEditingRow(null);
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormData((prevData) => ({ ...prevData, [name]: selectedOption.value }));
    setValue(name, selectedOption.value, { shouldValidate: true });
  };

  const handleWeightOptionSelectChange = (selectedOption) => {
    setNewWeightOption((prev) => ({ ...prev, weight: selectedOption.value }));
  };

  const handleEditWeightOptionSelectChange = (index, selectedOption) => {
    handleEditWeightOptionChange(index, "weight", selectedOption.value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("Form data on submit:", data);
    if (formData.weightOptions.length === 0) {
      setError("weightOptions", {
        type: "manual",
        message: "At least one weight option is required",
      });
      return;
    }
    if (!data.img && !formData.existingImg && !id) {
      setError("img", {
        type: "manual",
        message: "Image is required for a new product",
      });
      return;
    }
    if (data.img && data.img.length > 0 && data.img[0].size > 1 * 1024 * 1024) {
      setError("img", {
        type: "manual",
        message: "Image size must be 1MB or less",
      });
      return;
    }

    setShowLoader(true);
    const form = new FormData();
    form.append("title", data.title);
    form.append("weightOptions", JSON.stringify(formData.weightOptions));
    form.append("out_of_stock", data.out_of_stock);
    form.append("quantity", data.quantity || 0);
    form.append("cat_id", data.cat_id);
    form.append("subscription_required", data.subscription_required);
    form.append("status", data.status);
    form.append("description", data.description);
    form.append("discount", data.discount || "");
    form.append("package_type", data.package_type);
    form.append("batch_number", data.batch_number);

    if (data.img && data.img.length > 0) {
      form.append("img", data.img[0], data.img[0].name);
    } else if (id && formData.existingImg) {
      form.append("existingImg", formData.existingImg);
    }

    if (id) form.append("id", id);
    if (storeId) form.append("store_id", storeId);
    if (admin_id) form.append("admin_id", admin_id);

    try {
      const response = await api.post("/product/upsert", form);
      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Product updated successfully!" : "Product added successfully!"
      );
      setTimeout(() => navigate("/admin/product-list"), 2000);
    } catch (error) {
      NotificationManager.removeAll();
      const errorMsg = error.response?.data?.ResponseMsg;
      if (
        error.response?.status === 400 &&
        errorMsg === "Image size must be 1MB or less"
      ) {
        setError("img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        setValue("img", null);
        setFormData((prevData) => ({ ...prevData, img: null }));
      } else if (error.response?.status === 409) {
        NotificationManager.error("Product with this title already exists.");
      } else {
        NotificationManager.error(
          errorMsg ||
            (id ? "Failed to update Product" : "Failed to add Product")
        );
      }
      console.error("Submission error:", error.response?.data || error.message);
    } finally {
      setTimeout(() => setShowLoader(false), 2000);
    }
    setIsSubmitting(false);
  };

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: `${isFocused ? "2px solid #393185" : "1px solid #B0B0B0"}`,
      boxShadow: isFocused ? "none" : "none",
      borderRadius: "5px",
      padding: "2px",
      fontSize: "12px",
      height: "42px",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { border: "2px solid #393185" },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#393185" : isSelected ? "#978fdc" : "white",
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
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const editorConfig = {
    readonly: false,
    height: 300,
    placeholder: "Enter product description...",
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "paragraph",
      "|",
      "left",
      "center",
      "right",
      "|",
      "undo",
      "redo",
    ],
    style: {
      fontSize: "12px",
    },
  };

  const categoryOptions =
    Array.isArray(categories) && categories.length > 0
      ? categories.map((category) => ({
          value: category?.id,
          label: category?.title,
        }))
      : [];

  const yesNoOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];

  const statusOptions = [
    { value: "1", label: "Publish" },
    { value: "0", label: "Unpublish" },
  ];

  const weightOptions =
    Array.isArray(units) && units.length > 0
      ? units.map((unit) => ({
          value: `${unit.name} ${unit.unit}`,
          label: `${unit.name} ${unit.unit}`,
        }))
      : [];

  const isAddButtonDisabled =
    !newWeightOption.weight ||
    !newWeightOption.subscribe_price ||
    !newWeightOption.normal_price ||
    !newWeightOption.mrp_price;

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <div className="container">
            <div className="flex items-center mt-6 mb-4">
              <Link
                onClick={() => navigate(-1)}
                className="cursor-pointer ml-6"
              >
                <ArrowBackIosNewIcon className="text-[#393185]" />
              </Link>
              <h2 className="text-lg font-semibold ml-4 text-[#393185]">
                Product Management
              </h2>
            </div>
            <div className="h-full px-6 max-w-5xl">

                <div className="bg-white rounded-xl border max-h-[70vh] w-[76vw] py-4 px-6 overflow-scroll scrollbar-none">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 gap-6"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-left">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={categoryOptions.find(
                            (option) => option.value === formData.cat_id
                          )}
                          onChange={handleSelectChange("cat_id")}
                          options={categoryOptions}
                          styles={customStyles}
                          placeholder={
                            categoryOptions.length > 0
                              ? "Select Category"
                              : "No categories available"
                          }
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                        {errors.cat_id && (
                          <p className="text-red-500 text-sm">
                            {errors.cat_id.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-left">
                          Image <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          onChange={handleChange}
                          name="img"
                          className="border p-2 rounded w-full"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          {...register("img", {
                            required:
                              !id && !formData.existingImg
                                ? "Image is required"
                                : false,
                          })}
                        />
                        {errors.img && (
                          <p className="text-red-500 text-sm">
                            {errors.img.message}
                          </p>
                        )}
                        {(formData.img || formData.existingImg) && (
                          <img
                            src={
                              formData.img
                                ? URL.createObjectURL(formData.img)
                                : formData.existingImg
                            }
                            alt="Product"
                            className="mt-2 h-16"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-left">
                          Product Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("title", {
                            required: "Product title is required",
                          })}
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Product Title"
                          className="border p-2 rounded w-full"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm">
                            {errors.title.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-left">
                          Weight Option <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={weightOptions.find(
                            (option) => option.value === newWeightOption.weight
                          )}
                          onChange={handleWeightOptionSelectChange}
                          options={weightOptions}
                          styles={customStyles}
                          placeholder={
                            isUnitsLoading
                              ? "Loading weights..."
                              : weightOptions.length > 0
                              ? "Select Weight"
                              : "No weight options available"
                          }
                          isSearchable={false}
                          isDisabled={isUnitsLoading}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                      </div>
                    </div>

                    {newWeightOption.weight && (
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-left">
                            Subscription Price{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="subscribe_price"
                            value={newWeightOption.subscribe_price}
                            onChange={handleWeightOptionChange}
                            placeholder="Subscription Price"
                            className="border p-2 rounded w-full"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-left">
                            Instant Price{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="normal_price"
                            value={newWeightOption.normal_price}
                            onChange={handleWeightOptionChange}
                            placeholder="Normal Price"
                            className="border p-2 rounded w-full"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-left">
                            MRP Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="mrp_price"
                            value={newWeightOption.mrp_price}
                            onChange={handleWeightOptionChange}
                            placeholder="MRP Price"
                            className="border p-2 rounded w-full"
                            min="0"
                            required
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            onClick={addWeightOption}
                            className={`bg-[#393185] text-white py-2 px-4 rounded ${
                              isAddButtonDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isAddButtonDisabled}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.weightOptions.length > 0 && (
                      <div>
                        {errors.weightOptions && (
                          <p className="text-red-500 text-sm">
                            {errors.weightOptions.message}
                          </p>
                        )}
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            {formData.weightOptions.map((option, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {editingRow === index ? (
                                  <>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <Select
                                        value={weightOptions.find(
                                          (opt) => opt.value === option.weight
                                        )}
                                        onChange={(selected) =>
                                          handleEditWeightOptionSelectChange(
                                            index,
                                            selected
                                          )
                                        }
                                        options={weightOptions}
                                        styles={customStyles}
                                        isSearchable={false}
                                        isDisabled={isUnitsLoading}
                                        components={{
                                          DropdownIndicator: () => (
                                            <AiOutlineDown className="w-4 h-4" />
                                          ),
                                          IndicatorSeparator: () => null,
                                        }}
                                      />
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <input
                                        type="number"
                                        value={option.subscribe_price}
                                        onChange={(e) =>
                                          handleEditWeightOptionChange(
                                            index,
                                            "subscribe_price",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Subscription Price"
                                        className="border p-2 rounded w-full"
                                        min="0"
                                        required
                                      />
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <input
                                        type="number"
                                        value={option.normal_price}
                                        onChange={(e) =>
                                          handleEditWeightOptionChange(
                                            index,
                                            "normal_price",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Normal Price"
                                        className="border p-2 rounded w-full"
                                        min="0"
                                        required
                                      />
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <input
                                        type="number"
                                        value={option.mrp_price}
                                        onChange={(e) =>
                                          handleEditWeightOptionChange(
                                            index,
                                            "mrp_price",
                                            e.target.value
                                          )
                                        }
                                        placeholder="MRP Price"
                                        className="border p-2 rounded w-full"
                                        min="0"
                                        required
                                      />
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            saveEditedWeightOption(index)
                                          }
                                          className="bg-[#393185] text-white py-1 px-2 rounded"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditing}
                                          className="bg-gray-500 text-white py-1 px-2 rounded"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <span className="text-[#393185] font-medium whitespace-nowrap">
                                        Weight:{" "}
                                      </span>
                                      {option.weight}
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <span className="text-[#393185] font-medium whitespace-nowrap">
                                        Subscription Price:{" "}
                                      </span>
                                      {option.subscribe_price}
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <span className="text-[#393185] font-medium whitespace-nowrap">
                                        Instant Price:{" "}
                                      </span>
                                      {option.normal_price}
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <span className="text-[#393185] font-medium whitespace-nowrap">
                                        MRP Price:{" "}
                                      </span>
                                      {option.mrp_price}
                                    </td>
                                    <td className="border border-gray-300 border-l p-2 w-1/5">
                                      <div className="flex gap-2">
                                        <FaPen
                                          className="text-[#393185] cursor-pointer"
                                          onClick={() => startEditing(index)}
                                        />
                                        <FaTrash
                                          className="text-[#393185] cursor-pointer"
                                          onClick={() =>
                                            deleteWeightOption(index)
                                          }
                                        />
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-left">
                          Package Type <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={packageTypeOptions.find(
                            (option) => option.value === formData.package_type
                          )}
                          onChange={handleSelectChange("package_type")}
                          options={packageTypeOptions}
                          styles={customStyles}
                          placeholder="Select Package Type"
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                        {errors.package_type && (
                          <p className="text-red-500 text-sm">
                            {errors.package_type.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-left">
                          Batch Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("batch_number", {
                            required: "Batch number is required",
                            pattern: {
                              value: /^[A-Za-z0-9-]+$/i,
                              message:
                                "Batch number must be alphanumeric with optional hyphens",
                            },
                            maxLength: {
                              value: 50,
                              message:
                                "Batch number must be 50 characters or less",
                            },
                          })}
                          value={formData.batch_number}
                          onChange={handleChange}
                          placeholder="Enter batch number (e.g., LOT123)"
                          className="border p-2 rounded w-full"
                        />
                        {errors.batch_number && (
                          <p className="text-red-500 text-sm">
                            {errors.batch_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-left">Out of Stock</label>
                        <Select
                          value={yesNoOptions.find(
                            (option) =>
                              option.value === formData.out_of_stock.toString()
                          )}
                          onChange={handleSelectChange("out_of_stock")}
                          options={yesNoOptions}
                          styles={customStyles}
                          placeholder="Select Out of Stock"
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-left">
                          Subscription Required
                        </label>
                        <Select
                          value={yesNoOptions.find(
                            (option) =>
                              option.value ===
                              formData.subscription_required.toString()
                          )}
                          onChange={handleSelectChange("subscription_required")}
                          options={yesNoOptions}
                          styles={customStyles}
                          placeholder="Select Subscription"
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-left">Status</label>
                        <Select
                          value={statusOptions.find(
                            (option) =>
                              option.value === formData.status.toString()
                          )}
                          onChange={handleSelectChange("status")}
                          options={statusOptions}
                          styles={customStyles}
                          placeholder="Select Status"
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => (
                              <AiOutlineDown className="w-4 h-4" />
                            ),
                            IndicatorSeparator: () => null,
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-left">Discount (%)</label>
                        <input
                          type="number"
                          {...register("discount", {
                            min: {
                              value: 0,
                              message: "Discount cannot be negative",
                            },
                            max: {
                              value: 100,
                              message: "Discount cannot exceed 100%",
                            },
                          })}
                          value={formData.discount}
                          onChange={handleChange}
                          name="discount"
                          placeholder="Enter discount percentage"
                          className="border p-2 rounded w-full"
                          min="0"
                        />
                        {errors.discount && (
                          <p className="text-red-500 text-sm">
                            {errors.discount.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-left">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="description"
                          control={control}
                          rules={{ required: "Description is required" }}
                          render={({ field }) => (
                            <JoditEditor
                              ref={editor}
                              value={field.value}
                              config={editorConfig}
                              onBlur={(newContent) =>
                                field.onChange(newContent)
                              }
                              onChange={(newContent) => {}}
                            />
                          )}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className={`mt-6 bg-[#393185] text-white py-2 px-4 rounded flex items-center justify-left ${
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
                        {isSubmitting
                          ? "Submitting..."
                          : id
                          ? "Update Product"
                          : "Add Product"}
                      </button>
                    </div>
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

export default ProductAdd;
