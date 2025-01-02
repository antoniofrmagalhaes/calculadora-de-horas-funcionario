import React, { memo, useMemo } from 'react';
import { Stack } from '@chakra-ui/react';
import { DayRow, DayRowHandle } from '@/components/DayRow';

interface DayListProps {
  daysInSelectedMonth: number;
  selectedDate: Date;
  dayRefs: React.MutableRefObject<Record<number, React.RefObject<DayRowHandle>>>;
  dayOfWeekNames: string[];
}

const DayList: React.FC<DayListProps> = memo(({ daysInSelectedMonth, selectedDate, dayRefs, dayOfWeekNames }) => {
  // Cria uma lista memorizada dos dias
  const days = useMemo(() => {
    return Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map(day => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const currentDayDate = new Date(year, month, day);
      const dayOfWeekIndex = currentDayDate.getDay();
      const dayOfWeek = dayOfWeekNames[dayOfWeekIndex];

      return (
        <DayRow
          key={day}
          ref={(() => {
            if (!dayRefs.current[day]) {
              dayRefs.current[day] = React.createRef<DayRowHandle>();
            }
            return dayRefs.current[day];
          })()}
          day={day}
          dayOfWeek={dayOfWeek}
        />
      );
    });
  }, [daysInSelectedMonth, selectedDate, dayRefs, dayOfWeekNames]);

  return <Stack spacing={4}>{days}</Stack>;
});

export default DayList;
