import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../common/Header";
import InnerHeader from "./FaqHeader";
import ProductInventoryTable from "../Store/ProductInventory/ProductInventoryTable";
import api from "../utils/api";
import { handleSort } from "../utils/sorting";
import { StatusEntity } from "../utils/StatusEntity";
import { DeleteEntity } from "../utils/DeleteEntity";
import { ReactComponent as Edit } from "../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../assets/images/Delete.svg";

const FaqList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [faq, setFaq] = useState([]);
  const [filteredFaq, setFilteredFaq] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFaq = async () => {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/faq/all");
        console.log("Fetched FAQs:", response.data);
        const faqData = response.data || [];
        setFaq(faqData);
        setFilteredFaq(faqData);
        setTotalPages(Math.ceil(faqData.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        NotificationManager.error("Failed to fetch FAQs", "Error", 3000);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    };
    fetchFaq();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = faq.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(querySearch)
            )
          : String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredFaq(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const sortData = (key) => {
    handleSort(filteredFaq, key, sortConfig, setSortConfig, setFilteredFaq);
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("FAQ", id);
    if (success) {
      const updatedFaq = faq.filter((f) => f.id !== id);
      setFaq(updatedFaq);
      setFilteredFaq(updatedFaq);
      setTotalPages(Math.ceil(updatedFaq.length / itemsPerPage));
      NotificationManager.success("FAQ deleted successfully", "Success", 3000);
    } else {
      NotificationManager.error("Failed to delete FAQ", "Error", 3000);
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-faq", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("FAQ", id, currentStatus, setFilteredFaq, filteredFaq, field);
      NotificationManager.success("FAQ status updated successfully", "Success", 3000);
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
      NotificationManager.error("Failed to update FAQ status", "Error", 3000);
    }
  };

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = ["S.No.", "FAQ Question", "FAQ Answer", "Status"];

  const fields = ["index", "question", "answer", "status"];

  const tableData = filteredFaq
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((faq, index) => ({
      id: faq.id,
      index: (page - 1) * itemsPerPage + index + 1,
      question: faq.question || "N/A",
      answer: faq.answer || "N/A",
      status: renderStatus(faq.status, faq.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="FAQ Management" />
        <ProductInventoryTable
          columns={columns}
          data={tableData}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          fields={fields}
          showLoader={showLoader}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleToggleChange={handleToggleChange}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          totalItems={filteredFaq.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default FaqList;