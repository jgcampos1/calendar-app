import { startOfDay, differenceInMinutes, format } from "date-fns";

import { Event } from "../types";
import { cn } from "../../utils";

const MINUTES_IN_DAY = 24 * 60;

type DayEventProps = {
  day: Date;
  event: Event;
  index: number;
  grouplength: number;
  containerHeight: number;
  preview?: boolean;
  onOver?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    time: Date
  ) => void;
  onClick?: () => void;
};

export const DayEvent: React.FC<DayEventProps> = ({
  day,
  preview,
  event,
  index,
  grouplength,
  containerHeight,
  onClick,
  onOver,
}) => {
  const today = startOfDay(day);
  const eventDuration = differenceInMinutes(event.end_date, event.start_date);

  const generateBoxStyle = () => {
    const minutesPassed = differenceInMinutes(event.start_date, today);

    const percentage = minutesPassed / MINUTES_IN_DAY;

    const top = percentage * containerHeight;
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
      width: `calc((100% - 96px) * ${widthPercentage})`,
    };

    if (isLast) {
      return { ...styles, right: 0 };
    }

    return {
      ...styles,
      left: `calc(100px + 100% * ${(1 / grouplength) * index})`,
    };
  };
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    data?: Event
  ) => {
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  return (
    <div
      style={generateBoxStyle()}
      className={cn(
        "bg-blue-900 border border-white rounded cursor-pointer absolute",
        preview && "bg-indigo-300"
      )}
      onMouseOver={(e) => {
        onOver && onOver(e, event.start_date);
      }}
      onClick={onClick}
      draggable={!preview}
      onDragStart={(e) => handleDragStart(e, event)}
    >
      <h1 className="text-white text-xs select-none">
        {`${event.title}, 
        ${format(event.start_date, "hh:mm")} - 
        ${format(event.end_date, "hh:mm")}`}
      </h1>
    </div>
  );
};
