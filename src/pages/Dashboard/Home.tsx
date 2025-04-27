import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";


import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <>
      <h1 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90 lg:mb-7">
        Beranda
      </h1>
      <div className="grid grid-cols-12 gap-2 md:gap-6">
        <div className="col-span-12 ">
          <EcommerceMetrics />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <StatisticsChart />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-4 flex justify-center ">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
          />    
        </div>


        {/* <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlyTarget />
          <MonthlySalesChart />
        </div>



        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
