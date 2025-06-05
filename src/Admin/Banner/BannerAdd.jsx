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

  const handleTimeChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setValue(field, value);
  };

  const formatDateForInput = (date, forMin = false) => {
    if (!date) return "";
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    if (forMin) {
      // Add 1 minute to the current time for the min attribute to ensure future selection
      istDate.setMinutes(istDate.getMinutes() + 1);
    }
    const pad = (n) => n.toString().padStart(2, "0");
    const year = istDate.getFullYear();
    const month = pad(istDate.getMonth() + 1);
    const day = pad(istDate.getDate());
    const hours = pad(istDate.getHours());
    const minutes = pad(istDate.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    NotificationManager.removeAll();
    try {
      if (!formData.planType) {
        NotificationManager.error("Plan type is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!formData.status) {
        NotificationManager.error("Status is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!id && !data.img) {
        NotificationManager.error("Banner image is required for a new banner.", "Error");
        setIsSubmitting(false);
        return;
      }

      // Get current time in IST
      const nowInIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      console.log("Current Time in IST:", nowInIST.toISOString());

      if (formData.startTime) {
        const startDateInIST = new Date(formData.startTime);
        console.log("Start Date in IST:", startDateInIST.toISOString());
        // Compare dates by setting seconds and milliseconds to 0 to avoid precision issues
        const nowInISTForComparison = new Date(nowInIST);
        nowInISTForComparison.setSeconds(0, 0);
        const startDateInISTForComparison = new Date(startDateInIST);
        startDateInISTForComparison.setSeconds(0, 0);
        // Only enforce future startTime for new banners, not when editing
        if (!id && startDateInISTForComparison <= nowInISTForComparison) {
          NotificationManager.error("Start date/time must be in the future.", "Error");
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.endTime) {
        const endDateInIST = new Date(formData.endTime);
        console.log("End Date in IST:", endDateInIST.toISOString());
        const nowInISTForComparison = new Date(nowInIST);
        nowInISTForComparison.setSeconds(0, 0);
        const endDateInISTForComparison = new Date(endDateInIST);
        endDateInISTForComparison.setSeconds(0, 0);
        if (endDateInISTForComparison <= nowInISTForComparison) {
          NotificationManager.error("End date/time must be in the future.", "Error");
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.startTime && formData.endTime) {
        const startDateInIST = new Date(formData.startTime);
        const endDateInIST = new Date(formData.endTime);
        const startDateInISTForComparison = new Date(startDateInIST);
        startDateInISTForComparison.setSeconds(0, 0);
        const endDateInISTForComparison = new Date(endDateInIST);
        endDateInISTForComparison.setSeconds(0, 0);
        if (startDateInISTForComparison >= endDateInISTForComparison) {
          NotificationManager.error("End date/time must be after start date/time.", "Error");
          setIsSubmitting(false);
          return;
        }
      }

      const form = new FormData();
      form.append("planType", formData.planType);
      form.append("status", formData.status);
      if (formData.startTime) {
        form.append("startTime", new Date(formData.startTime).toISOString());
      }
      if (formData.endTime) {
        form.append("endTime", new Date(formData.endTime).toISOString());
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
        id ? "Banner updated successfully." : "Banner added successfully.",
        "Success"
      );
      setTimeout(() => navigate("/admin/banner-list"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.ResponseMsg ||
        (id ? "Failed to update Banner" : "Failed to add Banner");
      NotificationManager.error(errorMsg, "Error");
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
            const startTime = response.data.startTime
              ? formatDateForInput(new Date(response.data.startTime))
              : "";
            const endTime = response.data.endTime
              ? formatDateForInput(new Date(response.data.endTime))
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
          NotificationManager.error("Failed to load banner details.", "Error");
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
                  Banner Image
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
                  <label className="block text-left text-sm font-medium mb-0">
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
              </div>

              <div className="flex flex-row gap-x-4">
                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Start Date and Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register("startTime")}
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    min={id ? undefined : formatDateForInput(new Date(), true)} // Only enforce min for new banners
                    disabled={isSubmitting}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm">{errors.startTime.message}</p>
                  )}
                </div>

                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    End Date and Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register("endTime")}
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    min={formData.startTime || formatDateForInput(new Date(), true)} // Use startTime if available, otherwise current time + 1 minute
                    disabled={isSubmitting}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm">{errors.endTime.message}</p>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <NotificationContainer style={{ zIndex: 10000 }} />
    </div>
  );
};

export default BannerAdd;