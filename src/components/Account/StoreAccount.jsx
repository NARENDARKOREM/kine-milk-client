import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import SimpleHeader from "../../common/SimpleHeader";
import api from "../../utils/api"
const StoreAccount = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [storeId, setStoreId] = useState("");
  const [refresh, setRefresh] = useState(false); // State to trigger refetch

  useEffect(() => {
    // Get role and store_id from cookies
    const roleCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    const storeIdCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("store_id="))
      ?.split("=")[1];

    if (!roleCookie) {
      NotificationManager.error("Role is missing", "Error");
      return;
    }
    setRole(roleCookie);

    if (!storeIdCookie) {
      NotificationManager.error("Store ID is missing", "Error");
      return;
    }
    setStoreId(storeIdCookie);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    // Fetch store details
    const fetchStoreDetails = async () => {
      try {
        const response = await api.get(`/store/fetch/${storeId}`);
        console.log(response, "Fetched store data");
        setValue("email", response.data.store.email);
      } catch (error) {
        console.error("Error fetching store details:", error);
        NotificationManager.error("Failed to fetch store details", "Error");
      }
    };

    fetchStoreDetails();
  }, [storeId, refresh]); // Refetch on `refresh` state change

  // Reset password field when storeId changes
  useEffect(() => {
    reset({ password: "" });
  }, [storeId, reset]);

  const onSubmit = async (data) => {
    try {
      if (!data.password || data.password.length === 0) {
        NotificationManager.error("Please enter a password", "Failed");
        return; // Stop execution if password is empty
      }
      
      await api.put(`/store/update-email-password/${storeId}`, {
        email: data.email,
        password: data.password,
      });
      
      NotificationManager.success("Password updated successfully", "Success");

      // Reset password field after update
      reset({ password: "" });

      // Trigger re-fetch instead of reloading
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating password:", error);
      NotificationManager.error("Failed to update password", "Error");
    }
  };

  return (
    <div>
      <Header />
      <SimpleHeader name="Store Profile Management" />
      <div className="w-[70vw] mt-5 max-w-[80vw] mx-auto bg-white shadow-2xl rounded-md px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field (Disabled) */}
          <div className="mb-4">
            <label className="block text-gray-700 text-left mb-1">Email:</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-left"
              disabled
            />
          </div>

          {/* Password Field */}
          <div className="mb-4 relative">
            <label className="block text-gray-700 text-left mb-1">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-left"
            />
            <span
              className="absolute right-3 top-10 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-[#393185] text-white px-4 py-2 rounded sm:w-auto"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      <NotificationContainer />
    </div>
  );
};

export default StoreAccount;
