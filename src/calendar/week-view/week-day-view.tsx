import { useCallback, useState } from "react";
import { DayProgress } from "../day-progress";
import { cn } from "../../utils";
import { createDayGroups } from "./group-events";
import {
  isToday,
  endOfDay,
  startOfDay,
  eachHourOfInterval,
  addMinutes,
  differenceInMinutes,
} from "date-fns";

import type { Event } from "../types";
import { useEventStore } from "../../store/events.store";
import { EventView } from "../components/events-view";

type WeekDayViewProps = {
  day: Date;
  events?: Event[];
};

export const WeekDayView: React.FC<WeekDayViewProps> = ({
  day,
  events = [],
}) => {
  const { addEvent, editEvent } = useEventStore();

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const isDayToday = isToday(day);
  const hours = eachHourOfInterval({
    start: startOfDay(day),
    end: endOfDay(day),
  });

  const dayGroups = createDayGroups(events);

  const [previewEvent, setPreviewEvent] = useState<Event | null>(
    null as Event | null
  );
  const [firstInteraction, setFirstInteraction] = useState<Date | null>(null);

  const handleMouseDown = useCallback(
    (time: Date) => {
      console.log("handleMouseDown");

      if (!previewEvent)
        setPreviewEvent({
          end_date: addMinutes(time, 30),
          id: String(Math.random()),
          title: "(Novo Evento)",
          start_date: time,
        });

      setFirstInteraction(time);
    },
    [previewEvent]
  );

  const handleMouseOver = useCallback(
    (time: Date) => {
      if (previewEvent) {
        if (time < previewEvent.start_date) {
          setPreviewEvent({
            ...previewEvent,
            start_date: time,
            end_date: firstInteraction || time,
          });
        } else {
          console.log("oi");
          setPreviewEvent({
            ...previewEvent,
            end_date: time,
            start_date: firstInteraction || time,
          });
        }
      }
    },
    [previewEvent, firstInteraction]
  );

  const handleMouseUp = () => {
    console.log("handleMouseUp");
    if (previewEvent) {
      if (previewEvent.start_date === previewEvent.end_date) {
        return setPreviewEvent(null);
      }
      addEvent(previewEvent);
      setPreviewEvent(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, time: Date) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const dataJson = JSON.parse(data);
    const sizeEvent = differenceInMinutes(
      dataJson.end_date,
      dataJson.start_date
    );
    const newEvent = {
      ...dataJson,
      start_date: time,
      end_date: addMinutes(time, sizeEvent),
    };
    editEvent(newEvent);
  };
  const minutes = [0, 15, 30, 45];

  const handlePreviewMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, time: Date) => {
      e.preventDefault();

      if (previewEvent) {
        if (time < previewEvent.start_date) {
          console.log("oi");
          setPreviewEvent({
            ...previewEvent,
            start_date: time,
            end_date: firstInteraction || time,
          });
        } else {
          console.log("oi");

          setPreviewEvent({
            ...previewEvent,
            start_date: time,
            end_date: firstInteraction || time,
          });
        }
      }
    },
    [previewEvent, firstInteraction]
  );
  return (
    <div
      aria-label={"Events slot for " + day.toDateString()}
      className="min-w-36 h-full flex flex-1 relative"
    >
      <div className="w-[95%] h-full absolute">
        <div className="w-full h-full relative" ref={(ref) => setRef(ref)}>
          {dayGroups.map((group) =>
            group.map((event, index) => (
              <EventView
                day={day}
                event={event}
                index={index}
                key={event.id}
                grouplength={group.length}
                containerHeight={ref?.offsetHeight || 1}
              />
            ))
          )}
          {previewEvent && (
            <EventView
              day={day}
              event={previewEvent}
              index={0}
              key={previewEvent.id}
              grouplength={1}
              containerHeight={ref?.offsetHeight || 1}
              preview
              onOver={handlePreviewMouseOver}
              onClick={() => handleMouseUp()}
            />
          )}
        </div>
      </div>
      <div className="w-44 flex flex-col">
        {hours.map((time, index) => (
          <div
            key={time.toISOString()}
            className={cn(
              "h-14 w-full border-l relative",
              "hover:bg-gray-100",
              index !== hours.length - 1 && "border-b"
            )}
          >
            {minutes?.map((quarter) => (
              <div
                className={cn("min-h-4 max-h-4", "hover:bg-gray-50")}
                onPointerDown={() => handleMouseDown(addMinutes(time, quarter))}
                onPointerUp={() => handleMouseUp()}
                onPointerOver={() => handleMouseOver(addMinutes(time, quarter))}
                onDrop={(e) => handleDrop(e, addMinutes(time, quarter))}
                onDragOver={handleDragOver}
              ></div>
            ))}
          </div>
        ))}
        {isDayToday && (
          <DayProgress
            className="left-0"
            containerHeight={ref?.offsetHeight || 1}
          />
        )}
      </div>
    </div>
  );
};
