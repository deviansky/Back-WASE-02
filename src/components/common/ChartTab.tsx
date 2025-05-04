import { useState } from "react";

interface ChartTabProps {
  onPeriodChange: (period: "monthly" | "quarterly" | "yearly") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ onPeriodChange }) => {
  const [selected, setSelected] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");

  const getButtonClass = (option: "monthly" | "quarterly" | "yearly") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const handleTabChange = (option: "monthly" | "quarterly" | "yearly") => {
    setSelected(option);
    onPeriodChange(option);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => handleTabChange("monthly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "monthly"
        )}`}
      >
        Bulanan
      </button>

      <button
        onClick={() => handleTabChange("quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "quarterly"
        )}`}
      >
        Triwulanan
      </button>

      <button
        onClick={() => handleTabChange("yearly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "yearly"
        )}`}
      >
        Tahunan
      </button>
    </div>
  );
};

export default ChartTab;