"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { attendanceStore } from "@/store/attendance";

const Calendar = () => {
  const updateDate = attendanceStore((state) => state.updateDate);

  const handleDateClick = (arg) => {
    // alert(arg.dateStr);
    updateDate(arg.dateStr);
    console.log(arg);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        dateClick={handleDateClick}
        initialView="dayGridMonth"
        // weekends={false}
        height={600}
        events={[
          { title: "P - 40", date: "2024-04-01" },
          { title: "A - 40", date: "2024-04-01" },
          { title: "event 2", date: "2024-04-02" },
        ]}
      />
    </div>
  );
};

export default Calendar;
