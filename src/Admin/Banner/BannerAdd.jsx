import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import { useForm } from "react-hook-form";
import SimpleHeader from "../../common/SimpleHeader";

const BannerAdd = () => {
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
    planType: "",
    status: "",
    startTime: "",
    endTime: "",
    img: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planTypeOptions = [
    { value: "instant", label: "Instant" },
    { value: "subscribe", label: "Subscribe" },
  ];

  const statusOptions = [
    { value: "1", label: "Published" },
    { value: "0", label: "Unpublished" },
    { value: "2", label: "Scheduled" },
  ];

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
    placeholder: (base) => ({ ...base, color: "#393185", fontSize: "12px" }),
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
      setFormData({ ...formData, img: imgURL });
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    const newFormData = { ...formData, [field]: selectedOption.value };
    if (field === "status" && selectedOption.value === "0") {
      newFormData.startTime = "";
      newFormData.endTime = "";
      setValue("startTime", "");
      setValue("endTime", "");
      clearErrors(["startTime", "endTime"]);
    }
    setFormData(newFormData);
    setValue(field, selectedOption.value);
  };

  const handleTimeChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setValue(field, value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    NotificationManager.removeAll();
    try {
      if (!formData.planType) {
        NotificationManager.removeAll()
        NotificationManager.error("Plan type is required.");
        return;
      }
      if (!formData.status) {
        NotificationManager.removeAll()
        NotificationManager.error("Banner status is required.");
        return;
      }
      if (!id && !data.img) {
        NotificationManager.removeAll()
        NotificationManager.error("Banner image is required for a new banner.");
        return;
      }

      const currentTime = new Date();

      if (formData.status === "2") {
        if (!formData.startTime) {
          NotificationManager.removeAll()
          NotificationManager.error("Start time is required for Scheduled status.");
          return;
        }
        const startDate = new Date(formData.startTime);
        if (startDate <= currentTime) {
          NotificationManager.removeAll()
          NotificationManager.error("Start time must be in the future for Scheduled status.");
          return;
        }
        if (!formData.endTime) {
          NotificationManager.removeAll()
          NotificationManager.error("End time is required for Scheduled status.");
          return;
        }
        const endDate = new Date(formData.endTime);
        if (endDate <= startDate) {
          NotificationManager.removeAll()
          NotificationManager.error("End time must be greater than start time for Scheduled status.");
          return;
        }
        if (endDate <= currentTime) {
          NotificationManager.removeAll()
          NotificationManager.error("End time must be in the future for Scheduled status.");
          return;
        }
      }

      if (formData.status === "1" && formData.endTime) {
        const endDate = new Date(formData.endTime);
        if (endDate <= currentTime) {
          NotificationManager.error("End time must be in the future if provided for Published status.");
          return;
        }
      }

      const form = new FormData();
      form.append("planType", formData.planType);
      form.append("status", formData.status);
      if (formData.status === "2") {
        form.append("startTime", formData.startTime);
      }
      if ((formData.status === "1" && formData.endTime) || formData.status === "2") {
        form.append("endTime", formData.endTime);
      }
      if (data.img && data.img[0]) {
        form.append("img", data.img[0]);
      }
      if (id) {
        form.append("id", id);
      }

      const response = await api.post("/banner/upsert-banner", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      NotificationManager.success(
        id ? "Banner updated successfully." : "Banner added successfully."
      );
      setTimeout(() => navigate("/admin/banner-list"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.ResponseMsg ||
        (id ? "Failed to update Banner" : "Failed to add Banner");
      NotificationManager.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/banner/getbannerbyid/${id}`);
          if (response.data) {
            // Backend now returns IST times, so we can use them directly
            const startTime = response.data.startTime
              ? new Date(response.data.startTime).toISOString().slice(0, 16)
              : "";
            const endTime = response.data.endTime
              ? new Date(response.data.endTime).toISOString().slice(0, 16)
              : "";
            setFormData({
              planType: response.data.planType,
              status: response.data.status.toString(),
              startTime,
              endTime,
              img: response.data.img,
            });
            setValue("planType", response.data.planType);
            setValue("status", response.data.status.toString());
            setValue("startTime", startTime);
            setValue("endTime", endTime);
          }
        } catch (error) {
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load banner details.");
        }
      };
      fetchData();
    }
  }, [id, setValue]);

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <SimpleHeader name={"Banner Management"} />
      <div className="container px-6">
        <div className="bg-white max-h-max w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex flex-col w-full gap-y-4">
              <div className="flex flex-col w-full">
                <label className="block text-left text-sm font-medium mb-1">
                  Image
                </label>
                <input
                  type="file"
                  name="img"
                  {...register("img", {
                    required: !id ? "Banner image is required" : false,
                  })}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  className="w-full border border-gray-300 rounded p-2"
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
                    Plan Type
                  </label>
                  <Select
                    value={planTypeOptions.find(
                      (option) => option.value === formData.planType
                    )}
                    onChange={(option) => handleSelectChange("planType", option)}
                    options={planTypeOptions}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldScrollIntoView={false}
                    placeholder="Select Plan Type"
                    isSearchable={false}
                    components={{
                      DropdownIndicator: () => (
                        <AiOutlineDown className="w-4 h-4" />
                      ),
                      IndicatorSeparator: () => null,
                    }}
                    className="w-full"
                  />
                </div>

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
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                    menuShouldScrollIntoView={false}
                    placeholder="Select Status"
                    isSearchable={false}
                    components={{
                      DropdownIndicator: () => (
                        <AiOutlineDown className="w-4 h-4" />
                      ),
                      IndicatorSeparator: () => null,
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {formData.status === "2" && (
                <div className="flex flex-col w-full">
                  <label className="block text-left text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register("startTime", {
                      required: formData.status === "2" ? "Start time is required" : false,
                    })}
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm">{errors.startTime.message}</p>
                  )}
                </div>
              )}

              {(formData.status === "1" || formData.status === "2") && (
                <div className="flex flex-col w-full">
                  <label className="block text-left text-sm font-medium mb-1">
                    End Time {formData.status === "1" && "(Optional)"}
                  </label>
                  <input
                    type="datetime-local"
                    {...register("endTime", {
                      required: formData.status === "2" ? "End time is required" : false,
                    })}
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    min={formData.startTime || new Date().toISOString().slice(0, 16)}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm">{errors.endTime.message}</p>
                  )}
                </div>
              )}
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default BannerAdd;