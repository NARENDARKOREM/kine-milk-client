import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api"
const Account = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [refresh, setRefresh] = useState(false); // State to trigger re-fetch

  useEffect(() => {
    // Get token from cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("u_token="))
      ?.split("=")[1];

    if (!token) {
      NotificationManager.error("Token is missing", "Error");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (!decodedToken.id) {
        NotificationManager.error("Invalid token structure", "Error");
        return;
      }
      setAdminId(decodedToken.id);
    } catch (error) {
      NotificationManager.error("Failed to decode token", "Error");
    }
  }, []);

  useEffect(() => {
    if (!adminId) return;

    // Fetch profile details
    const fetchProfile = async () => {
      try {
        const response = await api.get(
          `/admin/getById/${adminId}`,
          { headers: { Authorization: `Bearer ${document.cookie}` } }
        );
        setValue("email", response.data.email); // Set email in form
      } catch (error) {
        NotificationManager.error("Failed to fetch profile", "Error");
      }
    };

    fetchProfile();
  }, [adminId, refresh]); // Refetch on `refresh` state change

  const onSubmit = async (data) => {
    try {
      if (!data.password || data.password.length === 0) {
        NotificationManager.error("Please enter a password", "Failed");
        return; // Stop execution if password is empty
      }
      
      await api.patch(
        `/admin/updatepassword/${adminId}`,
        { email: data.email, password: data.password },
        { headers: { Authorization: `Bearer ${document.cookie}` } }
      );

      NotificationManager.success("Profile updated successfully", "Success");

      // Clear the password field after update
      reset({ password: "" });

      // Trigger re-fetch instead of reloading
      setRefresh((prev) => !prev);
    } catch (error) {
      NotificationManager.error("Failed to update profile", "Error");
    }
  };

  return (
    <div>
      <Header />
      <SimpleHeader name="Profile Management" />
      <div className="w-[70vw] mt-5 max-w-[80vw] mx-auto bg-white shadow-2xl rounded-md px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
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
              Update Profile
            </button>
          </div>
        </form>
      </div>

      <NotificationContainer />
    </div>
  );
};

export default Account;
