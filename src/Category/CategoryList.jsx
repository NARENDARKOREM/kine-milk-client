import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../common/Header";
import InnerHeader from "../Category/CategoryHeader";
import ProductInventoryTable from "../Store/ProductInventory/ProductInventoryTable";
import api from "../utils/api";
import { StatusEntity } from "../utils/StatusEntity";
import { handleSort } from "../utils/sorting";
import { DeleteEntity } from "../utils/DeleteEntity";
import { ReactComponent as Edit } from "../assets/images/Edit.svg";
import { ReactComponent as Delete } from "../assets/images/Delete.svg";

const CategoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/category/all");
        console.log("Fetched categories:", response.data);
        const categoryData = response.data.categories || [];
        setCategories(categoryData);
        setFilteredCategories(categoryData);
        setTotalPages(Math.ceil(categoryData.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching categories:", error);
        NotificationManager.error("Error fetching categories", "Error");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 2000);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (event) => {
    const querySearch = event.target.value.toLowerCase();
    const filteredData = categories.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some((nestedValue) =>
              String(nestedValue || "").toLowerCase().includes(querySearch)
            )
          : String(value || "").toLowerCase().includes(querySearch)
      )
    );
    setFilteredCategories(filteredData);
    setPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const sortData = (key) => {
    handleSort(filteredCategories, key, sortConfig, setSortConfig, setFilteredCategories);
  };

  const handleDelete = async (id) => {
    const success = await DeleteEntity("Category", id);
    if (success) {
      const updatedCategories = categories.filter((category) => category.id !== id);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setTotalPages(Math.ceil(updatedCategories.length / itemsPerPage));
      NotificationManager.success("Category deleted successfully", "Success");
    }
  };

  const handleEdit = (id) => {
    navigate("/admin/add-category", { state: { id } });
  };

  const handleToggleChange = async (id, currentStatus, field) => {
    try {
      await StatusEntity("Category", id, currentStatus, setFilteredCategories, filteredCategories, field);
      NotificationManager.success("Category status updated successfully", "Success");
    } catch (error) {
      console.error("Error toggling category status:", error);
      NotificationManager.error("Error updating category status", "Error");
    }
  };

  const renderImage = (img) => (
    <img
      src={img || "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"}
      alt="Category"
      className="w-10 h-10 object-cover rounded-full"
      onError={(e) =>
        (e.target.src =
          "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg")
      }
      height={50}
      width={50}
      loading="lazy"
    />
  );

  const renderStatus = (status, id) => (
    <FontAwesomeIcon
      className="h-7 w-16 cursor-pointer"
      style={{ color: status === 1 ? "#0064DC" : "#e9ecef" }}
      icon={status === 1 ? faToggleOn : faToggleOff}
      onClick={() => handleToggleChange(id, status, "status")}
    />
  );

  const columns = ["S.No.", "Category Title", "Category Image", "Status"];

  const fields = ["index", "title", "image", "status"];

  const tableData = filteredCategories
    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
    .map((category, index) => ({
      id: category.id,
      index: (page - 1) * itemsPerPage + index + 1,
      title: category.title || "N/A",
      image: renderImage(category.img),
      status: renderStatus(category.status, category.id),
    }));

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name="Category Management" />
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
          totalItems={filteredCategories.length}
          itemsPerPage={itemsPerPage}
          sortData={sortData}
        />
        <NotificationContainer />
      </div>
    </div>
  );
};

export default CategoryList;