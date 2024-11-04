import { isToday, format } from "date-fns";

import { cn } from "../../utils";
import { ptBR } from "date-fns/locale";

export type WeekDayLabelProps = {
  day: Date;
};

export const WeekDayLabel: React.FC<WeekDayLabelProps> = ({ day }) => {
  const isDayToday = isToday(day);

  return (
    <div className="flex-1 w-44 m-w-44 flex flex-col items-center ">
      <span aria-hidden className="text-md text-gray-400">
        {format(day, "iiii", { locale: ptBR })}
      </span>
      <div
        aria-label={day.toDateString()}
        className={cn(
          "w-11 h-11 min-w-11 rounded-full flex items-center justify-center text-2xl font-medium text-gray-400",
          isDayToday && "text-white bg-blue-400"
        )}
      >
        <p className="leading-[44px]">{format(day, "d")}</p>
      </div>
    </div>
  );
};
