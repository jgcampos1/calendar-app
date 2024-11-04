import { MonthDayView } from "./month-day-view";
import { cn } from "../../utils";
import { cva } from "class-variance-authority";
import { createWeekGroups } from "../week-view/group-events";
import { format, isToday, isSameDay, startOfMonth, getMonth } from "date-fns";

import { Event } from "../types";
import { WeekEvent } from "./group-events";

type MonthWeekViewProps = {
  week: Date[];
  week_events: WeekEvent[];
  week_day_events: Record<string, Event[]>;
  currentMonth?: number;
};

const dayLabelVariants = cva(
  "my-2 flex justify-center items-center text-sm font-semibold ",
  {
    variants: {
      variant: {
        default: "bg-transparent text-gray-500",
        today: "bg-blue-400 text-white",
      },
      size: {
        default: "w-6 h-6 rounded-full",
        startOfMonth: "px-2 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const MonthWeekView: React.FC<MonthWeekViewProps> = ({
  week,
  week_events = [],
  week_day_events = {},
  currentMonth,
}) => {
  const groups = createWeekGroups(week_events, week[3]);
  const limitedGroups = groups.slice(0, 5);
  const restEvents = groups.slice(5).flat(1);

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full flex">
        {week.map((day) => {
          const isStartOfMonth = isSameDay(day, startOfMonth(day));
          const variant = isToday(day) ? "today" : "default";
          const size = isStartOfMonth ? "startOfMonth" : "default";
          const text = isStartOfMonth
            ? format(day, "d, MMM")
            : format(day, "d");

          const className = cn(dayLabelVariants({ variant, size }));
          const dayKey = day.toISOString();
          const events = week_day_events[dayKey];

          const isDifferentMonth = getMonth(day) !== currentMonth;
          const dayClassName = isDifferentMonth ? "bg-gray-200" : "";

          return (
            <div
              onClick={() => {
                if (!isDifferentMonth)
                  alert(`abre modal para edição de preço day: ${day}`);
              }}
              key={"day-label-" + dayKey}
              className={`flex-1 min-w-44 w-44 flex flex-col items-center border-b border-l last:border-r ${dayClassName}`}
            >
              <h2 className={className}>{text}</h2>
              <MonthDayView
                day={day}
                key={dayKey}
                events={events}
                restEvents={restEvents}
                weekEventsShown={limitedGroups.length}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
