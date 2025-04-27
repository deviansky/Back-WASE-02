import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  PageIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12 md:rounded-xl">
            <GroupIcon className="text-gray-800 size-5 md:size-6 dark:text-white/90" />
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Penghuni
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              41
            </h4>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12 md:rounded-xl">
            <PageIcon className="text-gray-800 size-5 md:size-6 dark:text-white/90" />
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Kegiatan
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              10
            </h4>
          </div>
        </div>
      </div>
      
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12 md:rounded-xl">
            <GroupIcon className="text-gray-800 size-5 md:size-6 dark:text-white/90" />
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Keuangan
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
              Rp 2.000.000
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
