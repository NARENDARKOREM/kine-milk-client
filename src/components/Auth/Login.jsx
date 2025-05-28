import React, { useState } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import api from '../../utils/api';
import Cookies from 'js-cookie';
import Select from "react-select";
import { AiOutlineDown } from 'react-icons/ai';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordType, setPasswordType] = useState('password');
  const [selectedOption, setSelectedOption] = useState(null);
  const [emailError, setEmailError] = useState(''); // State for email error
  const [passwordError, setPasswordError] = useState(''); // State for password error
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ''
  });

  const handlePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setPasswordType(passwordVisible ? 'password' : 'text');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (e.target.name === 'email') setEmailError('');
    if (e.target.name === 'password') setPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError('');
    setPasswordError('');

    try {
      const res = await api.post("/admin/login", formData);

      NotificationManager.removeAll();
      NotificationManager.success(`${res.data.role} logged in successfully!`);

      setTimeout(() => {
        Cookies.set('u_token', res.data.token, { expires: 1, secure: true });
        Cookies.set('role', res.data.role, { expires: 1, secure: true });

        if (res.data.role === 'admin') {
          Cookies.set('admin_id', res.data.admin.id, { expires: 1, secure: true });
          navigate('/admin/dashboard');
        } else if (res.data.role === 'store') {
          Cookies.set('store_id', res.data.store.id, { expires: 1, secure: true });
          navigate('/store/dashboard');
        }
      }, 2000);
    } catch (err) {
      NotificationManager.removeAll();

      // Handle specific errors
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error;

        if (errorMessage === 'Email not found') {
          setEmailError('Email not found'); // Set email error
        } else if (errorMessage === 'Invalid password') {
          setPasswordError('Invalid password'); // Set password error
        } else {
          NotificationManager.error(errorMessage || "Something went wrong!");
        }
      } else {
        NotificationManager.error("Something went wrong!");
      }
    }
  };

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      border: isFocused ? "1px solid #393185" : "1px solid #B0B0B0",
      borderRadius: "5px",
      padding: "2px",
      fontSize: "12px",
      color: "#757575",
      height: "42px",
      "&:hover": {
        borderColor: isFocused ? "#393185" : "#B0B0B0",
      },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#393185" : isSelected ? "#393185" : "white",
      color: isFocused || isSelected ? "white" : "#757575",
      fontSize: "12px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#393185",
        color: "white",
      },
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      fontWeight: "600",
      color: "#393185",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#393185",
      fontSize: "12px",
    }),
  };

  const options = [
    { value: "admin", label: "Admin Panel" },
    { value: "store", label: "Store Panel" },
  ];

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setFormData({ ...formData, role: selectedOption.value });
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side */}
      <div
        className="h-full flex flex-col items-center justify-center"
        style={{ background: '#393185' }}
      >
        <div>
          <img src="_2695634063136.svg" alt="" className="w-[300px] h-[350px]" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center bg-white p-6">
        <div
          className="w-full max-w-md bg-white rounded-xl p-8"
          style={{
            boxShadow: `0px 2px 5px 0px #0000001A, 0px 10px 10px 0px #00000017, 0px 22px 13px 0px #0000000D, 0px 39px 15px 0px #00000003, 0px 60px 17px 0px #00000000`,
          }}
        >
          <h2 className="auth-head">Welcome Back</h2>
          <p className="text-[#393185] float-left mb-[38px] ml-[5px] mt-[10px] leading-[26px]">
            Please Login to your Account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                onChange={handleChange}
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                className="w-full px-3 py-2 border border-[#B0B0B0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#393185] placeholder:font-[poppins] placeholder:text-[14px] placeholder:text-[#25064C]"
                placeholder="Email"
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>} {/* Email error message */}
            </div>

            <div className="">
              <div className='flex relative'>
              <input
                type={passwordType}
                onChange={handleChange}
                id="password"
                name="password"
                required
                value={formData.password}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#393185] placeholder:font-[poppins] placeholder:text-[14px] placeholder:text-[#25064C]"
                placeholder="Password"
              />
              <span
                className="mt-2 cursor-pointer absolute right-4 visibilityIcon"
                onClick={handlePasswordVisibility}
              >
                {passwordVisible ? (
                  <VisibilityOutlinedIcon fontSize="30px" />
                ) : (
                  <VisibilityOffOutlinedIcon fontSize="30px" />
                )}
              </span>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>} {/* Password error message */}
            </div>

            <div className="flex flex-col mt-4">
              <Select
                value={options.find((option) => option.value === formData.role)}
                onChange={handleSelectChange}
                options={options}
                styles={customStyles}
                placeholder="Select Role"
                isSearchable={false}
                components={{
                  DropdownIndicator: () => (
                    <AiOutlineDown className="w-[16px] h-[16px] pr-1" />
                  ),
                  IndicatorSeparator: () => null,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>
              <div>
                <a href="/forgotpassword" className="text-sm text-[#131313] fg">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#393185] mt-14 font-[poppins]"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default Login;