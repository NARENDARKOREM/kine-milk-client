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

const CarryBagAdd = () => {
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
    cost: "",
    bagImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planTypeOptions = [
    { value: "Instant", label: "Instant" },
    { value: "Subscribe", label: "Subscribe" },
  ];

  const statusOptions = [
    { value: "1", label: "Published" },
    { value: "0", label: "Unpublished" },
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
        setError("bagImage", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setFormData({ ...formData, bagImage: null });
        return;
      }
      clearErrors("bagImage");
      const imgURL = URL.createObjectURL(file);
      setFormData({ ...formData, bagImage: imgURL });
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    setFormData({ ...formData, [field]: selectedOption.value });
    setValue(field, selectedOption.value);
  };

  const handleCostChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, cost: value });
    setValue("cost", value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    NotificationManager.removeAll();
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);
    try {
      if (!formData.planType) {
        NotificationManager.error("Plan type is required.");
        setIsSubmitting(false);
        return;
      }
      if (!formData.status) {
        NotificationManager.error("Status is required.");
        setIsSubmitting(false);
        return;
      }
      if (!id && !data.bagImage) {
        NotificationManager.error("Bag image is required for new carry bags.");
        setIsSubmitting(false);
        return;
      }

      const form = new FormData();
      form.append("planType", formData.planType);
      form.append("status", formData.status);
      form.append("cost", formData.cost || "0");
      if (data.bagImage && data.bagImage[0]) {
        form.append("bagImage", data.bagImage[0]);
      }
      if (id) {
        form.append("id", id);
      }

      const response = await api.post("/carrybag/upsert", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      NotificationManager.success(
        id ? "Carry bag updated successfully." : "Carry bag added successfully."
      );
      setTimeout(() => navigate("/admin/list-carrybag"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.ResponseMsg ||
        (id ? "Failed to update carry bag" : "Failed to add carry bag");
      NotificationManager.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/carrybag/getbyid/${id}`);
          if (response.data) {
            const cleanedBagImage = response.data.bagImage
              ? response.data.bagImage.replace(/^"|"$/g, "")
              : null;
            setFormData({
              planType: response.data.planType,
              status: response.data.status.toString(),
              cost: response.data.cost ? response.data.cost.toString() : "",
              bagImage: cleanedBagImage,
            });
            setValue("planType", response.data.planType);
            setValue("status", response.data.status.toString());
            setValue("cost", response.data.cost ? response.data.cost.toString() : "");
          }
        } catch (error) {
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load carry bag details.");
        }
      };
      fetchData();
    }
  }, [id, setValue]);

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <SimpleHeader name={"Carry Bag Management"} />
      <div className="container px-6">
        <div className="bg-white max-h-max w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
            <div className="flex flex-col w-full gap-y-4">
              <div className="flex flex-col w-full">
                <label className="block text-left text-sm font-medium mb-1">
                  Bag Image
                </label>
                <input
                  type="file"
                  name="bagImage"
                  {...register("bagImage", {
                    required: !id ? "Bag image is required" : false,
                  })}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  className="w-full border border-gray-300 rounded p-2"
                />
                {formData.bagImage && (
                  <img
                    src={formData.bagImage}
                    alt="Preview"
                    className="w-16 h-16 mt-2 rounded"
                    onError={(e) =>
                      (e.target.src =
                        "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
                    }
                  />
                )}
                {errors.bagImage && (
                  <p className="text-red-500 text-sm">{errors.bagImage.message}</p>
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
                  />
                </div>
              </div>

              <div className="flex flex-row gap-x-4">
                <div className="flex flex-col w-1/2">
                  <label className="block text-left text-sm font-medium mb-1">
                    Cost (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("cost", {
                      min: { value: 0, message: "Cost cannot be negative" },
                    })}
                    value={formData.cost}
                    onChange={handleCostChange}
                    className="w-full border border-gray-300 rounded p-2"
                  />
                  {errors.cost && (
                    <p className="text-red-500 text-sm">{errors.cost.message}</p>
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
    ? "Update Carry-bag"
    : "Add Carry-bag"}
</button>

          </form>
        </div>
      </div>
      <NotificationContainer style={{ zIndex: 10000 }} />
    </div>
  );
};

export default CarryBagAdd;