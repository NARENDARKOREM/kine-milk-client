import React, { useState, useEffect, useRef } from "react";
import { ProfileIcon } from "./Icons";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Header = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isHovered) {
        setShowCard(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isHovered]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isHovered) {
        setShowCard(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isHovered]);

  const logout = () => {
    // Remove the token by expiring the cookie
    document.cookie = "u_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  
    // Navigate to "/"
    navigate("/");
  };

  const token = document.cookie.split("=")[1];

  const getRoleFromCookie = () => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('role='));
    return cookie ? cookie.split('=')[1] : null;
  };

  const role = getRoleFromCookie();

  return (
    <div className="bg-white h-[65px] sm:h-[80px] px-4 py-4 sm:px-6 flex items-center justify-between relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-100 z-50">
          <span className="loader"></span>
        </div>
      )}

      {/* Title Section */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg sm:text-2xl font-bold text-[#393185]">Dashboard</span>
      </div>
      <div>
        <Toaster position="top-right" />
      </div>

      {/* Profile Icon with Smooth Hover Card */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-[#f7fbff] rounded-full w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center cursor-pointer">
          <ProfileIcon />
        </div>

        {showCard && (
          <div
            className="absolute top-12 right-0 w-[220px] bg-white border border-gray-300 rounded-lg shadow-lg z-10 transition-all duration-300"
          >
            <ul className="py-2 divide-y divide-gray-200">
              <li
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate(role === 'admin' ? "/admin/account" : "/store/account");
                }}
              >
                <FaUser className="text-[#393185]" /> <span>Account</span>
              </li>
              <li
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer"
                onClick={logout}
              >
                <FaSignOutAlt className="text-[#393185]"/> <span>Logout</span>
              </li>
              {role === 'admin' && (
                <li
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate("/admin/settings");
                  }}
                >
                  <FaCog className="text-[#393185]" /> <span>Settings</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;