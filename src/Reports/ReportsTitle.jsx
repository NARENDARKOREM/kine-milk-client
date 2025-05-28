import { useNavigate } from 'react-router-dom';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";

const ReportsTitle = ({
  title,
  searchPlaceholder,
  onSearch,
  onDownloadClick,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  storeId,
  stores,
  onStoreChange,
  isLoadingStores,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: `${isFocused ? "2px solid #393185" : "1px solid #B0B0B0"}`,
      boxShadow: isFocused ? "none" : "none",
      borderRadius: "5px",
      padding: "2px",
      fontSize: "12px",
      height: "42px",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { border: "2px solid #393185" },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#393185" : isSelected ? "#978fdc" : "white",
      color: isFocused || isSelected ? "white" : "#757575",
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      fontWeight: "600",
      color: "#393185",
    }),
    placeholder: (base) => ({ ...base, color: "#393185", fontSize: "12px" }),
  };

  // Only create storeOptions if stores is provided and is an array
  const storeOptions = stores && Array.isArray(stores) && stores.length > 0
    ? [
        { value: "", label: "All Stores" },
        ...stores.map((store) => ({
          value: store.id,
          label: store.title,
        })),
      ]
    : [];

  console.log('Store options:', storeOptions);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 space-y-4 md:space-y-0 ">
      <div className="font-medium text-left w-full md:w-auto">
        <h3
          className="flex items-center text-lg font-medium cursor-pointer text-[#393185]"
          onClick={handleBackClick}
        >
          <NavigateBeforeIcon className="mr-1 text-[#393185]" />
          {title}
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
        {/* Store Filter - Render only if storeOptions exists */}
        {storeOptions.length > 0 && (
          <div className="relative w-full sm:w-[150px]">
            <Select
              value={storeOptions.find((option) => option.value === storeId) || null}
              onChange={onStoreChange}
              options={storeOptions}
              styles={customStyles}
              placeholder={isLoadingStores ? "Loading Stores..." : "Select Store"}
              isSearchable={false}
              isDisabled={isLoadingStores}
              components={{
                DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                IndicatorSeparator: () => null,
              }}
              aria-label="Select store for order reports"
            />
          </div>
        )}

        {/* From Date Input */}
        <div className="relative w-full sm:w-[150px]">
          <input
            type="date"
            value={fromDate}
            onChange={onFromDateChange}
            className="p-2 border rounded-md text-[12px] w-full"
            aria-label="Select from date"
          />
        </div>

        {/* To Date Input */}
        <div className="relative w-full sm:w-[150px]">
          <input
            type="date"
            value={toDate}
            onChange={onToDateChange}
            className="p-2 border rounded-md text-[12px] w-full"
            aria-label="Select to date"
          />
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-[250px]">
          <input
            type="text"
            placeholder={searchPlaceholder || "Search"}
            onChange={onSearch}
            className="p-2 border rounded-md w-full"
            aria-label="Search orders"
          />
        </div>

        {/* Download Button */}
        <button
          onClick={onDownloadClick}
          className="bg-[#393185] text-white px-4 py-2 rounded"
          aria-label="Download report"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ReportsTitle;