import React from "react";
import axios from "axios";

const ImageUploader = ({ onUploadSuccess, uploadPreset = "infinitum-task", cloudName = "dhr4xnftl" }) => {
  const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("No file selected. Please select a valid image file.");
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      alert("Invalid file type. Only PNG, JPEG, JPG, SVG, and WEBP formats are allowed.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; 
    if (file.size > maxSizeInBytes) {
      alert("File size exceeds the maximum allowed size of 5MB.");
      return;
    }

    const imageFormData = new FormData();
    imageFormData.append("file", file);
    imageFormData.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        imageFormData
      );
      const imageUrl = res.data.secure_url;
      if (onUploadSuccess) {
        onUploadSuccess(imageUrl);
      }
      console.log("Image uploaded successfully:", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload the image. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".png, .jpeg, .jpg, .svg, .webp"
        onChange={handleImageUpload}
        className="border rounded-lg p-3 mt-1 w-full h-14"
        style={{ borderRadius: "8px", border: "1px solid #EAEAFF" }}
      />
    </div>
  );
};

export default ImageUploader;
