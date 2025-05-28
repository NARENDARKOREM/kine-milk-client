import React from "react";
import { RingLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
<RingLoader
  color="#393185"
  speedMultiplier={1}
/>
    </div>
  );
};

export default Loader;
