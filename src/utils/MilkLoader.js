import { motion } from "framer-motion";
import { FaGlassWhiskey, FaTint } from "react-icons/fa";
import { GiMilkCarton } from "react-icons/gi";

const MilkLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white w-full space-y-4">
      {/* Animated Milk Bottle */}
      <motion.div 
        className="text-[#393185] text-6xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} // Increased duration
      >
        <GiMilkCarton />
      </motion.div>

      {/* Milk Pouring Animation */}
      <motion.div
        className="text-blue-400 text-3xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: [0, 1, 0], y: [0, 15, 30] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} // Increased duration
      >
        <FaTint />
      </motion.div>

      {/* Glass Below */}
      <div className="text-[#393185] text-5xl">
        <FaGlassWhiskey />
      </div>

      {/* Loading Text */}
      <motion.div 
        className="text-lg font-semibold text-gray-700 mt-2"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }} // Increased duration
      >
        Pouring Freshness...
      </motion.div>
    </div>
  );
};

export default MilkLoader;
