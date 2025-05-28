import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { StatusEntity } from "../../utils/StatusEntity";
import api from "../../utils/api";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import { handleSort } from "../../utils/sorting";
import MilkLoader from "../../utils/MilkLoader";
import { ReactComponent as LeftArrow } from "../../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../../assets/images/Right Arrow.svg";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/user/getusers");
        if (response.data) {
          setUsers(response.data || []);
          setFilteredUsers(response.data || []);
        }
      } catch (error) {
        NotificationManager.error("Failed to fetch users", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => setShowLoader(false), 2000);
      }
    }
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(query)
            )
          : String(value || "").toLowerCase().includes(query)
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleToggleChange = async (id, currentStatus) => {
    try {
      await StatusEntity(
        "Users",
        id,
        currentStatus,
        setFilteredUsers,
        filteredUsers,
        "status"
      );
    } catch (error) {
      NotificationManager.error("Failed to toggle status", "Error", 3000);
    }
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = Array.isArray(filteredUsers)
    ? filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
    : [];
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const sortData = (key) => {
    handleSort(filteredUsers, key, sortConfig, setSortConfig, setFilteredUsers);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"User Management"} />
        <div className="p-4 flex-1 overflow-auto scrollbar-color h-[78vh]">
          <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
            <table className="w-full text-[12px]" aria-label="Users list table">
              <thead className="text-[12px] text-black font-bold">
                <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
                  <th className="p-2 font-medium text-left">
                    Sr. No
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("id")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("id")}
                      />
                    </div>
                  </th>
                  <th className="p-2 font-medium text-left">
                    Name
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("name")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("name")}
                      />
                    </div>
                  </th>
                  <th className="p-2 font-medium text-left">
                    Email
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("email")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("email")}
                      />
                    </div>
                  </th>
                  <th className="p-2 font-medium text-left">
                    Mobile
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("mobile")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("mobile")}
                      />
                    </div>
                  </th>
                  <th className="p-2 font-medium text-left">
                    Join Date
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("registartion_date")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("registartion_date")}
                      />
                    </div>
                  </th>
                  <th className="p-2 font-medium text-left">
                    Status
                    <div className="inline-flex items-center ml-2">
                      <GoArrowUp
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("status")}
                      />
                      <GoArrowDown
                        className="text-black hover:text-gray-700 cursor-pointer"
                        onClick={() => sortData("status")}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {showLoader ? (
                  <tr>
                    <td colSpan="6" className="text-center py-2">
                      <div className="flex justify-center items-center h-64 w-full">
                        <MilkLoader />
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user.id} className="border-b border-[#F3E6F2]">
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {user.name || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {user.email || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {user.mobile || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {user?.registartion_date
                          ? user.registartion_date.split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        <FontAwesomeIcon
                          className="w-5 h-5 cursor-pointer"
                          style={{
                            color: user.status === 1 ? "#393185" : "#e9ecef",
                          }}
                          icon={user.status === 1 ? faToggleOn : faToggleOff}
                          onClick={() => handleToggleChange(user.id, user.status)}
                          aria-label={`Toggle status for user ${user.id}`}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-4 px-4">
              <div className="text-[#71717A] font-medium text-[12px]">
                Showing <span className="text-black">{startItem}-{endItem}</span>{" "}
                of <span className="text-black">{filteredUsers.length}</span>{" "}
                items
              </div>
              <div className="flex items-center font-medium text-[12px] gap-4">
                <button
                  className={`flex items-center gap-2 bg-[#F3E6F2] p-2 rounded ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <LeftArrow className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-[#393185]">
                  Page {String(currentPage).padStart(2, "0")} of{" "}
                  {String(totalPages).padStart(2, "0")}
                </div>
                <button
                  className={`flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <RightArrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default UsersList;