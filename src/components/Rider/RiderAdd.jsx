import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../common/Header";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ClipLoader } from "react-spinners";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Cookies from "js-cookie";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";

const RiderAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();
  const [isSubmitting, setisSubmitting] = useState(false);
  const [store_id, setStore_id] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    img: null,
    mobile: "",
    email: "",
    password: "",
    status: "",
    store_id: "",
    rdate: new Date().toISOString().split("T")[0],
    ride_timeslots: [],
  });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData((prevData) => ({ ...prevData, [name]: files }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setValue(name, value, { shouldValidate: true });
    }
    await trigger(name);
  };

  useEffect(() => {
    const store_id_from_cookie = Cookies.get("store_id");
    setStore_id(store_id_from_cookie);
    setFormData((prev) => ({ ...prev, store_id: store_id_from_cookie }));
    setValue("store_id", store_id_from_cookie);
  }, [setValue]);

  useEffect(() => {
    if (store_id) {
      const fetchTimeSlots = async () => {
        try {
          const response = await api.get(`/rider-time/getbystore/${store_id}`);
          setTimeSlots(response.data);
        } catch (error) {
          console.error("Error fetching time slots:", error);
          NotificationManager.removeAll();
          NotificationManager.error("Failed to load rider time slots.");
        }
      };
      fetchTimeSlots();
    }
  }, [store_id]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/rider/getbyid/${id}`);
          if (response.data) {
            const fetchedData = response.data;
            setFormData({
              ...fetchedData,
              rdate:
                fetchedData.rdate || new Date().toISOString().split("T")[0],
              store_id: fetchedData.store_id || store_id,
              ride_timeslots: fetchedData.ride_timeslots || [],
            });
            Object.entries(fetchedData).forEach(([key, value]) =>
              setValue(key, value)
            );
          }
        } catch (error) {
          console.error("Error fetching rider details:", error);
          NotificationManager.error("Failed to load rider details.");
        }
      };
      fetchData();
    }
  }, [id, setValue, store_id]);

  const onSubmit = async (data) => {
    try {
      setisSubmitting(true);
      const form = new FormData();
      form.append("title", data.title);
      form.append("mobile", data.mobile);
      form.append("email", data.email);
      form.append("password", data.password);
      form.append("status", data.status);
      form.append("store_id", store_id);
      form.append("rdate", new Date().toISOString().split("T")[0]);
      form.append("ride_timeslots", JSON.stringify(formData.ride_timeslots));

      if (id) {
        form.append("id", id);
      }
      if (!data.status) {
        NotificationManager.error("Rider status is required.");
        return;
      }
      if (data.img && data.img[0]) {
        form.append("img", data.img[0]);
      } else if (!id) {
        NotificationManager.error("Rider image is required.");
        return;
      }

      const response = await api.post("/rider/upsert", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Rider updated successfully!" : "Rider added successfully!"
      );

      setTimeout(() => {
        navigate("/store/rider-list");
      }, 2000);
    } catch (error) {
      console.error("Error submitting Rider:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.ResponseMsg
      ) {
        NotificationManager.removeAll();
        NotificationManager.error(error.response.data.ResponseMsg);
      } else {
        NotificationManager.removeAll();
        NotificationManager.error("An unexpected error occurred.");
      }
    } finally {
      setisSubmitting(false);
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = Array.isArray(selectedOption)
      ? selectedOption.map((opt) => opt.value)
      : selectedOption.value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setValue(name, value, { shouldValidate: true });
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

  const timeSlotOptions = timeSlots.map((slot) => ({
    value: slot.id,
    label: `${slot.mintime} - ${slot.maxtime}`,
  }));

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <div className="container">
            <div className="flex items-center mt-6 mb-4 ml-6">
              <Link onClick={() => navigate(-1)} className="cursor-pointer text-[#393185]">
                <ArrowBackIosNewIcon />
              </Link>
              <h2
                className="text-lg font-semibold ml-4"
                style={{
                  color: "#393185",
                  fontSize: "24px",
                  fontFamily: "Montserrat",
                }}
              >
                {id ? "Edit Rider" : "Add Rider"}
              </h2>
            </div>

            <div className="h-full px-6 max-w-5xl">
              <div className="bg-white h-[67vh] w-[78vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Rider Name */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="rider_name"
                        className="text-sm font-medium text-start"
                      >
                        Rider Name
                      </label>
                      <input
                        id="rider_name"
                        name="title"
                        {...register("title", {
                          required: "Rider name is required",
                        })}
                        value={formData.title}
                        type="text"
                        className="border rounded-lg p-3 mt-1 w-full h-14"
                        onChange={handleChange}
                        placeholder="Enter Rider Name"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm text-start">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Rider Email */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="rider_email"
                        className="text-sm font-medium text-start"
                      >
                        Rider Email
                      </label>
                      <input
                        id="rider_email"
                        name="email"
                        {...register("email", {
                          required: "Rider email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address",
                          },
                        })}
                        value={formData.email}
                        type="text"
                        className="border rounded-lg p-3 mt-1 w-full h-14"
                        onChange={handleChange}
                        placeholder="Enter Rider Email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm text-start">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Rider Mobile Number */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="rider_mobile"
                        className="text-sm font-medium text-start"
                      >
                        Rider Mobile Number
                      </label>
                      <input
                        id="rider_mobile"
                        name="mobile"
                        {...register("mobile", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Mobile number must be 10 digits",
                          },
                        })}
                        value={formData.mobile}
                        type="text"
                        className="border rounded-lg p-3 mt-1 w-full h-14"
                        onChange={handleChange}
                        placeholder="Enter Rider Mobile Number"
                      />
                      {errors.mobile && (
                        <p className="text-red-500 text-sm text-start">
                          {errors.mobile.message}
                        </p>
                      )}
                    </div>

                    {/* Rider Password */}
                    <div className="flex flex-col relative">
                      <label
                        htmlFor="rider_password"
                        className="text-sm font-medium text-start"
                      >
                        Rider Password
                      </label>
                      <div className="relative w-full">
                        <input
                          id="rider_password"
                          name="password"
                          {...register("password", {
                            required: id ? false : "Password is required",
                            minLength: {
                              value: 6,
                              message:
                                "Password must be at least 6 characters long",
                            },
                          })}
                          value={formData.password}
                          type={showPassword ? "text" : "password"}
                          className="border rounded-lg p-3 mt-1 w-full h-14 pr-10"
                          onChange={handleChange}
                          placeholder="Enter Rider Password"
                        />
                        <span
                          className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </span>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm text-start">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Status
                      </label>
                      <Select
                        value={statusOptions.find(
                          (option) => option.value === formData.status.toString()
                        )}
                        onChange={(option) =>
                          handleSelectChange("status", option)
                        }
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

                    {/* Rider Time Slots */}
                    <div className="flex flex-col">
                      <label className="text-sm text-left font-medium">
                        Rider Time Slots
                      </label>
                      <Select
                        isMulti
                        value={timeSlotOptions.filter((option) =>
                          formData.ride_timeslots.includes(option.value)
                        )}
                        onChange={(options) =>
                          handleSelectChange("ride_timeslots", options)
                        }
                        options={timeSlotOptions}
                        styles={customStyles}
                        placeholder="Select Time Slots"
                        components={{
                          DropdownIndicator: () => (
                            <AiOutlineDown className="w-4 h-4" />
                          ),
                          IndicatorSeparator: () => null,
                        }}
                      />
                      {errors.ride_timeslots && (
                        <p className="text-red-500 text-sm">
                          {errors.ride_timeslots.message}
                        </p>
                      )}
                    </div>

                    {/* Rider Image */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="img"
                        className="text-sm font-medium text-start"
                      >
                        Rider Image
                      </label>
                      <input
                        type="file"
                        id="img"
                        name="img"
                        {...register("img", {
                          required: id ? false : "Rider image is required",
                        })}
                        className="border rounded-lg p-3 mt-1 w-full h-14"
                        onChange={(e) => {
                          setFormData({ ...formData, img: e.target.files });
                        }}
                      />
                      {formData.img && typeof formData.img === "string" && (
                        <div className="mt-4">
                          <img
                            src={formData.img}
                            alt="Uploaded Preview"
                            className="w-32 h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      {errors.img && (
                        <p className="text-red-500 text-sm text-start">
                          {errors.img.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
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
    ? "Update Rider"
    : "Add Rider"}
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

export default RiderAdd;