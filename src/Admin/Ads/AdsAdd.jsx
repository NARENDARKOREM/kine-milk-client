import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import { useForm } from "react-hook-form";

const AdsAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [formData, setFormData] = useState({
    screenName: "",
    planType: "",
    status: "",
    img: null,
    startDateTime: "",
    endDateTime: "",
    couponPercentage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const screenNameOptions = [
    { value: "homescreen", label: "Homescreen" },
    { value: "categories", label: "Categories" },
    { value: "refer_and_earn", label: "Refer and Earn" },
    { value: "order_status", label: "Order Status" },
    { value: "wallet", label: "Wallet" },
  ];

  const planTypeOptions = [
    { value: "instant", label: "Instant" },
    { value: "subscribe", label: "Subscribe" },
  ];

  const statusOptions = [
    { value: "0", label: "Unpublished" },
    { value: "1", label: "Published" },
  ];

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
    placeholder: (base) => ({
      ...base,
      color: "#393185",
      fontSize: "12px",
    }),
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setFormData({ ...formData, img: null });
        return;
      }
      clearErrors("img");
      const imgURL = URL.createObjectURL(file);
      setFormData({ ...formData, img: imgURL, file });
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    const newFormData = { ...formData, [field]: selectedOption.value };
    setFormData(newFormData);
    setValue(field, selectedOption.value);
  };

  const handleDateChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setValue(field, value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!formData.screenName) {
        NotificationManager.removeAll();
        NotificationManager.error("Screen name is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!formData.planType) {
        NotificationManager.removeAll();
        NotificationManager.error("Plan type is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!formData.status) {
        NotificationManager.removeAll();
        NotificationManager.error("Status is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!id && !data.img) {
        NotificationManager.removeAll();
        NotificationManager.error("Ad image is required for new ads.", "Error");
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      if (formData.endDateTime) {
        const endDate = new Date(formData.endDateTime);
        if (endDate <= now) {
          NotificationManager.removeAll();
          NotificationManager.error("End date/time must be in the future.", "Error");
          setIsSubmitting(false);
          return;
        }
      }
      if (formData.startDateTime && formData.endDateTime) {
        const startDate = new Date(formData.startDateTime);
        const endDate = new Date(formData.endDateTime);
        if (startDate >= endDate) {
          NotificationManager.removeAll();
          NotificationManager.error("End date/time must be after start date/time.", "Error");
          setIsSubmitting(false);
          return;
        }
      }

      const form = new FormData();
      form.append("screenName", formData.screenName);
      form.append("planType", formData.planType);
      form.append("status", formData.status);
      if (formData.startDateTime) {
        form.append("startDateTime", formData.startDateTime);
      }
      if (formData.endDateTime) {
        form.append("endDateTime", formData.endDateTime);
      }
      if (formData.couponPercentage) {
        form.append("couponPercentage", formData.couponPercentage);
      }
      if (data.img && data.img[0]) {
        form.append("img", data.img[0]);
      }
      if (id) {
        form.append("id", id);
      }

      const response = await api.post("/ads/upsert-ads", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Ad updated successfully." : "Ad added successfully.",
        "Success"
      );
      setTimeout(() => navigate("/admin/list-ads"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.ResponseMsg ||
        (id ? "Failed to update ad" : "Failed to add ad");
      NotificationManager.removeAll();
      NotificationManager.error(errorMsg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/ads/getadsbyid/${id}`);
          if (response.data) {
            const convertToIST = (date) => {
              if (!date) return "";
              const utcDate = new Date(date);
              const istOffset = 5.5 * 60 * 60 * 1000;
              const istDate = new Date(utcDate.getTime() + istOffset);
              const year = istDate.getFullYear();
              const month = String(istDate.getMonth() + 1).padStart(2, "0");
              const day = String(istDate.getDate()).padStart(2, "0");
              const hours = String(istDate.getHours()).padStart(2, "0");
              const minutes = String(istDate.getMinutes()).padStart(2, "0");
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            const startDateTime = convertToIST(response.data.startDateTime);
            const endDateTime = convertToIST(response.data.endDateTime);

            setFormData({
              screenName: response.data.screenName,
              planType: response.data.planType,
              status: response.data.status.toString(),
              img: response.data.img,
              startDateTime,
              endDateTime,
              couponPercentage: response.data.couponPercentage || "",
            });
            setValue("screenName", response.data.screenName);
            setValue("planType", response.data.planType);
            setValue("status", response.data.status.toString());
            setValue("startDateTime", startDateTime);
            setValue("endDateTime", endDateTime);
            setValue("couponPercentage", response.data.couponPercentage || "");
          }
        } catch (error) {
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load ad details.", "Error");
        }
      };
      fetchData();
    }
  }, [id, setValue]);

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <SimpleHeader name={"Ads Management"} />
      <div className="container px-6">

        <div className="bg-white max-h-max w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">

            <div className="flex flex-col w-full gap-y-4">
              <div className="flex flex-col w-full">
                <label className="block text-left text-sm font-medium mb-1">
                  Ad Image
                </label>
                <input
                  type="file"
                  name="img"
                  {...register("img", {
                    required: !id ? "Ad image is required" : false,
                  })}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  className="w-full border border-gray-300 rounded p-2"
                  disabled={isSubmitting}
                />
                {formData.img && (
                  <img
                    src={formData.img}
                    alt="Preview"
                    className="w-16 h-16 mt-2 rounded"
                  />
                )}
                {errors.img && (
                  <p className="text-red-500 text-sm">{errors.img.message}</p>
                )}
              </div>

              <div className="flex flex-row gap-x-4">
                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Screen Name
                  </label>
                  <Select
                    value={screenNameOptions.find(
                      (option) => option.value === formData.screenName
                    )}
                    onChange={(option) =>
                      handleSelectChange("screenName", option)
                    }
                    options={screenNameOptions}
                    styles={customStyles}
                    placeholder="Select Screen Name"
                    isSearchable={false}
                    components={{
                      DropdownIndicator: () => (
                        <AiOutlineDown className="w-4 h-4" />
                      ),
                      IndicatorSeparator: () => null,
                    }}
                    className="w-full"
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldScrollIntoView={false}
                    isDisabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Plan Type
                  </label>
                  <Select
                    value={planTypeOptions.find(
                      (option) => option.value === formData.planType
                    )}
                    onChange={(option) => handleSelectChange("planType", option)}
                    options={planTypeOptions}
                    styles={customStyles}
                    placeholder="Select Plan Type"
                    isSearchable={false}
                    components={{
                      DropdownIndicator: () => (
                        <AiOutlineDown className="w-4 h-4" />
                      ),
                      IndicatorSeparator: () => null,
                    }}
                    className="w-full"
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldScrollIntoView={false}
                    isDisabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex flex-row gap-x-4">
                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Status
                  </label>
                  <Select
                    value={statusOptions.find(
                      (option) => option.value === formData.status
                    )}
                    onChange={(option) => handleSelectChange("status", option)}
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
                    className="w-full"
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldScrollIntoView={false}
                    isDisabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Coupon Percentage (Optional)
                  </label>
                  <input
                    type="number"
                    name="couponPercentage"
                    {...register("couponPercentage")}
                    value={formData.couponPercentage}
                    onChange={(e) =>
                      handleDateChange("couponPercentage", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded p-2"
                    placeholder="Enter percentage"
                    min="0"
                    max="100"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex flex-row gap-x-4">
                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Start Date and Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register("startDateTime")}
                    value={formData.startDateTime}
                    onChange={(e) =>
                      handleDateChange("startDateTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded p-2"
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isSubmitting}
                  />
                  {errors.startDateTime && (
                    <p className="text-red-500 text-sm">
                      {errors.startDateTime.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    End Date and Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register("endDateTime")}
                    value={formData.endDateTime}
                    onChange={(e) =>
                      handleDateChange("endDateTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded p-2"
                    min={formData.startDateTime || new Date().toISOString().slice(0, 16)}
                    disabled={isSubmitting}
                  />
                  {errors.endDateTime && (
                    <p className="text-red-500 text-sm">
                      {errors.endDateTime.message}
                    </p>
                  )}
                </div>
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
  {isSubmitting
    ? "Submitting..."
    : id
    ? "Update Ad"
    : "Add Ad"}
</button>

          </form>
        </div>
      </div>
      <NotificationContainer style={{ zIndex: 10000 }} />
    </div>
  );
};

export default AdsAdd;