import axios from "axios";
import { NotificationManager } from "react-notifications";
import Cookies from "js-cookie";

// const api = "http://localhost:5001";
// const api = "https://kine-server-dev.vercel.app"
const api = "https://kine-milk-server-five.vercel.app/"

export const StatusEntity = async (
  entityType,
  id,
  currentStatus,
  setData,
  data,
  field = "status"
) => {
  const token = Cookies.get("u_token");

  // Common headers for authentication
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    let url;

    switch (entityType) {
      case "Category":
        url = `${api}/category/toggle-status`;
        break;
      case "Product":
        url = `${api}/product/toggle-status`;
        break;
      case "productAttribute":
        url = `${api}/product-attribute/toggle-status`;
        break;
      case "productImage":
        url = `${api}/product-images/toggle-status`;
        break;
      case "Delivery":
        url = `${api}/delivery/toggle-status`;
        break;
      case "Coupon":
        url = `${api}/coupon/toggle-status`;
        break;
      case "Rider":
        url = `${api}/rider/toggle-status`;
        break;
      case "FAQ":
        url = `${api}/faq/toggle-status`;
        break;
      case "Time":
        url = `${api}/time/toggle-status`;
        break;
      case "FAQ'S":
        url = `${api}/faqs/toggle-status`;
        break;
      case "Country":
        url = `${api}/countries/toggle-status`;
        break;
      case "Stores":
        url = `${api}/store/toggle-status`;
        break;
      case "Users":
        url = `${api}/user/toggle-status`;
        break;
      case "Banner":
        url = `${api}/banner/toggle-status`;
        break;
      case "Illustration":
        url = `${api}/illustration/toggle-status`;
        break;
      case "Ads":
        url = `${api}/ads/toggle-status`;
        break;
      case "CarryBag":
        url = `${api}/carrybag/toggle-status`;
        break;
      case "productInventory":
        url = `${api}/productinventory/toggle-status`;
        break;
      case "RiderTimeSlot":
        url = `${api}/rider-time/toggle-status`;
        break;
      case "Unit":
        url = `${api}/units/update-status`;
        break;
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    // Log the URL and request payload for debugging
    console.log(`URL: ${url}`);
    console.log(
      `Request Payload: id=${id}, field=${field}, value=${newStatus}`
    );

    // Send the request to toggle the status with headers
    const response = await axios.patch(
      url,
      {
        id,
        field,
        value: newStatus,
      },
      {
        withCredentials: true,
        headers,
      }
    );

    // Update the local state if successful
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, [field]: newStatus } : item
    );
    console.log("Updated Data:", updatedData);
    setData(updatedData);
    NotificationManager.removeAll();
    NotificationManager.success(`${entityType} ${field} updated successfully!`);
  } catch (error) {
    console.error("Error updating status:", error);
    NotificationManager.removeAll();
    NotificationManager.error(
      error.response?.data?.ResponseMsg || "An error occurred while updating the status."
    );
  }
};