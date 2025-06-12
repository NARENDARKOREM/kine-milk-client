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

const IllustrationImageAdd = () => {
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
    status: "",
    startTime: "",
    endTime: "",
    img: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const screenNameOptions = [
    { value: "login_with_ph_no", label: "Login with Phone Number" },
    { value: "otp_verification", label: "OTP Verification" },
    { value: "otp_verification_error", label: "OTP Verification Error" },
    { value: "otp_verification_done", label: "OTP Verification Done" },
    { value: "3_attempts_completed", label: "3 Attempts Completed" },
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    NotificationManager.removeAll();
    try {
      if (!formData.screenName) {
        NotificationManager.error("Screen name is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!formData.status) {
        NotificationManager.error("Status is required.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (!id && !data.img) {
        NotificationManager.error("Illustration image is required for a new illustration.", "Error");
        setIsSubmitting(false);
        return;
      }

      const now = new Date().toISOString();
      if (formData.endTime && formData.endTime <= now) {
        NotificationManager.error("End date/time must be in the future.", "Error");
        setIsSubmitting(false);
        return;
      }
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        NotificationManager.error("End date/time must be after start date/time.", "Error");
        setIsSubmitting(false);
        return;
      }

      const form = new FormData();
      form.append("screenName", formData.screenName);
      form.append("status", formData.status);
      if (formData.startTime) {
        form.append("startTime", formData.startTime);
      }
      if (formData.endTime) {
        form.append("endTime", formData.endTime);
      }
      if (data.img && data.img[0]) {
        form.append("img", data.img[0]);
      }
      if (id) {
        form.append("id", id);
      }

      const response = await api.post("/illustration/upsert-illustration", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      NotificationManager.success(
        id ? "Illustration updated successfully." : "Illustration added successfully.",
        "Success"
      );
      setTimeout(() => navigate("/admin/list-illustration"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.ResponseMsg ||
        (id ? "Failed to update Illustration" : "Failed to add Illustration");
      NotificationManager.error(errorMsg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/illustration/getillustrationbyid/${id}`);
          if (response.data) {
            setFormData({
              screenName: response.data.screenName,
              status: response.data.status.toString(),
              startTime: response.data.startTime || "",
              endTime: response.data.endTime || "",
              img: response.data.img,
            });
            setValue("screenName", response.data.screenName);
            setValue("status", response.data.status.toString());
            setValue("startTime", response.data.startTime || "");
            setValue("endTime", response.data.endTime || "");
          }
        } catch (error) {
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load illustration details.", "Error");
        }
      };
      fetchData();
    }
  }, [id, setValue]);

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <SimpleHeader name={"Illustration Image Management"} />
      <div className="container px-6">
        <div className="bg-white max-h-[70vh] w-[76vw] overflow-scroll rounded-xl border border-[#EAE5FF] py-4 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
            <div className="flex flex-col w-full gap-y-4">
              <div className="flex flex-col w-full">
                <label className="block text-left text-sm font-medium mb-1">
                  Illustration Image<span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="img"
                  {...register("img", {
                    required: !id ? "Illustration image is required" : false,
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
                    Screen Name<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={screenNameOptions.find(
                      (option) => option.value === formData.screenName
                    )}
                    onChange={(option) => handleSelectChange("screenName", option)}
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
                    Status<span className="text-red-500">*</span>
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
                    min={new Date().toISOString().slice(0, 16)}
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
                    min={formData.startTime || new Date().toISOString().slice(0, 16)}
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
              {isSubmitting
                ? "Submitting..."
                : id
                ? "Update Illustration"
                : "Add Illustration"}
            </button>
          </form>
        </div>
      </div>
      <NotificationContainer style={{ zIndex: 10000 }} />
    </div>
  );
};

export default IllustrationImageAdd;