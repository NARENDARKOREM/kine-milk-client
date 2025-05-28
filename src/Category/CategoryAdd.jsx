import React, { useState, useEffect } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import { AiOutlineDown } from "react-icons/ai";
import Select from "react-select";
import SimpleHeader from "../common/SimpleHeader";
import MilkLoader from "../utils/MilkLoader";

const CategoryAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      status: "",
      img: null,
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    img: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCategoryById = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/category/getbyid/${id}`);
          const fetchedData = response.data.data || response.data;

          setValue("title", fetchedData.title || "");
          setValue("status", String(fetchedData.status) || "");

          if (fetchedData.img) {
            setImagePreview(fetchedData.img);
          }
        } catch (error) {
          console.error("Error fetching category details:", error);
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load category details.");
        } finally {
          setLoading(false);
        }
      };
      fetchCategoryById();
    }
  }, [id, setValue]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "img" && files && files.length > 0) {
      const file = files[0];
      if (file.size > 1 * 1024 * 1024) {
        setError("img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        e.target.value = "";
        setValue("img", null);
        setImagePreview(null);
        return;
      }
      clearErrors("img");

      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, img: file }));
      setValue("img", file, { shouldValidate: true });
      await trigger("img");
    } else {
      setValue(name, value, { shouldValidate: true });
      await trigger(name);
    }
  };

  const handleSelectChange = (selectedOption) => {
    const selectedValue = selectedOption.value;
    setValue("status", selectedValue, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!id && !formData.img) {
        NotificationManager.removeAll();
        setError("img", {
          type: "manual",
          message: "Image is required for a new category",
        });
        setIsSubmitting(false);
        return;
      }

      if (data.img && data.img.size > 1 * 1024 * 1024) {
        NotificationManager.removeAll();
        setError("img", {
          type: "manual",
          message: "Image size must be 1MB or less",
        });
        setIsSubmitting(false);
        return;
      }

      const form = new FormData();
      form.append("title", data.title);
      form.append("status", data.status);

      if (formData.img) {
        form.append("img", formData.img);
      }

      if (id) {
        form.append("id", id);
      }

      await api.post("/category/upsert", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Category updated successfully!" : "Category added successfully!"
      );

      setTimeout(() => {
        navigate("/admin/category-list");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
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
        setFormData((prev) => ({ ...prev, img: null }));
        setImagePreview(null);
      } else if (
        error.response?.status === 400 &&
        errorMsg === "Image is required for a new category."
      ) {
        setError("img", {
          type: "manual",
          message: "Image is required for a new category",
        });
      } else {
        NotificationManager.error(
          errorMsg || (id ? "Failed to update category." : "Failed to add category.")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: "1", label: "Publish" },
    { value: "0", label: "Unpublish" },
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

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <SimpleHeader name={"Category Management"} />
          <div className="container">
            <div className="px-6">
              {isSubmitting || loading ? (
                <div className="flex justify-center items-center h-64 w-full">
                  <MilkLoader />
                </div>
              ) : (
                <div className="bg-white w-full rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex flex-col">
                        <label
                          htmlFor="title"
                          className="text-sm font-medium text-start"
                        >
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          name="title"
                          {...register("title", {
                            required: "Category name is required",
                          })}
                          type="text"
                          className="border rounded-lg p-3 mt-1 w-full h-14"
                          onChange={handleChange}
                          placeholder="Enter Category Title"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="img"
                          className="text-sm font-medium text-start"
                        >
                          Category Image {id ? "" : <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="file"
                          id="img"
                          name="img"
                          className="p-2 rounded"
                          {...register("img")}
                          onChange={handleChange}
                        />
                        {errors.img && (
                          <p className="text-red-500 text-sm">
                            {errors.img.message}
                          </p>
                        )}
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="status"
                          className="text-sm font-medium text-start"
                        >
                          Category Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                          {...register("status", {
                            required: "Category status is required",
                          })}
                          value={options.find(
                            (option) => option.value === watch("status")
                          )}
                          onChange={handleSelectChange}
                          options={options}
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
                        />
                        {errors.status && (
                          <p className="text-red-500 text-sm">
                            {errors.status.message}
                          </p>
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
                      {isSubmitting ? "Submitting..." : id ? "Update Category" : "Add Category"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default CategoryAdd;