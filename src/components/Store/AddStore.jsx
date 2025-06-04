import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Header from "../../common/Header";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";

const AddStore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
const [isSubmitting,setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    trigger,
    watch,
    formState: { errors },
  } = useForm();

  const storeId = location.state?.id || null;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/category/all");
        const categoryData = response.data.categories;
        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        } else {
          console.error("Invalid category data format:", categoryData);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStoreById = async () => {
      if (storeId) {
        try {
          const response = await api.get(`/store/fetch/${storeId}`);
          const storeData = response.data.store;

          if (!storeData) {
            console.error("Store data is missing in response:", response.data);
            NotificationManager.error("Store data not found.");
            return;
          }

          setValue("title", storeData.title);
          setValue("status", storeData.status);
          setValue("rate", storeData.rate);
          setValue("lcode", storeData.lcode);
          setValue("mobile", storeData.mobile);
          setValue("slogan_title", storeData.slogan_title);
          setValue("slogan", storeData.slogan);
          setValue("opentime", storeData.opentime);
          setValue("closetime", storeData.closetime);
          setValue("is_pickup", storeData.is_pickup);
          setValue("sdesc", storeData.sdesc);
          setValue("cancle_policy", storeData.cancle_policy);
          setValue("email", storeData.email);
          setValue("password", "");
          setValue("full_address", storeData.full_address);
          setValue("pincode", storeData.pincode);
          setValue("landmark", storeData.landmark);
          setValue("zone_id", storeData.zone_id);
          setValue("lats", storeData.lats);
          setValue("longs", storeData.longs);
          setValue("charge_type", storeData.charge_type);
          setValue("store_charge", storeData.store_charge);
          setValue("morder", storeData.morder);
          setValue("commission", storeData.commission);
          setValue("bank_name", storeData.bank_name);
          setValue("ifsc", storeData.ifsc);
          setValue("receipt_name", storeData.receipt_name);
          setValue("acc_number", storeData.acc_number);
          setValue("paypal_id", storeData.paypal_id);
          setValue("upi_id", storeData.upi_id);
          setValue("owner_name", storeData.owner_name);

          if (storeData.rimg) setPreviewLogo(storeData.rimg);
          if (storeData.cover_img) setPreviewCover(storeData.cover_img);

          const fetchedTags = JSON.parse(storeData.tags);
          setTags(fetchedTags);

          const catid = JSON.parse(storeData.catid);
          if (categories.length > 0) {
            const selectedCats = categories.filter((cat) =>
              catid.includes(cat.id)
            );
            setSelectedCategories(selectedCats);
          }
        } catch (error) {
          console.error("Error fetching store data:", error);
          NotificationManager.error("Failed to load store data.");
        }
      }
    };
    fetchStoreById();
  }, [storeId, setValue, categories]);

  const handleKeyDown = (event) => {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      const newTag = event.target.value.trim();
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue("tags", updatedTags);
      }
      event.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  const handleSelectChange = (category) => {
    if (!selectedCategories.some((c) => c.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const removeCategory = (categoryToRemove) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.filter((c) => c.id !== categoryToRemove.id)
    );
  };

  const handlePhoneChange = (value) => {
    setValue("mobile", value);
    trigger("mobile");
  };

  const handleStatusChange = (selectedOption) => {
    setValue("status", selectedOption.value, { shouldValidate: true });
  };

  const handlePickupChange = (selectedOption) => {
    setValue("is_pickup", selectedOption.value, { shouldValidate: true });
  };

  const handleChargeTypeChange = (selectedOption) => {
    setValue("charge_type", selectedOption.value, { shouldValidate: true });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("rimg", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setValue("rimg", null);
        setPreviewLogo(storeId ? previewLogo : null);
        return;
      }
      clearErrors("rimg");
      setPreviewLogo(URL.createObjectURL(file));
      setValue("rimg", e.target.files, { shouldValidate: true });
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("cover_img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setValue("cover_img", null);
        setPreviewCover(storeId ? previewCover : null);
        return;
      }
      clearErrors("cover_img");
      setPreviewCover(URL.createObjectURL(file));
      setValue("cover_img", e.target.files, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (
        data.rimg &&
        data.rimg[0] &&
        data.rimg[0].size > 1 * 1024 * 1024
      ) {
        setError("rimg", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        return;
      }
      if (
        data.cover_img &&
        data.cover_img[0] &&
        data.cover_img[0].size > 1 * 1024 * 1024
      ) {
        setError("cover_img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("status", data.status);
      formData.append("rate", data.rate);
      formData.append("lcode", data.lcode);
      formData.append("mobile", data.mobile);
      formData.append("slogan_title", data.slogan_title);
      formData.append("slogan", data.slogan);
      formData.append("opentime", data.opentime);
      formData.append("closetime", data.closetime);
      formData.append("is_pickup", data.is_pickup);
      formData.append("sdesc", data.sdesc);
      formData.append("cancle_policy", data.cancle_policy);
      formData.append("email", data.email);
      if (data.password) formData.append("password", data.password);
      formData.append("full_address", data.full_address);
      formData.append("pincode", data.pincode);
      formData.append("landmark", data.landmark);
      formData.append("zone_id", data.zone_id);
      formData.append("lats", data.lats);
      formData.append("longs", data.longs);
      formData.append("charge_type", data.charge_type);
      formData.append("store_charge", data.store_charge);
      formData.append("morder", data.morder);
      formData.append("commission", data.commission);
      formData.append("bank_name", data.bank_name);
      formData.append("ifsc", data.ifsc);
      formData.append("receipt_name", data.receipt_name);
      formData.append("acc_number", data.acc_number);
      formData.append("paypal_id", data.paypal_id);
      formData.append("upi_id", data.upi_id);
      formData.append("owner_name", data.owner_name);
      if (storeId) {
        formData.append("id", storeId);
      }

      formData.append("tags", JSON.stringify(tags));
      formData.append(
        "catid",
        JSON.stringify(selectedCategories.map((c) => c.id))
      );

      if (data.rimg && data.rimg[0]) formData.append("rimg", data.rimg[0]);
      if (data.cover_img && data.cover_img[0])
        formData.append("cover_img", data.cover_img[0]);

      const response = await api.post("/store/upsert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      NotificationManager.removeAll();
      NotificationManager.success(
        response.data.message || (storeId ? "Store updated successfully!" : "Store created successfully!")
      );

      setTimeout(() => {
        navigate("/admin/store-list");
      }, 2000);
    } catch (error) {
      NotificationManager.removeAll();
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.ResponseMsg || error.response?.data?.message || "Failed to add/update store.";
      if (
        error.response?.status === 400 &&
        errorMessage === "Image size must be 1MB or less"
      ) {
        if (data.rimg && data.rimg[0]) {
          setError("rimg", {
            type: "manual",
            message: "Image size must be 1MB or less",
          });
          setValue("rimg", null);
          setPreviewLogo(storeId ? previewLogo : null);
        }
        if (data.cover_img && data.cover_img[0]) {
          setError("cover_img", {
            type: "manual",
            message: "Image size must be 1MB or less",
          });
          setValue("cover_img", null);
          setPreviewCover(storeId ? previewCover : null);
        }
      } else {
        NotificationManager.removeAll();
        NotificationManager.error(errorMessage);
      }
    }
    setIsSubmitting(false)
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
    zIndex: 1,
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

  const statusOptions = [
    { value: "1", label: "Publish" },
    { value: "0", label: "Unpublish" },
  ];

  const pickupOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];

  const chargeTypeOptions = [
    { value: "fixedcharge", label: "Fixed Charge" },
    { value: "dynamiccharge", label: "Dynamic Charge" },
  ];

  return (
    <div className="flex bg-[#f7fbff] h-full">
      <main className="flex-grow ">
        <Header />
        <div className="container  p-6">
          <div className="flex items-center mb-4">
            <Link onClick={() => navigate(-1)} className="cursor-pointer">
              <ArrowBackIosNewIcon className="text-[#393185]"/>
            </Link>
            <h2 className="text-lg font-semibold ml-4 text-left text-[#393185]">Add Store</h2>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-md max-h-[70vh] w-[76vw] overflow-y-auto"
          >
            <div className="Store information">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Information
              </h1>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Store Name"
                    {...register("title", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Logo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleLogoChange}
                    {...register("rimg")}
                    className="w-full border border-gray-300 rounded px-2 py-2"
                  />
                  {errors.rimg && (
                    <p className="text-red-500 text-sm">
                      {errors.rimg.message}
                    </p>
                  )}
                  {previewLogo && (
                    <div className="mt-2">
                      <img
                        src={previewLogo}
                        alt="Logo Preview"
                        className="w-[50px] h-[50px] object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Cover Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleCoverChange}
                    {...register("cover_img")}
                    className="w-full border border-gray-300 rounded px-2 py-2"
                  />
                  {errors.cover_img && (
                    <p className="text-red-500 text-sm">
                      {errors.cover_img.message}
                    </p>
                  )}
                  {previewCover && (
                    <div className="mt-2">
                      <img
                        src={previewCover}
                        alt="Cover Preview"
                        className="object-cover rounded w-[50px] h-[50px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={statusOptions.find(
                      (option) => option.value === watch("status")?.toString()
                    )}
                    onChange={handleStatusChange}
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
                  {errors.status && (
                    <p className="text-red-500 text-sm">
                      {errors.status.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Rating"
                    {...register("rate", {
                      required: "This field is required",
                      pattern: {
                        value: /^[0-9]+(\.[0-9]*)?$/,
                        message: "Only numbers are allowed",
                      },
                    })}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9.]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Tab"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.rate && (
                    <p className="text-red-500 text-sm">
                      {errors.rate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Certificate/License Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="License Code"
                    {...register("lcode", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.lcode && (
                    <p className="text-red-500 text-sm">
                      {errors.lcode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={watch("mobile")}
                    onChange={handlePhoneChange}
                    inputClass="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Slogan Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Slogan Title"
                    {...register("slogan_title", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.slogan_title && (
                    <p className="text-red-500 text-sm">
                      {errors.slogan_title.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Slogan Subtitle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Slogan Subtitle"
                    {...register("slogan", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.slogan && (
                    <p className="text-red-500 text-sm">
                      {errors.slogan.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Open Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register("opentime", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.opentime && (
                    <p className="text-red-500 text-sm">
                      {errors.opentime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Close Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register("closetime", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                  {errors.closetime && (
                    <p className="text-red-500 text-sm">
                      {errors.closetime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-left block font-medium mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                <div className="w-full border border-[#B0B0B0] rounded px-2 py-1 flex flex-wrap items-center gap-2 focus-within:border-[#393185] focus-within:ring-2 focus-within:ring-[#393185]">
                  {Array.isArray(tags) &&
                    tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-[#393185] text-white px-2 py-1 rounded flex items-center"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="ml-1 text-white text-lg"
                          onClick={() => removeTag(tag)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-1 py-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none"
                    placeholder="Enter tags and press ',' or 'Enter'"
                  />
                </div>
                {errors.tags && (
                  <p className="text-red-500 text-sm">{errors.tags.message}</p>
                )}
              </div>

              <div className="mb-4 block">
                <label className="text-left block font-medium mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("sdesc", {
                    required: "This field is required",
                  })}
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                {errors.sdesc && (
                  <p className="text-red-500 text-sm">{errors.sdesc.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-left block font-medium mb-2">
                  Cancel Policy <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("cancle_policy", {
                    required: "This field is required",
                  })}
                  className="w-full border border-gray-300 rounded px-2 py-1 h-24"
                ></textarea>
                {errors.cancle_policy && (
                  <p className="text-red-500 text-sm">
                    {errors.cancle_policy.message}
                  </p>
                )}
              </div>
            </div>

            <div className="storelogininformation">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store login information
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    {...register("email", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Password {storeId ? "(Optional)" : "*"}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Password"
                    {...register("password", {
                      required: !storeId && "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Owner Name"
                    {...register("owner_name", {
                      required: "This field is required",
                    })}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.owner_name && (
                    <p className="text-red-500 text-sm">
                      {errors.owner_name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="store-category-information relative mb-3">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Category Information
              </h1>
              <label className="text-left block font-medium mb-2">
                Store Category (Multiple Select)
              </label>
              <div
                className="border border-gray-300 rounded px-2 py-2 w-full bg-white cursor-pointer relative"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex flex-wrap min-h-[25px] items-center gap-2">
                  {selectedCategories?.map((category) => (
                    <div
                      key={category.id}
                      className="bg-[#393185] text-white px-3 py-2 rounded flex items-start"
                    >
                      <span>{category.title}</span>
                      <button
                        type="button"
                        className="ml-2 text-white text-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCategory(category);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
                  {categories
                    .filter(
                      (category) =>
                        !selectedCategories.some(
                          (selected) => selected.id === category.id
                        )
                    )
                    .map((category) => (
                      <div
                        key={category.id}
                        className="px-3 py-2 cursor-pointer hover:bg-[#393185] hover:text-white"
                        onClick={() => handleSelectChange(category)}
                      >
                        {category.title}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="store-address-information mb-4">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Address information
              </h1>
              <div>
                <label className="block font-medium mb-1 text-left">
                  Full Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("full_address", {
                    required: "Full address is required",
                  })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter full address"
                />
                {errors.full_address && (
                  <p className="text-red-500 text-sm">
                    {errors.full_address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-left">
                    Pincode<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("pincode", {
                      required: "Pincode is required",
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter pincode"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-left">
                    Landmark
                  </label>
                  <input
                    type="text"
                    {...register("landmark")}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter landmark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-left">
                    Latitude<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("lats", {
                      required: "Latitude is required",
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter latitude"
                  />
                  {errors.lats && (
                    <p className="text-red-500 text-sm">
                      {errors.lats.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-left">
                    Longitude<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("longs", {
                      required: "Longitude is required",
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter longitude"
                  />
                  {errors.longs && (
                    <p className="text-red-500 text-sm">
                      {errors.longs.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="select-service-charge Typemb-3">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Select Service Charge Type
              </h1>
              <label className="block font-medium mb-1 text-left">
                Select Service Charge Type
              </label>
              <Select
                value={chargeTypeOptions.find(
                  (option) => option.value === watch("charge_type")
                )}
                onChange={handleChargeTypeChange}
                options={chargeTypeOptions}
                styles={customStyles}
                placeholder="Select Type"
                isSearchable={false}
                components={{
                  DropdownIndicator: () => (
                    <AiOutlineDown className="w-4 h-4" />
                  ),
                  IndicatorSeparator: () => null,
                }}
              />
              {errors.charge_type && (
                <p className="text-red-500 text-sm">
                  {errors.charge_type.message}
                </p>
              )}
            </div> */}

            {/* <div className="store-service-information">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Service Information
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Store Charge (Packing/Extra) *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Store Charge"
                    {...register("store_charge", {
                      required: "This field is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      },
                    })}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.store_charge && (
                    <p className="text-red-500 text-sm">
                      {errors.store_charge.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Min Order Price *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter min order price"
                    {...register("morder", {
                      required: "This field is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      },
                    })}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.morder && (
                    <p className="text-red-500 text-sm">
                      {errors.morder.message}
                    </p>
                  )}
                </div>
              </div>
            </div> */}

            {/* <div className="store-commission-information">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Commission Information
              </h1>
              <div className="mb-4">
                <label className="text-left block font-medium mb-2">
                  Store Commission Rate *
                </label>
                <input
                  type="text"
                  placeholder="Enter Commission rate"
                  {...register("commission", {
                    required: "This field is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers are allowed",
                    },
                  })}
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.commission && (
                  <p className="text-red-500 text-sm">
                    {errors.commission.message}
                  </p>
                )}
              </div>
            </div> */}

            {/* <div className="store-payout-information">
              <h1 className="text-xl font-semibold mb-4 text-left">
                Store Payout Information
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-left block font-medium mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    {...register("bank_name", {
                      required: "This field is required",
                    })}
                    placeholder="Enter Bank Name"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.bank_name && (
                    <p className="text-red-500 text-sm">
                      {errors.bank_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Bank Code / IFSC *
                  </label>
                  <input
                    type="text"
                    {...register("ifsc", {
                      required: "This field is required",
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: "Only uppercase letters & numbers allowed",
                      },
                    })}
                    placeholder="Enter IFSC Code"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.ifsc && (
                    <p className="text-red-500 text-sm">
                      {errors.ifsc.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    {...register("receipt_name", {
                      required: "This field is required",
                    })}
                    placeholder="Enter Recipient Name"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.receipt_name && (
                    <p className="text-red-500 text-sm">
                      {errors.receipt_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    {...register("acc_number", {
                      required: "This field is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      },
                    })}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter Account Number"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.acc_number && (
                    <p className="text-red-500 text-sm">
                      {errors.acc_number.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    PayPal ID *
                  </label>
                  <input
                    type="email"
                    {...register("paypal_id", {
                      required: "This field is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid PayPal email",
                      },
                    })}
                    placeholder="Enter PayPal ID"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.paypal_id && (
                    <p className="text-red-500 text-sm">
                      {errors.paypal_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-left block font-medium mb-2">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    {...register("upi_id", {
                      required: "This field is required",
                      pattern: {
                        value: /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/,
                        message: "Enter a valid UPI ID",
                      },
                    })}
                    placeholder="Enter UPI ID"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.upi_id && (
                    <p className="text-red-500 text-sm">
                      {errors.upi_id.message}
                    </p>
                  )}
                </div>
              </div>
            </div> */}

          <div className="text-left">
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
  {isSubmitting
    ? "Submitting..."
    : storeId
    ? "Update Store"
    : "Add Store"}
</button>

            </div>
          </form>
          <NotificationContainer />
        </div>
      </main>
    </div>
  );
};

export default AddStore;