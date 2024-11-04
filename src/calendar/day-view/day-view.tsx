import { useCallback, useState } from "react";
import { DayProgress } from "../day-progress";
import {
  format,
  isToday,
  endOfDay,
  startOfDay,
  eachHourOfInterval,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
import { groupEvents } from "./group-events";
import { cn } from "../../utils";
import type { Event } from "../types";
import { useEventStore } from "../../store/events.store";
import { EventView } from "../components/events-view";

type DayViewProps = {
  date: Date;
  events?: Event[];
};

export const DayView: React.FC<DayViewProps> = ({ date }) => {
  const { addEvent, events, editEvent } = useEventStore();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const isDayToday = isToday(date);

  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: endOfDay(date),
  });

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

  const minutes = [0, 15, 30, 45];

  return (
    <section id="calendar-day-view" className="flex-1 h-full">
      <div
        className="flex-1 max-h-full overflow-y-scroll pb-36"
        onMouseLeave={() => setPreviewEvent(null)}
      >
        <div className="relative" ref={(ref) => setRef(ref)}>
          {hours.map((time, index) => (
            <>
              {groupEvents(date, events).eventGroups.map((group) =>
                group.map((event, index) => (
                  <EventView
                    day={date}
                    event={event}
                    index={index}
                    key={event.id}
                    grouplength={group.length}
                    containerOffset={100}
                    containerHeight={ref?.offsetHeight || 1}
                  />
                ))
              )}

              <div className="h-16 flex" key={time.toISOString() + index}>
                <div className="h-full w-24 flex items-start justify-center">
                  <time
                    className={cn("text-xs m-3 select-none bg-blue-50")}
                    dateTime={format(time, "yyyy-MM-dd")}
                    draggable={false}
                  >
                    {index === 0 ? "" : format(time, "HH:mm")}
                  </time>
                </div>

                <div
                  className={cn(
                    "flex-1 border-l",
                    "hover:bg-gray-100",
                    index !== hours.length - 1 && "border-b"
                  )}
                >
                  {minutes?.map((quarter) => (
                    <>
                      {previewEvent && (
                        <EventView
                          preview
                          containerOffset={100}
                          day={date}
                          event={previewEvent}
                          index={0}
                          grouplength={1}
                          containerHeight={ref?.offsetHeight || 1}
                          onOver={handlePreviewMouseOver}
                          onClick={() => handleMouseUp()}
                        />
                      )}
                      <div
                        className={cn("min-h-4 max-h-4", "hover:bg-gray-50")}
                        onPointerDown={() =>
                          handleMouseDown(addMinutes(time, quarter))
                        }
                        onPointerUp={() => handleMouseUp()}
                        onPointerOver={() =>
                          handleMouseOver(addMinutes(time, quarter))
                        }
                        onDrop={(e) => handleDrop(e, addMinutes(time, quarter))}
                        onDragOver={handleDragOver}
                      ></div>
                    </>
                  ))}
                </div>
              </div>
            </>
          ))}
          {isDayToday && (
            <DayProgress containerHeight={ref?.offsetHeight || 1} />
          )}
        </div>
      </div>
    </section>
  );
};
