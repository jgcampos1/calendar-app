import { startOfDay, differenceInMinutes, format } from "date-fns";
import { Event } from "../types";
import { cn } from "../../utils";

const MINUTES_IN_DAY = 24 * 60;

type EventViewProps = {
  day: Date;
  event: Event;
  index: number;
  grouplength: number;
  containerHeight: number;
  preview?: boolean;
  enableDrag?: boolean;
  containerOffset?: number;
  onOver?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    time: Date
  ) => void;
  onClick?: () => void;
};

export const EventView: React.FC<EventViewProps> = ({
  day,
  event,
  index,
  grouplength,
  containerHeight,
  preview,
  enableDrag = true,
  containerOffset = 0,
  onClick,
  onOver,
}) => {
  const today = startOfDay(day);
  const eventDuration = differenceInMinutes(event.end_date, event.start_date);

  const generateBoxStyle = () => {
    const minutesPassed = differenceInMinutes(event.start_date, today);
    const top = (minutesPassed / MINUTES_IN_DAY) * containerHeight;
    const height = (eventDuration / MINUTES_IN_DAY) * containerHeight;

    const isLast = index === grouplength - 1;
    let widthPercentage = grouplength === 1 ? 1 : (1 / grouplength) * 1.7;

    if (isLast) {
      widthPercentage = 1 / grouplength;
    }

    const styles = {
      top,
      height,
      padding: "2px 8px",
      zIndex: 100 + index,
      width: `calc((100% - ${containerOffset}px) * ${widthPercentage})`,
    };

    return isLast
      ? { ...styles, right: 0 }
      : {
          ...styles,
          left: `calc(${containerOffset}px + 100% * ${
            (1 / grouplength) * index
          })`,
        };
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    data?: Event
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  return (
    <div
      style={generateBoxStyle()}
      className={cn(
        "bg-blue-900 border border-white rounded cursor-pointer absolute",
        preview && "bg-blue-300"
      )}
      onMouseOver={(e) => onOver && onOver(e, event.start_date)}
      onClick={onClick}
      draggable={enableDrag && !preview}
      onDragStart={(e) => enableDrag && handleDragStart(e, event)}
    >
      <h1 className="text-white text-xs select-none">
        {`${event.title}, ${format(event.start_date, "hh:mm")} - ${format(
          event.end_date,
          "hh:mm"
        )}`}
      </h1>
    </div>
  );
};
