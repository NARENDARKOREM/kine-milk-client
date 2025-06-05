import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../../common/Header";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { NotificationContainer, NotificationManager } from "react-notifications";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "../../utils/api";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";

const TimeslotAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const [store_id, setStore_id] = useState("");
  const [formData, setFormData] = useState({
    store_id: "",
    mintime: "",
    maxtime: "",
    status: "",
  });
  const [isSubmitting,setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch,
  } = useForm();

  useEffect(() => {
    const token = Cookies.get("token");
    const storeIdFromCookie = Cookies.get("store_id");

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded, "decoded token");
    }

    if (storeIdFromCookie) {
      setStore_id(storeIdFromCookie);
      setFormData((prev) => ({ ...prev, store_id: storeIdFromCookie }));
      setValue("store_id", storeIdFromCookie);
    }

    if (id) {
      fetchTimeSlot(id);
    }
  }, [id, setValue]);

  const fetchTimeSlot = async (id) => {
    try {
      const response = await api.get(`/time/getbyid/${id}`);
      const fetchedData = response.data;

      setFormData({
        store_id: fetchedData.store_id || store_id,
        mintime: fetchedData.mintime || "",
        maxtime: fetchedData.maxtime || "",
        status: fetchedData.status || "",
      });

      Object.entries(fetchedData).forEach(([key, value]) => setValue(key, value));
    } catch (error) {
      NotificationManager.removeAll();
      NotificationManager.error("Failed to load TimeSlot details.");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValue(name, value, { shouldValidate: true });
    await trigger(name);
  };

  const handleSelectChange = (selectedOption) => {
    const statusValue = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({
      ...prevData,
      status: statusValue,
    }));
    setValue("status", statusValue, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Check status first and return early if missing
      if (!data.status) {
        NotificationManager.removeAll();
        NotificationManager.error("Time slot status is required.");
        return; // Stop execution here
      }
  
      const payload = {
        store_id: store_id,
        mintime: data.mintime,
        maxtime: data.maxtime,
        status: data.status,
      };
  
      if (id) payload.id = id;
  
      await api.post(`/time/upsert/${store_id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Time Slot Updated Successfully" : "Time Slot Added Successfully"
      );
      setTimeout(() => navigate("/store/rider-timeslot"), 2000);
    } catch (error) {
      NotificationManager.removeAll();
      NotificationManager.error(error.message || "An error occurred");
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

  return (
    <div className="flex bg-[#f7fbff] h-full">
      <main className="flex-grow">
        <Header /> 
        <div className="container">
          <div className="flex items-center mt-6 mb-4 ml-6">
            <Link onClick={() => navigate(-1)} className="cursor-pointer text-[#393185]">
              <ArrowBackIosNewIcon />
            </Link>
            <h2
              className="text-lg font-semibold ml-4"
              style={{ color: "#393185", fontSize: "24px", fontFamily: "Montserrat" }}
            >
              {id ? "Edit Time Slot" : "Add Time Slot"}
            </h2>
          </div>

          <div className="h-full px-6 max-w-5xl">
            <div className="bg-white h-[67vh] w-[78vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Min Time */}
                  <div className="flex flex-col">
                    <label htmlFor="mintime" className="text-sm font-medium text-start">
                      Min Time<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mintime"
                      name="mintime"
                      {...register("mintime", { required: "Min Time is required" })}
                      type="time"
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      onChange={handleChange}
                    />
                    {errors.mintime && (
                      <p className="text-red-500 text-sm text-start">
                        {errors.mintime.message}
                      </p>
                    )}
                  </div>

                  {/* Max Time */}
                  <div className="flex flex-col">
                    <label htmlFor="maxtime" className="text-sm font-medium text-start">
                      Max Time<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="maxtime"
                      name="maxtime"
                      {...register("maxtime", { required: "Max Time is required" })}
                      type="time"
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      onChange={handleChange}
                    />
                    {errors.maxtime && (
                      <p className="text-red-500 text-sm text-start">
                        {errors.maxtime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col mt-6">
                  <label htmlFor="status" className="text-sm font-medium text-start">
                    Status<span className="text-red-500">*</span>
                  </label>
                  <Select
                     value={statusOptions.find(
                      (option) => option.value === formData.status.toString()
                    )}
                    onChange={handleSelectChange}
                    options={statusOptions}
                    styles={customStyles}
                    placeholder="Select Status"
                    isSearchable={false}
                    components={{
                      DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                      IndicatorSeparator: () => null,
                    }}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm text-start">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
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
    ? "Update Time Slot"
    : "Add Time Slot"}
</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <NotificationContainer />
    </div>
  );
};

export default TimeslotAdd;