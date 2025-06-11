import { motion } from "framer-motion";
import { FaGlassWhiskey, FaTint } from "react-icons/fa";
import { GiMilkCarton } from "react-icons/gi";

const MilkLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
      {/* Animated Milk Bottle */}
      <motion.div 
        className="text-[#393185] text-6xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <GiMilkCarton />
      </motion.div>

      {/* Milk Pouring Animation */}
      <motion.div
        className="text-blue-400 text-3xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: [0, 1, 0], y: [0, 15, 30] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
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
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        Pouring Freshness...
      </motion.div>
    </div>
  );
};

export default MilkLoader;
