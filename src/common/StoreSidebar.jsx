import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StoreMallDirectoryOutlinedIcon from "@mui/icons-material/StoreMallDirectoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MoreTimeOutlinedIcon from "@mui/icons-material/MoreTimeOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Loader from "./Loader";
import "./SidebarMenu.css";

const SidebarMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [activeItem, setActiveItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({
    productInventory: false,
    rider: false,
    timeSlot: false,
    instantOrders: false,
    subscriptionOrder: false,
    reports: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === "/store/dashboard") {
      setActiveItem("dashboard");
    } else if (["/store/add-productinv", "/store/productinv-list"].includes(currentPath)) {
      setActiveItem("productInventory");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, productInventory: true }));
    } else if (["/store/add-rider", "/store/rider-list"].includes(currentPath)) {
      setActiveItem("rider");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, rider: true }));
    } else if (
      [
        "/store/add-timeslot",
        "/store/rider-timeslot",
        "/store/addrider-timeslot",
        "/store/listrider-timeslot",
      ].includes(currentPath)
    ) {
      setActiveItem("timeSlot");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, timeSlot: true }));
    } else if (
      [
        "/store/pending-order",
        "/store/completed-order",
        "/store/cancelled-order",
      ].includes(currentPath)
    ) {
      setActiveItem("instantOrders");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, instantOrders: true }));
    } else if (
      [
        "/store/subpending-order",
        "/store/subcompleted-order",
        "/store/subcancelled-order",
      ].includes(currentPath)
    ) {
      setActiveItem("subscriptionOrder");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, subscriptionOrder: true }));
    } else if (
      [
        "/store/InstantOrderReports",
        "/store/SubscriptionOrderReports",
        "/store/InstantPaymentReports",
        "/store/SubscriptionPaymentReports",
        "/store/StoreStockReports",
        "/store/InstantDeliveryboyReports",
        "/store/SubscriptionDeliveryboyReports",
      ].includes(currentPath)
    ) {
      setActiveItem("reports");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, reports: true }));
    } else {
      setActiveItem(null);
      setActiveSubItem(null);
    }
  }, [location]);

  const handleLogout = () => {
    document.cookie = "u_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    navigate("/");
  };

  const handleClick = useCallback(
    (item, route, isSubItem = false, e) => {
      e.preventDefault();
      if (isSubItem) {
        setActiveSubItem(route);
        setActiveItem(item);
        navigate(route);
        if (!isLargeScreen) setIsSidebarOpen(false);
      } else if (openSubMenus[item] !== undefined) {
        setOpenSubMenus((prev) => ({ ...prev, [item]: !prev[item] }));
        setActiveItem(item);
      } else {
        setActiveItem(item);
        navigate(route);
        if (!isLargeScreen) setIsSidebarOpen(false);
      }
    },
    [navigate, openSubMenus, isLargeScreen]
  );

  const renderNavItem = (Icon, label, itemKey, route) => {
    const isActive = activeItem === itemKey;
    return (
      <div
        onClick={(e) => handleClick(itemKey, route, false, e)}
        className={`nav-item ${isActive ? "active" : ""}`}
        role="menuitem"
        aria-label={label}
      >
        <Icon className="icon" />
        <span className="ml-4">{label}</span>
      </div>
    );
  };

  const renderSubMenu = (Icon, label, itemKey, subItems) => {
    const isActive = activeItem === itemKey;
    return (
      <div>
        <div
          onClick={(e) => handleClick(itemKey, "", false, e)}
          className={`nav-item ${isActive ? "active" : ""}`}
          role="menuitem"
          aria-expanded={openSubMenus[itemKey]}
          aria-label={label}
        >
          <Icon className="icon" />
          <span className="ml-4">{label}</span>
          {openSubMenus[itemKey] ? (
            <ArrowDropUp className="ml-auto" />
          ) : (
            <ArrowRightIcon className="ml-auto" />
          )}
        </div>
        <Collapse style={{ margin: "0px" }} in={openSubMenus[itemKey]}>
          <div className="submenu-container">
            {subItems.map((subItem) => (
              <div
                key={subItem.label}
                onClick={(e) => handleClick(itemKey, subItem.route, true, e)}
                className={`submenu-item ${
                  activeSubItem === subItem.route || location.pathname.includes(subItem.route)
                    ? "active"
                    : ""
                }`}
                role="menuitem"
                aria-label={subItem.label}
              >
                {subItem.label}
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    );
  };

  return (
    <div className="flex">
      {loading && <Loader />}
      <div
        className={`sidebar ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="logo-section">
          <img
            src="/kinemilklogo.svg"
            alt="Logo"
            className="logo-image"
            onClick={() => navigate("/store/dashboard")}
          />
          {isSidebarOpen && (
            <button
              className="close-button sm:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon className="text-[#1a1a1a]" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
          <div className="nav-items">
            {renderNavItem(HomeOutlinedIcon, "Dashboard", "dashboard", "/store/dashboard")}
            {renderSubMenu(StoreMallDirectoryOutlinedIcon, "Product Inventory", "productInventory", [
              { label: "Add Product Inventory", route: "/store/add-productinv" },
              { label: "List Product Inventory", route: "/store/productinv-list" },
            ])}
            {renderSubMenu(LocalShippingOutlinedIcon, "Rider", "rider", [
              { label: "Add Rider", route: "/store/add-rider" },
              { label: "List Rider", route: "/store/rider-list" },
            ])}
            {renderSubMenu(MoreTimeOutlinedIcon, "TimeSlot", "timeSlot", [
              { label: "Add TimeSlot", route: "/store/add-timeslot" },
              { label: "List TimeSlot", route: "/store/rider-timeslot" },
              { label: "Add Rider TimeSlot", route: "/store/addrider-timeslot" },
              { label: "Rider TimeSlots List", route: "/store/listrider-timeslot" },
            ])}
            {renderSubMenu(ShoppingCartOutlinedIcon, "Instant Orders", "instantOrders", [
              { label: "Pending Order", route: "/store/pending-order" },
              { label: "Completed Order", route: "/store/completed-order" },
              { label: "Cancelled Order", route: "/store/cancelled-order" },
            ])}
            {renderSubMenu(LocalMallOutlinedIcon, "Subscription Order", "subscriptionOrder", [
              { label: "Pending Order", route: "/store/subpending-order" },
              { label: "Completed Order", route: "/store/subcompleted-order" },
              { label: "Cancelled Order", route: "/store/subcancelled-order" },
            ])}
            {renderSubMenu(PhotoLibraryOutlinedIcon, "Reports", "reports", [
              { label: "Deliveryboy Reports", route: "/store/InstantDeliveryboyReports" },
              // { label: "Subscribe Deliveryboy Reports", route: "/store/SubscriptionDeliveryboyReports" },
              { label: "Instant Order Reports", route: "/store/InstantOrderReports" },
              { label: "Subscribe Order Reports", route: "/store/SubscriptionOrderReports" },
              { label: "Instant Payment Reports", route: "/store/InstantPaymentReports" },
              { label: "Subscribe Payment Reports", route: "/store/SubscriptionPaymentReports" },
              { label: "Store Stock Reports", route: "/store/StoreStockReports" },
            ])}
            <div
              onClick={handleLogout}
              className="nav-item"
              role="menuitem"
              aria-label="Logout"
            >
              <LogoutOutlinedIcon className="icon mr-4" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="toggle-button sm:hidden"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <CloseIcon className="text-white" />
        ) : (
          <MenuIcon className="text-[#1a1a1a]" />
        )}
      </button>

      {/* Overlay for Mobile */}
      {isSidebarOpen && !isLargeScreen && (
        <div
          className="overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        ></div>
      )}
    </div>
  );
};

export default SidebarMenu;