import React, { useState } from "react";
import { ReactComponent as Delete } from "../../assets/images/Delete.svg";
import { ReactComponent as Edit } from "../../assets/images/Edit.svg";
import { ReactComponent as LeftArrow } from "../../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../../assets/images/Right Arrow.svg";
import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import MilkLoader from "../../utils/MilkLoader";

const ProductInventoryTable = ({
  columns,
  data,
  page,
  totalPages,
  setPage,
  fields,
  showLoader,
  handleEdit,
  handleDelete,
  handleToggleChange,
  handleInventoryClick,
  setSelectedItems,
  selectedItems,
  totalItems,
  itemsPerPage = 10,
  showActions = true,
  sortConfig, // Added for sorting
  setSortConfig, // Added for sorting
  handleSort, // Added for sorting
}) => {
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems || data.length);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allItems = data.map((item) => item.id);
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (event, itemId) => {
    if (event.target.checked) {
      setSelectedItems((prevState) => [...prevState, itemId]);
    } else {
      setSelectedItems((prevState) => prevState.filter((id) => id !== itemId));
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Map fields to sort keys (consistent with CompletedOrder)
  const sortKeyMap = {
    index: "id",
    order_id: "id",
    order_date: "odate",
    delivery_executive_name: "riders.title",
    user_name: "user.name",
    status: "status",
  };

  return (
    <div className="userlist-container p-4 flex-1 overflow-auto scrollbar-color h-[78vh]">
      <div className="usertable-container bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
        <table className="w-full table text-[12px]">
          <thead className="text-[12px] text-black font-bold">
            <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
              {/* <th className="p-2 text-center text-[15px]">
                <input
                  type="checkbox"
                  className="border-none cursor-pointer th-checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems?.length === data?.length}
                />
              </th> */}
              {columns.map((column, index) => {
                const label = typeof column === "object" ? column.label : column;
                const style = typeof column === "object" ? column.style : {};
                const field = fields[index];
                const sortKey = sortKeyMap[field] || field;
                return (
                  <th
                    key={index}
                    className="p-2 font-medium text-left"
                    style={style}
                  >
                    <div className="inline-flex items-center">
                      {label}
                      {handleSort && (
                        <div className="inline-flex items-center ml-2">
                          <GoArrowUp
                            className="text-black hover:text-gray-700 cursor-pointer"
                            onClick={() => handleSort(sortKey)}
                          />
                          <GoArrowDown
                            className="text-black hover:text-gray-700 cursor-pointer"
                            onClick={() => handleSort(sortKey)}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              {showActions && (
                <th className="p-2 font-medium text-center">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {showLoader ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center py-2"
                >
                  <div className="flex justify-center items-center h-64 w-full">
                    <MilkLoader />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="p-2 text-center text-[12px] font-medium text-[#4D5D6B] whitespace-nowrap"
                >
                  No product inventory found for this store
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-[#F3E6F2]">
                  {/* <td className="p-2 text-center text-[12px]">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        className="cursor-pointer text-[12px]"
                        onChange={(e) => handleSelectItem(e, item.id)}
                        checked={selectedItems?.includes(item.id)}
                      />
                      <div className="custom-checkbox-box"></div>
                    </div>
                  </td> */}
                  {fields.map((field, idx) => (
                    <td
                      key={idx}
                      className="p-2 text-left text-[12px] font-medium text-[#4D5D6B] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
                    >
                      {item[field]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="p-2 text-center whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <Edit
                          className="w-5 h-5 text-green-500 cursor-pointer"
                          onClick={() => handleEdit(item.id)}
                        />
                        <Delete
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination-container flex items-center justify-between mt-4 flex-wrap gap-4">
          <div className="showing-container text-[#71717A] font-medium text-[12px]">
            Showing <span className="text-black">{startItem}-{endItem}</span> of{" "}
            <span className="text-black">{totalItems || data.length}</span> items
          </div>

          <div className="flex items-center font-medium text-[12px] gap-4">
            <button
              className={`previous-container flex items-center gap-2 bg-[#F3E6F2] p-2 rounded cursor-pointer ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePrevious}
              disabled={page === 1}
            >
              <LeftArrow className="w-4 h-4" />
              Previous
            </button>
            <div className="pagenumber-container text-[#393185]">
              Page {String(page).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
            </div>
            <button
              className={`next-container flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Next
              <RightArrow className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryTable;