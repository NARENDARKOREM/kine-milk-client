import axios from "axios";
import { NotificationManager } from "react-notifications";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export const DeleteEntity = async (entity, id) => {
  // const BASE_URL = `http://localhost:5001`;
  // const BASE_URL= "https://kine-server-dev.vercel.app"
  const BASE_URL= "https://kine-milk-server-six.vercel.app"
  const token = Cookies.get("u_token");

  console.log(`Deleting ${entity} with ID ${id}, Token: ${token}`); // Debug token
  if (!token) {
    NotificationManager.error("Authentication token is missing. Please log in again.");
    throw new Error("Missing authentication token");
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#393185",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const endpoints = {
        productAttribute: `/product-attribute/delete/${id}`,
        Category: `/category/delete/${id}`,
        Banner: `/banner/deletebannerbyid/${id}`,
        Illustration: `/illustration/delete-illustration/${id}`,
        Ads: `/ads/delete-ads/${id}`,
        CarryBag: `/carrybag/delete/${id}`,
        productimages: `/product-images/delete/${id}`,
        Coupon: `/coupon/delete/${id}`,
        Delivery: `/delivery/delete/${id}`,
        Product: `/product/delete/${id}`,
        product_Inventory: `/productinventory/delete/${id}?forceDelete=true`,
        Time: `/time/delete/${id}`,
        Propoties: `/properties/delete/${id}`,
        ExtraImages: `/extra/delete/${id}`,
        Rider: `/rider/delete/${id}`,
        GalleryCategory: `/galleryCategories/delete/${id}`,
        Package: `/packages/delete/${id}`,
        Page: `/pages/delete/${id}`,
        FAQ: `/FAQ/delete/${id}`,
        UserList: `/users/user/delete/${id}?forceDelete=true`,
        Admin: `/admin/delete/${id}?forceDelete=true`,
        Role: `/rollrequest/delete/${id}?forceDelete=true`,
        Property: `/properties/delete/${id}?forceDelete=true`,
        RiderTimeSlot: `/rider-time/delete/${id}`,
        Unit: `/units/delete/${id}`,
      };

      const endpoint = endpoints[entity];
      if (!endpoint) {
        console.error(`Invalid entity: ${entity}`);
        throw new Error(`Unknown entity: ${entity}`);
      }

      const response = await axios.delete(`${BASE_URL}${endpoint}`, {
        withCredentials: true,
        headers,
      });

      console.log("Server response:", response.data);
      NotificationManager.success(`${entity} deleted successfully!`);
      return true; // Return true for successful deletion
    } else {
      console.log(`Deletion of ${entity} ${id} cancelled`);
      NotificationManager.info(`${entity} deletion was cancelled.`);
      return false; // Return false for cancellation
    }
  } catch (error) {
    console.error(`Failed to delete ${entity}:`, error.response?.data || error.message);
    NotificationManager.error(`Failed to delete ${entity}: ${error.response?.data?.message || error.message}`);
    throw error; // Re-throw error for caller to handle
  }
};