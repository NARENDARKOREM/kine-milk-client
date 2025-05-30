import React, { useEffect, useState } from "react";
import Header from "../../common/Header";
import InnerHeader from "../Coupon/CouponHeader";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import api from "../../utils/api";
import MilkLoader from "../../utils/MilkLoader";
import { ReactComponent as LeftArrow } from "../../assets/images/Left Arrow.svg";
import { ReactComponent as RightArrow } from "../../assets/images/Right Arrow.svg";

const Productreviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setShowLoader(true);
      try {
        const response = await api.get("/reviews/productreviews");
        console.log(response, "rrrrrrrrrrrrrrrrrrrrr");
        setReviews(response.data.reviews || []);
        setFilteredReviews(response.data.reviews || []);
      } catch (error) {
        NotificationManager.error(
          `Failed to fetch reviews: ${error.response?.data?.message || error.message}`,
          "Error",
          3000
        );
      } finally {
        setIsLoading(false);
        setTimeout(() => setShowLoader(false), 2000);
      }
    };
    fetchReviews();
  }, []);

  const handleSearch = (event) => {
  const query = event.target.value.toLowerCase();
  const filtered = reviews.filter((review) => {
    const username = review.UserDetails?.name?.toLowerCase() || "";
    const productName = review.productDetails?.title?.toLowerCase() || "";
    const reviewText = review.review?.toLowerCase() || "";
    const createdAt = review.createdAt
      ? new Date(review.createdAt).toISOString().split("T")[0]
      : "";
    const rating = String(review.rating || "").toLowerCase();

    return (
      username.includes(query) ||
      productName.includes(query) ||
      reviewText.includes(query) ||
      createdAt.includes(query) ||
      rating.includes(query)
    );
  });

  setFilteredReviews(filtered);
  setCurrentPage(1);
};


  const openReviewModal = (review) => {
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
  };

  const openProductModal = (review) => {
    setSelectedProduct(review);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = Array.isArray(filteredReviews)
    ? filteredReviews.slice(indexOfFirstReview, indexOfLastReview)
    : [];
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredReviews.length);

  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.min(Math.max(rating || 0, 0), maxStars);
    return (
      <div className="flex">
        {[...Array(maxStars)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${
              index < filledStars ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex">
      <div className="flex flex-1 flex-col bg-[#f7fbff]">
        <Header />
        <InnerHeader onSearch={handleSearch} name={"Product Reviews"} />
        <div className="p-4 flex-1 overflow-auto scrollbar-color h-[78vh]">
          <div className="bg-white border border-[#EAEAFF] shadow-sm rounded-md p-2 h-[max-content]">
            <table className="w-full text-[12px]" aria-label="Product reviews table">
              <thead className="text-[12px] text-black font-bold">
                <tr className="border-b-[1px] border-[#F3E6F2] bg-white">
                  <th className="p-2 font-medium text-left">S.No.</th>
                  <th className="p-2 font-medium text-left">Username</th>
                  <th className="p-2 font-medium text-left">Product Name</th>
                  <th className="p-2 font-medium text-left">Product Image</th>
                  <th className="p-2 font-medium text-left">Rating</th>
                  <th className="p-2 font-medium text-left">Review</th>
                  <th className="p-2 font-medium text-left">Review Date</th>
                </tr>
              </thead>
              <tbody>
                {showLoader ? (
                  <tr>
                    <td colSpan="7" className="text-center py-2">
                      <div className="flex justify-center items-center h-64 w-full">
                        <MilkLoader />
                      </div>
                    </td>
                  </tr>
                ) : currentReviews.length > 0 ? (
                  currentReviews.map((review, index) => (
                    <tr key={review.id} className="border-b border-[#F3E6F2]">
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {indexOfFirstReview + index + 1}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {review.UserDetails?.name || "N/A"}
                      </td>
                      <td
                        className="p-2 text-left text-[12px] font-medium text-[#4D5D6B] cursor-pointer hover:underline"
                        onClick={() => openProductModal(review)}
                      >
                        {review.productDetails?.title || "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {review.productDetails?.img ? (
                          <img
                            src={review.productDetails.img}
                            alt={review.productDetails.title || "Product"}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => (e.target.src = "/placeholder-image.png")}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {review.rating || "N/A"}
                      </td>
                      <td
                        className="p-2 text-left text-[12px] font-medium text-[#4D5D6B] cursor-pointer hover:underline"
                        onClick={() => openReviewModal(review)}
                      >
                        {review.review
                          ? review.review.substring(0, 20) +
                            (review.review.length > 20 ? "..." : "")
                          : "N/A"}
                      </td>
                      <td className="p-2 text-left text-[12px] font-medium text-[#4D5D6B]">
                        {review.createdAt
                          ? new Date(review.createdAt).toISOString().split("T")[0]
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-2 text-center text-[12px] font-medium text-[#4D5D6B]"
                    >
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-4 px-4">
              <div className="text-[#71717A] font-medium text-[12px]">
                Showing <span className="text-black">{startItem}-{endItem}</span> of{" "}
                <span className="text-black">{filteredReviews.length}</span> items
              </div>
              <div className="flex items-center font-medium text-[12px] gap-4">
                <button
                  className={`flex items-center gap-2 bg-[#F3E6F2] p-2 rounded ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <LeftArrow className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-[#393185]">
                  Page {String(currentPage).padStart(2, "0")} of{" "}
                  {String(totalPages).padStart(2, "0")}
                </div>
                <button
                  className={`flex items-center gap-2 bg-[#393185] p-2 px-4 rounded text-white ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <RightArrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        
        {/* Review Details Modal */}
{selectedReview && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={closeReviewModal}
  >
    <div
      className="bg-white border border-[#EAEAFF] rounded-lg p-6 w-full max-w-lg shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-bold text-[#4D5D6B]">
          Review Details
        </h2>
        <button
          className="text-[#4D5D6B] hover:text-[#393185] transition-colors"
          onClick={closeReviewModal}
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="space-y-6">
        <div className="flex gap-6">
          {/* Left: Image, Rating, Username */}
          <div className="flex flex-col items-start">
            {selectedReview.productDetails?.img ? (
              <img
                src={selectedReview.UserDetails.img}
                alt={selectedReview.productDetails.title || "Product"}
                className="w-32 h-32 object-cover rounded-md mb-2"
                onError={(e) => (e.target.src = "/placeholder-image.png")}
              />
            ) : (
              <span className="text-[14px] text-[#4D5D6B] mb-2">N/A</span>
            )}
            <div className="mb-2">{renderStars(selectedReview.rating)}</div>
            <span className="text-[14px] text-[#4D5D6B]">
              {selectedReview.UserDetails?.name || "N/A"}
            </span>
          </div>
          {/* Right: Review Date, Product Name */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-28 font-medium text-[14px] text-[#4D5D6B]">
                Review Date:
              </span>
              <span className="text-[14px] text-[#4D5D6B] flex-1">
                {selectedReview.createdAt
                  ? new Date(selectedReview.createdAt)
                      .toISOString()
                      .split("T")[0]
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-28 font-medium text-[14px] text-[#4D5D6B]">
                Product Name:
              </span>
              <span className="text-[14px] text-[#4D5D6B] flex-1">
                {selectedReview.productDetails?.title || "N/A"}
              </span>
            </div>
          </div>
        </div>
        {/* Full-width Review Section */}
        <div className="flex gap-4">
          <span className="w-28 font-medium text-[14px] text-[#4D5D6B]">
            Review:
          </span>
          <p className="text-[14px] text-[#4D5D6B] flex-1">
            {selectedReview.review || "N/A"}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Product Details Modal (Unchanged) */}
      {/* Product Details Modal */}
{selectedProduct && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={closeProductModal}
  >
    <div
      className="bg-white border border-[#EAEAFF] rounded-lg p-6 w-full max-w-lg shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-bold text-[#4D5D6B]">
          Product Details
        </h2>
        <button
          className="text-[#4D5D6B] hover:text-[#393185] transition-colors"
          onClick={closeProductModal}
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="space-y-6">
        <div className="flex gap-6">
          {/* Left: Image and related fields */}
          <div className="flex flex-col items-start">
            <span className="text-[14px] font-medium text-[#4D5D6B] mb-2">
              {selectedProduct.productDetails?.title || "N/A"}
            </span>
            {selectedProduct.productDetails?.img ? (
              <img
                src={selectedProduct.productDetails.img}
                alt={selectedProduct.productDetails.title || "Product"}
                className="w-32 h-32 object-cover rounded-md mb-2"
                onError={(e) => (e.target.src = "/placeholder-image.png")}
              />
            ) : (
              <span className="text-[14px] text-[#4D5D6B] mb-2">N/A</span>
            )}
            <span className="text-[14px] text-[#4D5D6B]">
              Discount: {selectedProduct.productDetails?.discount
                ? `${selectedProduct.productDetails.discount}%`
                : "N/A"}
            </span>
          </div>
          {/* Right: Description */}
          <div className="flex-1 space-y-4">
            <div className="flex gap-4">
              <span className="w-28 font-medium text-[14px] text-[#4D5D6B]">
                Description:
              </span>
              <p className="text-[14px] text-[#4D5D6B] flex-1">
                {selectedProduct.productDetails?.description || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        <NotificationContainer />
      </div>
    </div>
  );
};

export default Productreviews;