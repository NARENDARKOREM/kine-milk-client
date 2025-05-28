export const handleSort = (data, key, sortConfig, setSortConfig, setData) => {
  let direction = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }

  const sortedData = [...data].sort((a, b) => {
    // Handle nested keys (e.g., "inventoryProducts.title")
    const keys = key.split(".");
    let valA = a;
    let valB = b;

    for (const k of keys) {
      valA = valA?.[k] ?? "";
      valB = valB?.[k] ?? "";
    }

    // Handle sorting for strings
    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB) * (direction === "asc" ? 1 : -1);
    }

    // Handle sorting for numbers
    if (typeof valA === "number" && typeof valB === "number") {
      return direction === "asc" ? valA - valB : valB - valA;
    }

    // Fallback for other types
    return String(valA).localeCompare(String(valB)) * (direction === "asc" ? 1 : -1);
  });

  setData(sortedData);
  setSortConfig({ key, direction });
};