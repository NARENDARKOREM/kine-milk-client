import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Cookies from "js-cookie";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";
import api from "../../utils/api";
import { AiOutlineDown } from "react-icons/ai";

const StoreWeightOptionAdd = () => {
  const navigate = useNavigate();
  const { product_inventory_id } = useParams();
  const [storeId, setStoreId] = useState("");
  const [product, setProduct] = useState(null);
  const [newWeightOption, setNewWeightOption] = useState({
    weight_id: "",
    weight: "",
    quantity: "",
    subscription_quantity: "",
    normal_price: "",
    subscribe_price: "",
    instant_total: 0,
    subscription_total: 0,
    grand_total: 0,
    existing_quantity: "",
    existing_subscription_quantity: "",
  });
  const [weightOptions, setWeightOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);

  // Fetch store ID and product details
  useEffect(() => {
    const id = Cookies.get("store_id");
    if (!id) {
      NotificationManager.error("Store ID is missing.");
      setError("Store ID is missing.");
      setIsLoading(false);
      return;
    }
    setStoreId(id);

    async function fetchProductDetails() {
      try {
        const response = await api.get(`/storeweightoption/getproductinv/${product_inventory_id}`);
        const fetchedData = response.data;
        if (!fetchedData.product) {
          throw new Error("Product data not found in response.");
        }
        setProduct(fetchedData.product);
      } catch (error) {
        console.error("Error fetching product details:", error);
        NotificationManager.error("Failed to fetch product details.");
        setError("Failed to load product details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProductDetails();
  }, [product_inventory_id]);

  // Handle weight option selection
  const handleWeightOptionSelectChange = async (selectedOption) => {
    const weightId = selectedOption ? selectedOption.value : "";
    const weightOption = product?.weightOptions?.find((option) => option.id === weightId);

    let existingQuantity = 0;
    let existingSubscriptionQuantity = "0";

    if (weightId) {
      try {
        const currentOptionsResponse = await api.get(`/storeweightoption/current/${product_inventory_id}`);
        const currentOptions = currentOptionsResponse.data;
        const existingOption = currentOptions.find((opt) => opt.weight_id === weightId);
        if (existingOption) {
          existingQuantity = existingOption.quantity || 0;
          existingSubscriptionQuantity = existingOption.subscription_quantity || "0";
        }
      } catch (error) {
        console.error("Error fetching existing quantities:", error);
        NotificationManager.error("Failed to fetch existing quantities.");
      }
    }

    const normalPrice = weightOption ? weightOption.normal_price : "";
    const subscribePrice = weightOption ? weightOption.subscribe_price : "";

    setNewWeightOption({
      weight_id: weightId,
      weight: weightOption?.weight || "",
      normal_price: normalPrice,
      subscribe_price: subscribePrice,
      quantity: "",
      subscription_quantity: "",
      instant_total: 0,
      subscription_total: 0,
      grand_total: 0,
      existing_quantity: existingQuantity,
      existing_subscription_quantity: existingSubscriptionQuantity,
    });
  };

  // Handle weight option input changes
  const handleWeightOptionChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value < 0 ? 0 : value;
    setNewWeightOption((prev) => {
      const updatedOption = { ...prev, [name]: parsedValue };
      const quantity = name === "quantity" ? parsedValue : prev.quantity;
      const subscription_quantity = name === "subscription_quantity" ? parsedValue : prev.subscription_quantity;
      updatedOption.instant_total = prev.normal_price * (parseFloat(quantity || 0));
      updatedOption.subscription_total = prev.subscribe_price * (parseFloat(subscription_quantity || 0));
      updatedOption.grand_total = updatedOption.instant_total + updatedOption.subscription_total;
      return updatedOption;
    });
  };

  // Add new weight option to table
  const addWeightOption = () => {
    if (!newWeightOption.weight_id) {
      NotificationManager.error("Please select a valid weight option.");
      return;
    }
    if (!newWeightOption.quantity || newWeightOption.quantity <= 0) {
      NotificationManager.error("Please enter a valid quantity greater than 0.");
      return;
    }
    if (product?.subscription_required === 1 && (!newWeightOption.subscription_quantity || newWeightOption.subscription_quantity <= 0)) {
      NotificationManager.error("Please enter a valid subscription quantity greater than 0.");
      return;
    }
    if (!newWeightOption.normal_price) {
      NotificationManager.error("Normal price is required.");
      return;
    }
    if (product?.subscription_required === 1 && !newWeightOption.subscribe_price) {
      NotificationManager.error("Subscribe price is required.");
      return;
    }

    const weightExists = weightOptions.some(
      (option) => option.weight_id === newWeightOption.weight_id
    );

    if (weightExists) {
      NotificationManager.error("This weight option is already added in the current session.");
      return;
    }

    setWeightOptions((prev) => [
      ...prev,
      {
        weight_id: newWeightOption.weight_id,
        weight: newWeightOption.weight,
        normal_price: newWeightOption.normal_price,
        subscribe_price: newWeightOption.subscribe_price,
        quantity: parseFloat(newWeightOption.quantity),
        subscription_quantity: product?.subscription_required === 1 ? parseFloat(newWeightOption.subscription_quantity) : "0",
        instant_total: newWeightOption.instant_total,
        subscription_total: newWeightOption.subscription_total,
        grand_total: newWeightOption.grand_total,
      },
    ]);

    setNewWeightOption({
      weight_id: "",
      weight: "",
      quantity: "",
      subscription_quantity: "",
      normal_price: "",
      subscribe_price: "",
      instant_total: 0,
      subscription_total: 0,
      grand_total: 0,
      existing_quantity: "",
      existing_subscription_quantity: "",
    });

    NotificationManager.success("Weight option added to table!");
  };

  // Start editing a row
  const startEditingRow = (index) => {
    setEditingRowIndex(index);
  };

  // Handle inline input changes for editing
  const handleInlineInputChange = (index, field, value) => {
    const parsedValue = value < 0 ? 0 : value;
    setWeightOptions((prev) => {
      const updatedWeightOptions = [...prev];
      updatedWeightOptions[index] = {
        ...updatedWeightOptions[index],
        [field]: parsedValue,
      };
      const quantity = field === "quantity" ? parsedValue : updatedWeightOptions[index].quantity;
      const subscription_quantity = field === "subscription_quantity" ? parsedValue : updatedWeightOptions[index].subscription_quantity;
      updatedWeightOptions[index].instant_total = updatedWeightOptions[index].normal_price * (parseFloat(quantity || 0));
      updatedWeightOptions[index].subscription_total = updatedWeightOptions[index].subscribe_price * (parseFloat(subscription_quantity || 0));
      updatedWeightOptions[index].grand_total = updatedWeightOptions[index].instant_total + updatedWeightOptions[index].subscription_total;
      return updatedWeightOptions;
    });
  };

  // Save edited row
  const saveEditedRow = (index) => {
    const option = weightOptions[index];
    if (!option.quantity || option.quantity <= 0) {
      NotificationManager.error("Please enter a valid quantity greater than 0.");
      return;
    }
    if (product?.subscription_required === 1 && (!option.subscription_quantity || option.subscription_quantity <= 0)) {
      NotificationManager.error("Please enter a valid subscription quantity greater than 0.");
      return;
    }
    setEditingRowIndex(null);
    NotificationManager.success("Weight option updated in table!");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRowIndex(null);
  };

  // Remove weight option from table
  const removeWeightOption = (index) => {
    setWeightOptions((prev) => prev.filter((_, i) => i !== index));
    NotificationManager.success("Weight option removed from table!");
  };

  // Submit all weight options to add inventory
  const submitWeightOptions = async () => {
    if (weightOptions.length === 0) {
      NotificationManager.error("At least one weight option with a quantity greater than 0 is required.");
      return;
    }

    const weightIds = weightOptions.map((opt) => opt.weight_id);
    const hasDuplicates = new Set(weightIds).size !== weightIds.length;
    if (hasDuplicates) {
      NotificationManager.error("Duplicate weight options detected. Please remove duplicates before submitting.");
      return;
    }

    try {
      const payload = {
        product_inventory_id: product_inventory_id,
        store_id: storeId,
        weightOptions: weightOptions.map((opt) => ({
          weight_id: opt.weight_id,
          quantity: parseFloat(opt.quantity),
          subscription_quantity: product?.subscription_required === 1 ? parseFloat(opt.subscription_quantity) : 0,
          total: parseFloat(opt.grand_total),
        })),
      };

      await api.post("/storeweightoption/add", payload);
      NotificationManager.success("Inventory added successfully!");
      setWeightOptions([]);
      setNewWeightOption({
        weight_id: "",
        weight: "",
        quantity: "",
        subscription_quantity: "",
        normal_price: "",
        subscribe_price: "",
        instant_total: 0,
        subscription_total: 0,
        grand_total: 0,
        existing_quantity: "",
        existing_subscription_quantity: "",
      });
      navigate(`/inventory/${product_inventory_id}`);
    } catch (error) {
      console.error("Error adding inventory:", error);
      NotificationManager.error("Failed to add inventory.");
    }
  };

  // Weight options for selected product
  const weightOptionsList =
    product?.weightOptions?.length > 0
      ? [
          { value: "", label: "Select Weight", isDisabled: true },
          ...product.weightOptions.map((option) => ({
            value: option.id,
            label: option.weight || "N/A",
          })),
        ]
      : [{ value: "", label: "No weight options available", isDisabled: true }];

  // Custom styles for Select components
  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: `${isFocused ? "2px solid #393185" : "1px solid #B0B0B0"}`,
      boxShadow: isFocused ? "none" : "none",
      borderRadius: "5px",
      padding: "0px",
      fontSize: "12px",
      height: "42px",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { border: "2px solid #393185" },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#393185" : isSelected ? "#393185" : "white",
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

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <div className="container">
            <SimpleHeader name={"Add Inventory Quantity"} />
            <div className="h-full px-3 max-w-5xl">
              <div className="bg-white rounded-xl border py-4 px-6 h-[68vh] w-[79vw] overflow-scroll scrollbar-none">
                <div className="grid grid-cols-1 gap-6">
                  {isLoading ? (
                    <div className="text-center">Loading product details...</div>
                  ) : error ? (
                    <div className="text-center text-red-500">
                      {error}
                      <div className="mt-2">
                        <button
                          onClick={() => navigate(`/store/weight-option-list/${product_inventory_id}`)}
                          className="bg-gray-500 text-white py-2 px-4 rounded"
                        >
                          Back to Quantity History
                        </button>
                      </div>
                    </div>
                  ) : !product ? (
                    <div className="text-center">No product data available.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <label className="block text-left">Weight Option</label>
                          <Select
                            value={weightOptionsList.find(
                              (option) => option.value === newWeightOption.weight_id
                            )}
                            onChange={handleWeightOptionSelectChange}
                            options={weightOptionsList}
                            styles={customStyles}
                            placeholder="Select Weight"
                            isSearchable={false}
                            components={{
                              DropdownIndicator: () => (
                                <AiOutlineDown className="w-4 h-4" />
                              ),
                              IndicatorSeparator: () => null,
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-left">Instant Price</label>
                          <input
                            type="text"
                            readOnly
                            value={newWeightOption.normal_price}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-left">Existing Quantity</label>
                          <input
                            type="text"
                            readOnly
                            value={newWeightOption.existing_quantity}
                            className="border p-2 rounded w-full bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-left">
                            Add Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={newWeightOption.quantity}
                            onChange={handleWeightOptionChange}
                            className="border p-2 rounded w-full"
                            min="0"
                          />
                        </div>
                        {product.subscription_required === 1 && (
                          <>
                            <div>
                              <label className="block text-left">Subscribe Price</label>
                              <input
                                type="text"
                                readOnly
                                value={newWeightOption.subscribe_price}
                                className="border p-2 rounded w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-left">Existing Subscription Quantity</label>
                              <input
                                type="text"
                                readOnly
                                value={newWeightOption.existing_subscription_quantity}
                                className="border p-2 rounded w-full bg-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-left">
                                Add Subscription Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name="subscription_quantity"
                                value={newWeightOption.subscription_quantity}
                                onChange={handleWeightOptionChange}
                                className="border p-2 rounded w-full"
                                min="0"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addWeightOption}
                          className="bg-[#393185] text-white py-2 px-4 rounded"
                        >
                          Add Quantity
                        </button>
                      </div>

                      {weightOptions.length > 0 && (
                        <div className="mt-6">
                          <label className="block text-left font-semibold mb-2">
                            Current Quantities to Add
                          </label>
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 p-2">Weight</th>
                                <th className="border border-gray-300 p-2">Normal Price</th>
                                <th className="border border-gray-300 p-2">Quantity</th>
                                <th className="border border-gray-300 p-2">Instant Total</th>
                                {product?.subscription_required === 1 && (
                                  <>
                                    <th className="border border-gray-300 p-2">Subscribe Price</th>
                                    <th className="border border-gray-300 p-2">Subscription Quantity</th>
                                    <th className="border border-gray-300 p-2">Subscription Total</th>
                                  </>
                                )}
                                <th className="border border-gray-300 p-2">Grand Total</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weightOptions.map((option, index) => {
                                const isEditing = editingRowIndex === index;
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-2">{option.weight || "N/A"}</td>
                                    <td className="border border-gray-300 p-2">{option.normal_price || "N/A"}</td>
                                    <td className="border border-gray-300 p-2">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={option.quantity}
                                          onChange={(e) =>
                                            handleInlineInputChange(index, "quantity", e.target.value)
                                          }
                                          className="border p-1 rounded w-full"
                                          min="0"
                                        />
                                      ) : (
                                        option.quantity
                                      )}
                                    </td>
                                    <td className="border border-gray-300 p-2">{option.instant_total}</td>
                                    {product?.subscription_required === 1 && (
                                      <>
                                        <td className="border border-gray-300 p-2">{option.subscribe_price || "N/A"}</td>
                                        <td className="border border-gray-300 p-2">
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              value={option.subscription_quantity}
                                              onChange={(e) =>
                                                handleInlineInputChange(index, "subscription_quantity", e.target.value)
                                              }
                                              className="border p-1 rounded w-full"
                                              min="0"
                                            />
                                          ) : (
                                            option.subscription_quantity || "0"
                                          )}
                                        </td>
                                        <td className="border border-gray-300 p-2">{option.subscription_total}</td>
                                      </>
                                    )}
                                    <td className="border border-gray-300 p-2">{option.grand_total}</td>
                                    <td className="border border-gray-300 p-2">
                                      <div className="flex justify-center gap-2">
                                        {isEditing ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => saveEditedRow(index)}
                                              className="p-2 rounded"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-green-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M5 13l4 4L19 7"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={cancelEditing}
                                              className="p-2 rounded"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-red-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"
                                                />
                                              </svg>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => startEditingRow(index)}
                                              className="p-2 rounded"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-[#393185]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => removeWeightOption(index)}
                                              className="p-2 rounded"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-red-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7h6m-5 4v6m4-6v6"
                                                />
                                              </svg>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div className="mt-4 flex justify-start">
                            <button
                              type="button"
                              onClick={submitWeightOptions}
                              className="bg-[#393185] text-white py-2 px-4 rounded"
                            >
                              Add Inventory
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default StoreWeightOptionAdd;