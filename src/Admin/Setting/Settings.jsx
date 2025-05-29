import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import JoditEditor from "jodit-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Header from "../../common/Header";
import SimpleHeader from "../../common/SimpleHeader";
import api from "../../utils/api";

const Settings = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const privacyEditorRef = useRef(null);
  const termsEditorRef = useRef(null);
  const cancellationEditorRef = useRef(null);
  const [privacyContent, setPrivacyContent] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [cancellationContent, setCancellationContent] = useState("");
  const [showApiKey, setShowApiKey] = useState(true);
  const [showOneKey, setShowOneKey] = useState(true);
  const [showOnesignalApiKey, setShowOnesignalApiKey] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [id, setId] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const [walletSuggestions, setWalletSuggestions] = useState(Array(6).fill(""));
  const [tipSuggestions, setTipSuggestions] = useState(Array(4).fill("")); // State for 4 tip amount suggestions
  const [isSubmitting,setIsSubmitting] = useState(false)
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "api_key":
        setShowApiKey(!showApiKey);
        break;
      case "one_key":
        setShowOneKey(!showOneKey);
        break;
      case "onesignal_apikey":
        setShowOnesignalApiKey(!showOnesignalApiKey);
        break;
      default:
        break;
    }
  };

  const config = {
    height: 300,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "font",
      "fontsize",
      "paragraph",
      "align",
      "|",
      "table",
      "link",
      "image",
      "|",
      "code",
      "undo",
      "redo",
      "|",
      "fullsize",
    ],
    removeButtons: ["about", "video", "audio", "undo", "redo", "speech"],
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarSticky: true,
    uploader: { insertImageAsBase64URI: true },
    filebrowser: { ajax: { url: "/files" }, uploader: { url: "/upload" } },
    table: { allowCellResize: true, defaultWidth: "100%" },
    allowResizeX: true,
    allowResizeY: true,
    showPoweredByJodit: false,
    disablePlugins: ["poweredByJodit", "speech"],
    spellcheck: false,
  };

  const handleimageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleWalletSuggestionChange = (index, value) => {
    const updatedSuggestions = [...walletSuggestions];
    updatedSuggestions[index] = value;
    setWalletSuggestions(updatedSuggestions);
    setValue("wallet_amt_suggestions", updatedSuggestions);
  };

  const handleTipSuggestionChange = (index, value) => {
    const updatedSuggestions = [...tipSuggestions];
    updatedSuggestions[index] = value;
    setTipSuggestions(updatedSuggestions);
    setValue("delivery_boy_tip_suggestions", updatedSuggestions);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings/allsettings");
        const settingsData = response.data.settings;
        console.log(settingsData, "sssssssssssssettings Data");
        if (response.status === 200 && Array.isArray(settingsData) && settingsData.length > 0) {
          setId(settingsData[0]?.id || "");
          setValue("webname", settingsData[0]?.webname || "");
          setValue("weblogo", settingsData[0]?.weblogo || "");
          setExistingImageUrl(settingsData[0]?.weblogo || null);
          setValue("timezone", settingsData[0]?.timezone || "");
          setValue("pstore", settingsData[0]?.pstore || "");
          setValue("onesignal_keyId", settingsData[0]?.onesignal_keyId || "");
          setValue("onesignal_apikey", settingsData[0]?.onesignal_apikey || "");
          setValue("onesignal_appId", settingsData[0]?.onesignal_appId || "");
          setValue("scredit", settingsData[0]?.scredit || "");
          setValue("rcredit", settingsData[0]?.rcredit || "");
          setValue("delivery_charges", settingsData[0]?.delivery_charges || "");
          setValue("store_charges", settingsData[0]?.store_charges || "");
          setValue("tax", settingsData[0]?.tax || "");
          setValue("refferal_amount", settingsData[0]?.refferal_amount || "");
          setValue("minimum_subscription_days", settingsData[0]?.minimum_subscription_days || "");

          // Handle wallet_amt_suggestions
          let walletSuggestionsData = settingsData[0]?.wallet_amt_suggestions;
          if (typeof walletSuggestionsData === "string") {
            try {
              walletSuggestionsData = JSON.parse(walletSuggestionsData);
            } catch (parseError) {
              console.error("Error parsing wallet_amt_suggestions:", parseError);
              walletSuggestionsData = [];
            }
          }
          const suggestionsArray = Array.isArray(walletSuggestionsData)
            ? [...walletSuggestionsData, ...Array(6 - walletSuggestionsData.length).fill("")]
            : Array(6).fill("");
          setWalletSuggestions(suggestionsArray);
          setValue("wallet_amt_suggestions", suggestionsArray);

          // Handle delivery_boy_tip_suggestions
          let tipSuggestionsData = settingsData[0]?.delivery_boy_tip_suggestions;
          if (typeof tipSuggestionsData === "string") {
            try {
              tipSuggestionsData = JSON.parse(tipSuggestionsData);
            } catch (parseError) {
              console.error("Error parsing delivery_boy_tip_suggestions:", parseError);
              tipSuggestionsData = [];
            }
          }
          const tipSuggestionsArray = Array.isArray(tipSuggestionsData)
            ? [...tipSuggestionsData, ...Array(4 - tipSuggestionsData.length).fill("")]
            : Array(4).fill("");
          setTipSuggestions(tipSuggestionsArray);
          setValue("delivery_boy_tip_suggestions", tipSuggestionsArray);

          setPrivacyContent(settingsData[0]?.privacy_policy || "");
          setTermsContent(settingsData[0]?.terms_conditions || "");
          setCancellationContent(settingsData[0]?.cancellation_policy || "");
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching settings:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchSettings();
  }, [setValue]);

  const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const formData = new FormData();

    // Append each field
    formData.append("webname", data.webname || "");
    if (image) {
      formData.append("weblogo", image);
    }
    if (id) {
      formData.append("id", id);
    }
    formData.append("timezone", data.timezone || "");
    formData.append("pstore", data.pstore || "");
    formData.append("onesignal_keyId", data.onesignal_keyId || "");
    formData.append("onesignal_apikey", data.onesignal_apikey || "");
    formData.append("onesignal_appId", data.onesignal_appId || "");
    formData.append("scredit", data.scredit || "");
    formData.append("rcredit", data.rcredit || "");
    formData.append("delivery_charges", data.delivery_charges || "");
    formData.append("store_charges", data.store_charges || "");
    formData.append("tax", data.tax || "");
    formData.append("refferal_amount", data.refferal_amount || "");
    formData.append("minimum_subscription_days", data.minimum_subscription_days || "");
    // Handle wallet_amt_suggestions
    if (walletSuggestions.some(val => val !== "")) {
      const suggestions = walletSuggestions.map(val => (val ? parseInt(val) : 0)).filter(val => val > 0);
      formData.append("wallet_amt_suggestions", JSON.stringify(suggestions));
    }
    // Handle delivery_boy_tip_suggestions
    if (tipSuggestions.some(val => val !== "")) {
      const tips = tipSuggestions.map(val => (val ? parseInt(val) : 0)).filter(val => val > 0);
      formData.append("delivery_boy_tip_suggestions", JSON.stringify(tips));
    }
    formData.append("admin_tax", data.admin_tax || "");
    formData.append("sms_type", data.sms_type || "");
    formData.append("one_key", data.one_key || "");

    const privacyPolicyText = extractTextFromHTML(privacyContent);
    const termsConditionsText = extractTextFromHTML(termsContent);
    const cancellationPolicyText = extractTextFromHTML(cancellationContent);
    formData.append("privacy_policy", privacyPolicyText || "");
    formData.append("terms_conditions", termsConditionsText || "");
    formData.append("cancellation_policy", cancellationPolicyText || "");

    // Debugging: Log form data entries
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await api.post(
        `/settings/upsertSettings`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        NotificationManager.removeAll();
        NotificationManager.success("Settings updated successfully");
      }
    } catch (error) {
      console.error(
        "Error updating settings:",
        error.response?.data?.message || error.message
      );
      NotificationManager.removeAll();
      NotificationManager.error("Failed to update settings");
    }
    setIsSubmitting(false)
  };

  return (
    <div className="bg-[#f7fbff] h-full">
      <Header />
      <SimpleHeader name="Settings" />
      <main className="flex-grow">
        <div className="container">
          <div className="h-full px-6">
            <div className="bg-white h-[67vh] rounded-xl border w-[76vw] border-[#EAE5FF] py-4 px-6 overflow-y-auto scrollbar-none">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Website Name */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-3 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="webname"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Website Name
                    </label>
                    <input
                      id="webname"
                      name="webname"
                      type="text"
                      {...register("webname", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Website Image */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="weblogo"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Website Image
                    </label>
                    <input
                      id="weblogo"
                      name="weblogo"
                      type="file"
                      {...register("weblogo")}
                      onChange={handleimageChange}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                    {image ? (
                      <img
                        src={preview}
                        alt="New Preview"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ) : existingImageUrl ? (
                      <img
                        src={existingImageUrl}
                        alt="Existing"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Timezone */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="timezone"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Timezone
                    </label>
                    <input
                      id="timezone"
                      name="timezone"
                      type="text"
                      {...register("timezone")}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>
                </div>

                {/* Pstore */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-3 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="pstore"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Pstore
                    </label>
                    <input
                      id="pstore"
                      name="pstore"
                      type="number"
                      {...register("pstore")}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Onesignal Key ID */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="onesignal_keyId"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Onesignal Key ID
                    </label>
                    <input
                      id="onesignal_keyId"
                      name="onesignal_keyId"
                      type="text"
                      {...register("onesignal_keyId", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Onesignal API Key */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="onesignal_apikey"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Onesignal API Key
                    </label>
                    <div className="relative">
                      <input
                        id="onesignal_apikey"
                        name="onesignal_apikey"
                        type={showOnesignalApiKey ? "text" : "password"}
                        {...register("onesignal_apikey", { required: true })}
                        className="border rounded-lg p-3 mt-1 w-full h-14 pr-10"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #EAEAFF",
                        }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={() =>
                          togglePasswordVisibility("onesignal_apikey")
                        }
                      >
                        {showOnesignalApiKey ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Onesignal App ID */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-3 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="onesignal_appId"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Onesignal App ID
                    </label>
                    <input
                      id="onesignal_appId"
                      name="onesignal_appId"
                      type="text"
                      {...register("onesignal_appId", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Scredit */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="scredit"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Scredit
                    </label>
                    <input
                      id="scredit"
                      name="scredit"
                      type="number"
                      {...register("scredit")}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Rcredit */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="rcredit"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Rcredit
                    </label>
                    <input
                      id="rcredit"
                      name="rcredit"
                      type="number"
                      {...register("rcredit")}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>
                </div>

                {/* Delivery Charges */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-3 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="delivery_charges"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Delivery Charges
                    </label>
                    <input
                      id="delivery_charges"
                      name="delivery_charges"
                      type="number"
                      {...register("delivery_charges", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Store Charges */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="store_charges"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Store Charges
                    </label>
                    <input
                      id="store_charges"
                      name="store_charges"
                      type="number"
                      {...register("store_charges", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>

                  {/* Tax */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="tax"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Tax
                    </label>
                    <input
                      id="tax"
                      name="tax"
                      type="number"
                      {...register("tax", { required: true })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                  </div>
                </div>

                {/* Referral Amount and Minimum Subscription Days */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-3 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="refferal_amount"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Referral Amount
                    </label>
                    <input
                      id="refferal_amount"
                      name="refferal_amount"
                      type="number"
                      {...register("refferal_amount", {
                        min: { value: 0, message: "Referral amount cannot be negative" },
                      })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                    {errors.refferal_amount && (
                      <p className="text-red-500 text-sm text-start">
                        {errors.refferal_amount.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="minimum_subscription_days"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Minimum Subscription Days
                    </label>
                    <input
                      id="minimum_subscription_days"
                      name="minimum_subscription_days"
                      type="number"
                      {...register("minimum_subscription_days", {
                        required: "Minimum subscription days is required",
                        min: { value: 1, message: "Must be at least 1 day" },
                      })}
                      className="border rounded-lg p-3 mt-1 w-full h-14"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAFF",
                      }}
                    />
                    {errors.minimum_subscription_days && (
                      <p className="text-red-500 text-sm text-start">
                        {errors.minimum_subscription_days.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Wallet Amount Suggestions */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                  <div className="flex flex-col">
                    <label
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Wallet Amount Suggestions (6 Options)
                    </label>
                    <div className="grid grid-cols-3 gap-4 mt-1">
                      {walletSuggestions.map((value, index) => (
                        <input
                          key={index}
                          type="number"
                          value={value}
                          onChange={(e) => handleWalletSuggestionChange(index, e.target.value)}
                          className="border rounded-lg p-3 w-full h-14"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #EAEAFF",
                          }}
                          placeholder={`Option ${index + 1}`}
                          min="0"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Boy Tip Suggestions */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                  <div className="flex flex-col">
                    <label
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      Delivery Boy Tip Suggestions (4 Options)
                    </label>
                    <div className="grid grid-cols-4 gap-4 mt-1">
                      {tipSuggestions.map((value, index) => (
                        <input
                          key={index}
                          type="number"
                          value={value}
                          onChange={(e) => handleTipSuggestionChange(index, e.target.value)}
                          className="border rounded-lg p-3 w-full h-14"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #EAEAFF",
                          }}
                          placeholder={`Option ${index + 1}`}
                          min="0"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-2 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="terms_conditions"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Terms & Conditions
                    </label>
                    <JoditEditor
                      ref={termsEditorRef}
                      value={termsContent}
                      config={config}
                      onBlur={(newContent) => setTermsContent(newContent)}
                    />
                  </div>

                  {/* Privacy Policy */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="privacy_policy"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Privacy Policy
                    </label>
                    <JoditEditor
                      ref={privacyEditorRef}
                      value={privacyContent}
                      config={config}
                      onBlur={(newContent) => setPrivacyContent(newContent)}
                    />
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="grid gap-4 w-full sm:grid-cols-1 mt-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="cancellation_policy"
                      className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                    >
                      <span style={{ color: "red" }}>*</span> Cancellation Policy
                    </label>
                    <JoditEditor
                      ref={cancellationEditorRef}
                      value={cancellationContent}
                      config={config}
                      onBlur={(newContent) => setCancellationContent(newContent)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-start mt-6 gap-3">
              <button
  type="submit"
  className={`mt-6 bg-[#393185] text-white py-2 px-4 rounded flex items-center justify-center ${
    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
  }`}
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ) : null}
  {isSubmitting
    ? "Submitting..."
    : id
    ? "Update Settings"
    : "Add Settings"}
</button>

                </div>
              </form>
            </div>
          </div>
        </div>
        <NotificationContainer />
      </main>
    </div>
  );
};

export default Settings;