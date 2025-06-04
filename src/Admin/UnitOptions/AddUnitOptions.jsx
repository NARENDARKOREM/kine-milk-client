import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";
import MilkLoader from "../../utils/MilkLoader";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useUnits } from "../../Context/UnitContext";

const AddUnitOptions = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { name: "", unit: "", status: "1" },
  });

  const location = useLocation();
  const navigate = useNavigate();
  const unitData = location.state?.unit || null;
  const { weight, volume } = useUnits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = unitData?.id || null;

  // Combine weight and volume units for the dropdown
  const unitOptions = [
    ...weight.map((u) => ({ value: u.value, label: u.label })),
    ...volume.map((u) => ({ value: u.value, label: u.label })),
  ];

  // Watch the unit and status fields to bind Select values
  const selectedUnit = watch("unit");
  const selectedStatus = watch("status");

  useEffect(() => {
    if (unitData) {
      setValue("name", unitData.name || "");
      setValue("unit", unitData.unit || "");
      setValue("status", unitData.status.toString() || "1");
    }
  }, [unitData, setValue]);

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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        unit: data.unit,
        status: parseInt(data.status),
      };
      if (id) payload.id = id;
      await api.post("/units/upsert", payload);
      NotificationManager.removeAll();
      NotificationManager.success(
        id ? "Unit updated successfully" : "Unit added successfully"
      );
      if (!id) reset();
      setTimeout(() => navigate("/admin/weight-volume-list"), 2000);
    } catch (error) {
      console.error("Error upserting unit:", error);
      NotificationManager.removeAll();
      NotificationManager.error(
        error.response?.data?.message || "Failed to save unit"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f7fbff] h-full">
     
        <>
          <Header />
          <SimpleHeader
            name={id ? "Edit Unit Management" : "Add Unit Management"}
          />
          <div className="container px-6">
            <div className="bg-white max-h-max w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
                <div className="flex w-full gap-x-4">
                  {/* Weight/Volume Input */}
                  <div className="flex flex-col w-full">
                    <label className="block text-left text-sm font-medium mb-1">
                      Weight/Volume <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("name", {
                        required: "Weight/Volume is required",
                        pattern: {
                          value: /^\d+(\.\d+)?$/,
                          message: "Enter a valid number (e.g., 1, 500, 0.5)",
                        },
                      })}
                      placeholder="Enter weight/volume (e.g., 1, 500, 0.5)"
                      className="w-full border border-gray-300 rounded p-2"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Unit Select */}
                  <div className="flex flex-col w-full">
                    <label className="block text-left text-sm font-medium mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <Select
                      {...register("unit", { required: "Unit is required" })}
                      options={unitOptions}
                      onChange={(selected) => setValue("unit", selected.value, { shouldValidate: true })}
                      value={unitOptions.find(
                        (option) => option.value === selectedUnit
                      )}
                      styles={customStyles}
                      placeholder="Select Unit"
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      components={{
                        DropdownIndicator: () => (
                          <AiOutlineDown className="w-4 h-4" />
                        ),
                        IndicatorSeparator: () => null,
                      }}
                      className="w-full"
                    />
                    {errors.unit && (
                      <p className="text-red-500 text-sm">{errors.unit.message}</p>
                    )}
                  </div>
                </div>

                {/* Status Select */}
                <div className="flex flex-col w-full mt-4">
                  <label className="block text-left text-sm font-medium mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register("status", { required: "Status is required" })}
                    options={statusOptions}
                    onChange={(selected) => setValue("status", selected.value, { shouldValidate: true })}
                    value={statusOptions.find(
                      (option) => option.value === selectedStatus
                    )}
                    styles={customStyles}
                    placeholder="Select Status"
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    components={{
                      DropdownIndicator: () => (
                        <AiOutlineDown className="w-4 h-4" />
                      ),
                      IndicatorSeparator: () => null,
                    }}
                    className="flex-grow"
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`mt-4 bg-[#393185] text-white py-2 px-4 rounded flex items-center justify-center ${
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
                  {isSubmitting ? "Submitting..." : id ? "Update Weight" : "Add Weight"}
                </button>
              </form>
            </div>
          </div>
          <NotificationContainer />
        </>
    
    </div>
  );
};

export default AddUnitOptions;