import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";

const CouponAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    trigger,
  } = useForm();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: id || null,
    coupon_img: null,
    status: "",
    coupon_title: "",
    start_date: "",
    end_date: "",
    subtitle: "",
    min_amt: "",
    coupon_val: "",
    description: "",
    coupon_code: "",
    coupon_img_preview: "",
  });

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

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    // Dates are in IST, format directly
    const pad = (n) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (id) {
      const fetchCoupon = async () => {
        try {
          const response = await api.get(`/coupon/getbyid/${id}`);
          const coupon = response.data;

          let imageUrl = coupon.coupon_img;
          if (imageUrl) {
            imageUrl = imageUrl.replace(/^"|"$/g, "");
          }

          const startDate = coupon.start_date ? formatDateForInput(coupon.start_date) : "";
          const endDate = coupon.end_date ? formatDateForInput(coupon.end_date) : "";

          setFormData({
            id,
            coupon_img: null,
            coupon_img_preview: imageUrl,
            status: coupon.status.toString(),
            coupon_title: coupon.coupon_title || "",
            start_date: startDate,
            end_date: endDate,
            subtitle: coupon.subtitle || "",
            min_amt: coupon.min_amt || "",
            coupon_val: coupon.coupon_val || "",
            description: coupon.description || "",
            coupon_code: coupon.coupon_code || "",
          });

          setValue("status", coupon.status.toString());
          setValue("coupon_title", coupon.coupon_title || "");
          setValue("start_date", startDate);
          setValue("end_date", endDate);
          setValue("subtitle", coupon.subtitle || "");
          setValue("min_amt", coupon.min_amt || "");
          setValue("coupon_val", coupon.coupon_val || "");
          setValue("description", coupon.description || "");
          setValue("coupon_code", coupon.coupon_code || "");
        } catch (error) {
          console.error("Error fetching coupon:", error);
          NotificationManager.error("Failed to load coupon details.", "Error");
        }
      };
      fetchCoupon();
    }
  }, [id, setValue]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 1 * 1024 * 1024) {
        setError("coupon_img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setFormData((prevData) => ({
          ...prevData,
          coupon_img: null,
          coupon_img_preview: id ? formData.coupon_img_preview : "",
        }));
        return;
      }
      clearErrors("coupon_img");
      setFormData((prevData) => ({
        ...prevData,
        coupon_img: file,
        coupon_img_preview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      setValue(name, value, { shouldValidate: true });
    }

    await trigger(name);
  };

  const handleSelectChange = (selectedOption) => {
    const newStatus = selectedOption.value;
    setFormData((prevData) => ({
      ...prevData,
      status: newStatus,
    }));
    setValue("status", newStatus, { shouldValidate: true });
  };

  const makeEightDigitRand = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const randomCode = Array.from({ length: 8 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    setFormData((prevData) => ({
      ...prevData,
      coupon_code: randomCode,
    }));
    setValue("coupon_code", randomCode);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!id && !formData.coupon_img) {
        setError("coupon_img", {
          type: "manual",
          message: "Coupon image is required",
        });
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      if (data.end_date) {
        const endDate = new Date(data.end_date);
        if (endDate <= now) {
          NotificationManager.error("End date/time must be in the future.", "Error");
          setIsSubmitting(false);
          return;
        }
      }
      if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (startDate >= endDate) {
          NotificationManager.error("End date/time must be after start date/time.", "Error");
          setIsSubmitting(false);
          return;
        }
      }

      const form = new FormData();
      form.append("coupon_title", data.coupon_title);
      form.append("status", formData.status);
      form.append("start_date", data.start_date || "");
      form.append("end_date", data.end_date || "");
      form.append("description", data.description);
      form.append("subtitle", data.subtitle);
      form.append("min_amt", data.min_amt);
      form.append("coupon_val", data.coupon_val);
      form.append("coupon_code", formData.coupon_code);
      if (formData.coupon_img && formData.coupon_img instanceof File) {
        form.append("coupon_img", formData.coupon_img);
      }
      if (id) {
        form.append("id", id);
      }

      await api.post("/coupon/upsert", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Coupon updated successfully!" : "Coupon added successfully!",
        "Success"
      );

      setTimeout(() => {
        navigate("/admin/coupon-list");
      }, 2000);
    } catch (error) {
      NotificationManager.removeAll();
      const errorMsg = error.response?.data?.ResponseMsg;
      if (
        error.response?.status === 400 &&
        errorMsg === "Image size must be 1MB or less"
      ) {
        setError("coupon_img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        setFormData((prevData) => ({
          ...prevData,
          coupon_img: null,
          coupon_img_preview: id ? formData.coupon_img_preview : "",
        }));
      } else if (
        error.response?.status === 400 &&
        errorMsg.includes("End date/time must be after start date/time")
      ) {
        setError("end_date", {
          type: "manual",
          message: "End date/time must be after start date/time",
        });
      } else if (
        error.response?.status === 400 &&
        errorMsg === "Image is required for a new coupon."
      ) {
        setError("coupon_img", {
          type: "manual",
          message: "Coupon image is required",
        });
      } else {
        NotificationManager.error(
          id ? "Failed to update Coupon." : "Failed to add Coupon.",
          "Error"
        );
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <SimpleHeader name={"Coupon Management"} />
          <div className="container mx-auto">
            <div className="h-full px-6 max-w-5xl" style={{ paddingTop: "24px" }}>
              <div className="bg-white h-[67vh] w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid gap-6 w-full sm:grid-cols-1 md:grid-cols-3">
                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Coupon Image
                      </label>
                      <input
                        type="file"
                        {...register("coupon_img")}
                        onChange={handleChange}
                        className="border rounded text-center p-2"
                        accept="image/*"
                      />
                      {formData.coupon_img_preview && (
                        <img
                          src={formData.coupon_img_preview}
                          alt="Preview"
                          className="w-12 h-12 mt-2 object-cover rounded-md"
                        />
                      )}
                      {errors.coupon_img && (
                        <p className="text-red-500 text-sm">
                          {errors.coupon_img.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Coupon Code
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          {...register("coupon_code", {
                            required: "Coupon code is required",
                          })}
                          value={formData.coupon_code}
                          onChange={handleChange}
                          className="border p-3 w-full h-12 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={makeEightDigitRand}
                          className="ml-2 bg-[#393185] text-white px-4 py-2 rounded-lg"
                        >
                          Generate
                        </button>
                      </div>
                      {errors.coupon_code && (
                        <p className="text-red-500 text-sm">
                          {errors.coupon_code.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Coupon Title
                      </label>
                      <input
                        type="text"
                        {...register("coupon_title", {
                          required: "Title is required",
                        })}
                        value={formData.coupon_title}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                      />
                      {errors.coupon_title && (
                        <p className="text-red-500 text-sm">
                          {errors.coupon_title.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Status
                      </label>
                      <Select
                        value={statusOptions.find(
                          (option) => option.value === formData.status
                        )}
                        onChange={handleSelectChange}
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

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Start Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        {...register("start_date")}
                        value={formData.start_date}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {errors.start_date && (
                        <p className="text-red-500 text-sm">
                          {errors.start_date.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        End Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        {...register("end_date")}
                        value={formData.end_date}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                        min={formData.start_date || new Date().toISOString().slice(0, 16)}
                      />
                      {errors.end_date && (
                        <p className="text-red-500 text-sm">
                          {errors.end_date.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Coupon Subtitle
                      </label>
                      <input
                        type="text"
                        {...register("subtitle", {
                          required: "Subtitle is required",
                        })}
                        value={formData.subtitle}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                      />
                      {errors.subtitle && (
                        <p className="text-red-500 text-sm">
                          {errors.subtitle.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Minimum Order Amount
                      </label>
                      <input
                        type="text"
                        {...register("min_amt", {
                          required: "Amount is required",
                          pattern: {
                            value: /^[0-9]+(\.[0-9]+)?$/,
                            message: "Invalid amount",
                          },
                        })}
                        value={formData.min_amt}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                      />
                      {errors.min_amt && (
                        <p className="text-red-500 text-sm">
                          {errors.min_amt.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Coupon Value
                      </label>
                      <input
                        type="text"
                        {...register("coupon_val", {
                          required: "Value is required",
                          pattern: {
                            value: /^[0-9]+(\.[0-9]+)?$/,
                            message: "Invalid value",
                          },
                        })}
                        value={formData.coupon_val}
                        onChange={handleChange}
                        className="border p-3 w-full h-12 rounded-lg"
                      />
                      {errors.coupon_val && (
                        <p className="text-red-500 text-sm">
                          {errors.coupon_val.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:col-span-3">
                      <label className="text-sm text-left font-medium">
                        Coupon Description
                      </label>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                        })}
                        value={formData.description}
                        onChange={handleChange}
                        className="border p-3 w-full h-24 rounded-lg"
                      ></textarea>
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3 flex justify-start mt-4">
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
                          ? "Update Coupon"
                          : "Add Coupon"}
                      </button>
                    </div>
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

export default CouponAdd;