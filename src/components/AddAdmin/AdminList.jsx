import React, { useEffect, useState } from "react";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Addadminheader from "./Addadminheader";
import { handleSort } from "../../utils/sorting";
import api from "../../utils/api";
import MilkLoader from "../../utils/MilkLoader";
import { ReactComponent as LeftArrow } from "../../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../../assets/images/Right Arrow.svg";
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";
const AdminList = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/admin/count");
        setAdmins(response.data.admins || []);
        setFilteredAdmins(response.data.admins || []);
      } catch (error) {
        NotificationManager.error("Failed to fetch admins", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => setShowLoader(false), 2000);
      }
    };

    fetchAdmins();
  }, []);

 const handleSearch = (event) => {
  const querySearch = event?.target?.value?.toLowerCase() || "";
  if (!admins) return;

  const filteredData = admins.filter((admin) =>
    (admin.email ?? "").toLowerCase().includes(querySearch)
  );

  setFilteredAdmins(filteredData);
  setCurrentPage(1);
};


  const indexOfLastAdmin = currentPage * itemsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - itemsPerPage;
  const currentAdmins = Array.isArray(filteredAdmins)
    ? filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin)
    : [];
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const response = await api.delete(`/admin/delete/${id}`);
      if (response.status === 200) {
        NotificationManager.success("Admin deleted successfully", "Success", 3000);
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
        setFilteredAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.id !== id)
        );
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      NotificationManager.error("Failed to delete admin", "Error", 3000);
    }
  };

  const sortData = (key) => {
    handleSort(filteredAdmins, key, sortConfig, setSortConfig, setFilteredAdmins);
  };

  const handleEdit = (id) => {
    navigate("/admin/add-admin", { state: { id } });
  };

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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAdmins.length);

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <Addadminheader onSearch={handleSearch} name={"Admin Management"} />
        <div className="p-4 flex-1 overflow-auto scrollbar-color h-[78vh]">
          <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
            <table className="w-full text-[12px]" aria-label="Admin list table">
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
                  <th className="p-2 font-medium text-left">Password</th>
                  <th className="p-2 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {showLoader ? (
                  <tr>
                    <td colSpan="4" className="text-center py-2">
                      <div className="flex justify-center items-center h-64 w-full">
                        <MilkLoader />
                      </div>
                    </td>
                  </tr>
                ) : currentAdmins.length > 0 ? (
                  currentAdmins.map((admin, index) => (
                    <tr key={admin.id} className="border-b border-[#F3E6F2]">
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {indexOfFirstAdmin + index + 1}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {admin.email || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        ••••••••
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Edit
                            className="w-5 h-5 text-green-500 cursor-pointer"
                            onClick={() => handleEdit(admin.id)}
                            aria-label={`Edit admin ${admin.id}`}
                          />
                          <Delete
                            className="w-5 h-5 text-red-500 cursor-pointer"
                            onClick={() => handleDelete(admin.id)}
                            aria-label={`Delete admin ${admin.id}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                    >
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-4 px-4">
              <div className="text-[#71717A] font-medium text-[12px]">
                Showing <span className="text-black">{startItem}-{endItem}</span>{" "}
                of <span className="text-black">{filteredAdmins.length}</span>{" "}
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

export default AdminList;