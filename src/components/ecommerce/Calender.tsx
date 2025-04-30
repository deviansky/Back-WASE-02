import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import PageMeta from "../components/common/PageMeta";

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <>
    <PageMeta
    title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
    description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
    />
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow"
    />
    </>
  )
}
