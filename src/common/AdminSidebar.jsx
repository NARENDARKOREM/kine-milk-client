import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ScaleIcon from "@mui/icons-material/Scale";
import ProductionQuantityLimitsOutlinedIcon from "@mui/icons-material/ProductionQuantityLimitsOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [activeItem, setActiveItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({
    banner: false,
    illustration:false,
    ads:false,
    carrybag:false,
    category: false,
    weightVolume: false,
    product: false,
    productImages: false,
    coupon: false,
    faq: false,
    store: false,
    reports: false,
    admin: false,
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

    if (currentPath === "/admin/dashboard") {
      setActiveItem("dashboard");
    } else if (["/admin/add-banner", "/admin/banner-list"].includes(currentPath)) {
      setActiveItem("banner");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, banner: true }));
    } else if (["/admin/add-illustration", "/admin/list-illustration"].includes(currentPath)) {
      setActiveItem("illustration");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, illustration: true }));
    } else if (["/admin/add-ads", "/admin/list-ads"].includes(currentPath)) {
      setActiveItem("ads");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, ads: true }));
    } else if (["/admin/add-carrybag", "/admin/list-carrybag"].includes(currentPath)) {
      setActiveItem("carrybag");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, carrybag: true }));
    } else if (["/admin/add-category", "/admin/category-list"].includes(currentPath)) {
      setActiveItem("category");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, category: true }));
    } else if (["/admin/add-weight-volume", "/admin/weight-volume-list"].includes(currentPath)) {
      setActiveItem("weightVolume");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, weightVolume: true }));
    } else if (["/admin/add-product", "/admin/product-list"].includes(currentPath)) {
      setActiveItem("product");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, product: true }));
    } else if (["/admin/add-product-images", "/admin/product-images-list"].includes(currentPath)) {
      setActiveItem("productImages");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, productImages: true }));
    } else if (currentPath === "/admin/reviews") {
      setActiveItem("reviews");
    } else if (["/admin/add-coupon", "/admin/coupon-list"].includes(currentPath)) {
      setActiveItem("coupon");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, coupon: true }));
    } else if (["/admin/add-faq", "/admin/faq-list"].includes(currentPath)) {
      setActiveItem("faq");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, faq: true }));
    } else if (["/admin/add-store", "/admin/store-list"].includes(currentPath)) {
      setActiveItem("store");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, store: true }));
    } else if (
      [
        "/admin/NormalOrderReports",
        "/admin/SubscribeOrderReports",
        "/admin/NormalPaymentReports",
        "/admin/SubscribePaymentReports",
        "/admin/StockReports",
      ].includes(currentPath)
    ) {
      setActiveItem("reports");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, reports: true }));
    } else if (["/admin/add-admin", "/admin/adminlist"].includes(currentPath)) {
      setActiveItem("admin");
      setActiveSubItem(currentPath);
      setOpenSubMenus((prev) => ({ ...prev, admin: true }));
    } else if (currentPath === "/admin/userlist") {
      setActiveItem("userlist");
    } else if (currentPath === "/admin/add-carrybag") {
      setActiveItem("carrybag");
    } else if (currentPath === "/admin/settings") {
      setActiveItem("settings");
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
      <div
        className={`sidebar ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="logo-section">
          <img
            src="/kartly.png"
            alt="Logo"
            className=" h-[150px] w-[150px] mt-5"
            onClick={() => navigate("/admin/dashboard")}
          />
          {isSidebarOpen && (
            <button
              className="close-button sm:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon className="text-[#393185]" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
          <div className="nav-items">
            {renderNavItem(HomeOutlinedIcon, "Dashboard", "dashboard", "/admin/dashboard")}
            {renderSubMenu(CollectionsOutlinedIcon, "Banner", "banner", [
              { label: "Add Banner", route: "/admin/add-banner" },
              { label: "List Banner", route: "/admin/banner-list" },
            ])}
            {renderSubMenu(CollectionsOutlinedIcon, "Illustration", "illustration", [
              { label: "Add Illustration", route: "/admin/add-illustration" },
              { label: "List Illustrations", route: "/admin/list-illustration" },
            ])}
            {renderSubMenu(CollectionsOutlinedIcon, "Ads", "ads", [
              { label: "Add Ads", route: "/admin/add-ads" },
              { label: "List Ads", route: "/admin/list-ads" },
            ])}
            {renderSubMenu(CollectionsOutlinedIcon, "Carry-Bag", "carrybag", [
              { label: "Add Carry-bag", route: "/admin/add-carrybag" },
              { label: "List Carry-bag", route: "/admin/list-carrybag" },
            ])}
            
            {renderSubMenu(CategoryOutlinedIcon, "Category", "category", [
              { label: "Add Category", route: "/admin/add-category" },
              { label: "List Category", route: "/admin/category-list" },
            ])}
            {renderSubMenu(ScaleIcon, "Weight/Volume", "weightVolume", [
              { label: "Add Weight/Volume", route: "/admin/add-weight-volume" },
              { label: "List Weight/Volume", route: "/admin/weight-volume-list" },
            ])}
            {renderSubMenu(ProductionQuantityLimitsOutlinedIcon, "Product", "product", [
              { label: "Add Product", route: "/admin/add-product" },
              { label: "List Product", route: "/admin/product-list" },
            ])}
            {renderSubMenu(PhotoLibraryOutlinedIcon, "Product Images", "productImages", [
              { label: "Add Product Images", route: "/admin/add-product-images" },
              { label: "List Product Images", route: "/admin/product-images-list" },
            ])}
            {renderNavItem(PersonOutlineOutlinedIcon, "Product Reviews", "reviews", "/admin/reviews")}
            {renderSubMenu(PercentOutlinedIcon, "Coupon", "coupon", [
              { label: "Add Coupon", route: "/admin/add-coupon" },
              { label: "List Coupon", route: "/admin/coupon-list" },
            ])}
            {renderSubMenu(InfoOutlinedIcon, "FAQ's", "faq", [
              { label: "Add FAQ's", route: "/admin/add-faq" },
              { label: "List FAQ's", route: "/admin/faq-list" },
            ])}
            {renderSubMenu(LocalMallOutlinedIcon, "Store", "store", [
              { label: "Add Store", route: "/admin/add-store" },
              { label: "List Store", route: "/admin/store-list" },
            ])}
            {renderSubMenu(PhotoLibraryOutlinedIcon, "Reports", "reports", [
              { label: "Normal Order Reports", route: "/admin/NormalOrderReports" },
              { label: "Subscribe Order Reports", route: "/admin/SubscribeOrderReports" },
              { label: "Normal Payment Reports", route: "/admin/NormalPaymentReports" },
              { label: "Subscribe Payment Reports", route: "/admin/SubscribePaymentReports" },
              { label: "Store Stock Reports", route: "/admin/StockReports" },
            ])}
            {renderSubMenu(PercentOutlinedIcon, "Admin", "admin", [
              { label: "Add Admin", route: "/admin/add-admin" },
              { label: "Admin List", route: "/admin/adminlist" },
            ])}
            {renderNavItem(PersonOutlineOutlinedIcon, "User Lists", "userlist", "/admin/userlist")}
            {renderNavItem(SettingsOutlinedIcon, "Settings", "settings", "/admin/settings")}
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
          <MenuIcon className="text-[#393185]" />
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

export default AdminSidebar;