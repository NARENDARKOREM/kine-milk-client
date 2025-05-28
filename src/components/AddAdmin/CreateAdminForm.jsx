import React, { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import api from "../../utils/api"
const CreateAdminForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state ? location.state.id : null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch admin details if ID exists (for update)
  useEffect(() => {
    if (id) {
      api
        .get(`/admin/getById/${id}`)
        .then((response) => {
          const { email } = response.data;
          setValue("email", email); // Pre-fill email field
        })
        .catch((error) => {
          console.error("Error fetching admin details:", error);
          toast.error("Failed to fetch admin details");
        });
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      let response;
      if (id) {
        response = await api.patch(`/admin/updatepassword/${id}`, data);
      } else {
        response = await api.post("/admin/register", data);
      }

      if (response.status === 200) {
        toast.success(id ? "Admin updated successfully" : "Admin created successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error saving admin:", error);
      toast.error("Failed to save admin");
    }
  };

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <InnerHeader name={"Admin Management"} />
      <div className=" p-6 w-full">
        <div className="container">
          <h2 className="text-xl font-bold mb-4">{id ? "Edit Admin" : "Create Admin"}</h2>
         <div className="bg-white max-h-[50vh] w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
         <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm text-left font-medium mb-2">Email</label>
              <input
                type="text"
                {...register("email", { required: "Email is required" })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm text-left font-medium mb-2">Password</label>
              <input
                type="password"
                {...register("password", id ? {} : { required: "Password is required" })} 
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#393185] text-white px-4 py-2 rounded-lg"
              >
                {id ? "Update" : "Create"}
              </button>
            </div>
          </form>
         </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminForm;
