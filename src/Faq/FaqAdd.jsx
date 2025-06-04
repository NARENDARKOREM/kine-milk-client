import React, { useEffect } from "react";
import Header from "../common/Header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import api from "../utils/api";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import Select from "react-select";
import { AiOutlineDown } from "react-icons/ai";
import SimpleHeader from "../common/SimpleHeader";
import MilkLoader from "../utils/MilkLoader";

const FaqAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
      answer: "",
      status: "",
    },
  });

  const location = useLocation();
  const id = location.state ? location.state.id : null;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Watch the status field to get its current value
  const statusValue = watch("status");

  useEffect(() => {
    if (id) {
      getFAQ(id);
    }
  }, [id]);

  const getFAQ = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await api.get(`/faq/getbyid/${id}`);
      const faq = response.data;
      reset({
        question: faq.question || "",
        answer: faq.answer || "",
        status: String(faq.status) || "", // Convert status to string
      });
      setValue("status", String(faq.status) || ""); // Ensure status is set as a string
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      NotificationManager.error("Failed to fetch FAQ data.");
    } finally {
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = {
        id: id || undefined,
        question: data.question,
        answer: data.answer,
        status: data.status,
      };

      const response = await api.post(`/faq/upsert`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      NotificationManager.removeAll();
      NotificationManager.success(id ? "FAQ Updated Successfully!" : "FAQ Added Successfully!");
      setTimeout(() => {
        navigate("/admin/faq-list");
      }, 2000);
    } catch (error) {
      NotificationManager.removeAll();
      console.error("Error submitting FAQ:", error);
      NotificationManager.error("An error occurred while submitting the FAQ. Please try again later.");
    } finally {
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  const handleSelectChange = (selectedOption) => {
    setValue("status", selectedOption.value, { shouldValidate: true });
  };

  const customStyles = {
  control: (base, { isFocused }) => ({
    ...base,
    border: isFocused ? "2px solid #393185" : "1px solid #B0B0B0",
    boxShadow: "none",
    borderRadius: "5px",
    padding: "0px",
    fontSize: "12px",
    height: "42px",
    transition: "border-color 0.2s ease-in-out",
    "&:hover": {
      border: "2px solid #393185",
    },
    zIndex: 1,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10001,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10001,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#B0B0B0" : isFocused ? "#393185" : "white",
    color: isSelected ? "white" : isFocused ? "white" : "#757575",
    fontSize: "12px",
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

  const statusOptions = [
    { value: "1", label: "Publish" },
    { value: "0", label: "Unpublish" },
  ];

  return (
    <div className="bg-[#f7fbff] h-full">
      <div className="flex">
        <main className="flex-grow">
          <Header />
          <div className="container mx-auto">
            <SimpleHeader name={"FAQ's Management"} />

            <div className="h-full px-6 max-w-5xl" style={{ paddingTop: "24px" }}>

                <div
                  className="bg-white h-[67vh] w-[76vw] rounded-xl border border-[#EAE5FF] py-4 px-6 overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      {/* FAQ Question */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="question"
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          FAQ's Question<span className="text-red-500">*</span>
                        </label>
                        <input
                          id="question"
                          {...register("question", { required: "FAQ's question is required" })}
                          type="text"
                          className="border rounded-lg p-3 mt-1 w-full h-14"
                          style={{ borderRadius: "8px", border: "1px solid #EAEAFF" }}
                          placeholder="Enter question"
                        />
                        {errors.question && (
                          <p className="text-red-500 text-sm text-start">{errors.question.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      {/* FAQ Answer */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="answer"
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          FAQ's Answer<span className="text-red-500">*</span>
                        </label>
                        <input
                          id="answer"
                          {...register("answer", { required: "FAQ's answer is required" })}
                          type="text"
                          className="border rounded-lg p-3 mt-1 w-full h-14"
                          style={{ borderRadius: "8px", border: "1px solid #EAEAFF" }}
                          placeholder="Enter answer"
                        />
                        {errors.answer && (
                          <p className="text-red-500 text-sm text-start">{errors.answer.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-1 mt-6">
                      {/* FAQ Status */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="status"
                          className="text-sm font-medium text-start text-[12px] font-[Montserrat]"
                        >
                          FAQ's Status<span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={statusOptions.find((option) => option.value === statusValue)}
                          onChange={handleSelectChange}
                          options={statusOptions}
                          styles={customStyles}
                          placeholder="Select Status"
                          isSearchable={false}
                          components={{
                            DropdownIndicator: () => <AiOutlineDown className="w-4 h-4" />,
                            IndicatorSeparator: () => null,
                          }}
                        />
                        {errors.status && (
                          <p className="text-red-500 text-sm text-start">{errors.status.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
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
    ? "Update FAQ"
    : "Add FAQ"}
</button>

                    </div>
                  </form>
                </div>
          
            </div>
          </div>
        </main>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default FaqAdd;