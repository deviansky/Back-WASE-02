import { useState, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
}

interface ChartTabProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function ChartTab({ tabs, activeTab, onChange }: ChartTabProps) {
  const [active, setActive] = useState(activeTab);

  // Sync with parent component's state
  useEffect(() => {
    setActive(activeTab);
  }, [activeTab]);

  const handleClick = (tabId: string) => {
    setActive(tabId);
    onChange(tabId);
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            active === tab.id
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}