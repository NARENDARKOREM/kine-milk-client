import React from "react";
// import FilterDropdown from "./FilterDropdown";
// import SelectRoleDropdown from "./SelectRoleDropdown";
import { ReactComponent as Searchicon } from "../assets/images/search_normal.svg";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useNavigate } from 'react-router-dom';

const Pagetitle = ({
  title,
  buttonLabel,
  onButtonClick,
  filterValue,
  onFilterChange,
  options,
  searchPlaceholder,
  onSearch,
  filterPlaceholder,
  showRoleAssign,
  roleValue,
  organizationChange,
  organizationOptions,
  assignButtonLabel,
  handleBackClick,
  onAssignClick,
  setOrganizationType_id
}) => {
  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: isFocused ? "2px solid #393185" : " 1px solid #EAEAFF",
      boxShadow: isFocused ? "none" : "0px 0px 4px 1px #00000033",
      borderRadius: "5px",
      padding: "2px",
      fontSize: "12px", // Consistent font size
      color: "#757575",
      height: "42px",

      "&:hover": {},
    }),
    placeholder: (base) => ({
      ...base,
      color: "#131313",
      fontWeight: 600,
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      fontWeight: "600",
      color: "#131313",
      fontFamily: "Montserrat, sans-serif",
    }),
    option: (base) => ({
      ...base,
      backgroundColor: "white",
      color: "#757575",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "12px",
      "&:hover": {
        backgroundColor: "#393185",
        color: "white",
      },
      menu: (base) => ({
        ...base,
        width: "150px", // Fixed dropdown menu width
      }),
    }),
  };
  const navigate = useNavigate();
 

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-2 space-y-4 md:space-y-0 pl-5">
      <div className="font-[700px] text-left w-full md:w-auto">
        
      <h3
        className="flex items-center text-lg font-medium cursor-pointer"
        onClick={handleBackClick}
      >
        <NavigateBeforeIcon className="mr-1" />
        {title}
      </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
        {/* {showRoleAssign && (
          <div className="flex items-center space-x-4">
            <div className="relative w-[200px]">
              <SelectRoleDropdown
                roleValue={roleValue}
                onRoleChange={organizationChange}
                roleOptions={
                  organizationOptions 
                } // Ensure it's always an array
                placeholder="Select Organization Type"
                customStyles={customStyles}
                setOrganizationType_id={setOrganizationType_id}
              />
            </div>

            <button
              onClick={onAssignClick}
              className="bg-[#393185] text-white px-4 py-2 rounded-lg flex items-center justify-center h-[40px] text-[12px]"
            >
              {assignButtonLabel || "Assign"}
            </button>
          </div>
        )} */}

        <div className="relative w-full searchbar sm:w-[250px]">
          <input
            type="text"
            className="p-2 border border-[#EAE5FF] searchbar rounded w-full h-[40px] text-[12px] shadow-[ 0px 0px 4px 1px #00000033] pr-10 focus:border-2 focus:ring-[#393185] focus:border-[#393185] focus:outline-none"
            placeholder={searchPlaceholder || "Search"}
            onChange={onSearch}
          />
          <Searchicon className="absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* <div className="relative w-[100px]">
          <FilterDropdown
            filterValue={filterValue}
            onFilterChange={onFilterChange}
            options={options}
            placeholder={filterPlaceholder}
            customStyles={customStyles}
          />
        </div> */}

        <button
          onClick={onButtonClick}
          className="bg-[#393185] text-white px-2 py-2 rounded-lg flex items-center justify-center h-[40px] text-[12px] w-full sm:w-auto"
        >
          <span className="mr-2">+</span> {buttonLabel || "Create"}
        </button>
      </div>
    </div>
  );
};

export default Pagetitle;
