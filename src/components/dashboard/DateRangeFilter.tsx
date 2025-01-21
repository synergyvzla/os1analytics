import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangeFilter({ date, setDate }: DateRangeFilterProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="space-y-3">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </div>
      </CardContent>
    </Card>
  );
}