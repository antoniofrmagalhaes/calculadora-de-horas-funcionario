import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { DayRowHandle } from '@/components/DayRow';
import { getDaysInMonth } from 'date-fns';

// Aqui movemos as constantes para o contexto
const INITIAL_ADICIONAL_NOTURNO = {
  inicio: 22 * 60, // 22:00 => 1320
  fim: 5 * 60,     // 05:00 => 300
};

const INITIAL_CARGA_DIARIA = {
  semana: 8 * 60,       // 8h
  fimSemana: 4 * 60,    // 4h
};

// Defina a interface do que você vai expor no contexto
interface IApplicationContextProps {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  daysInSelectedMonth: number;
  dayOfWeekNames: string[];
  dayRefs: React.MutableRefObject<Record<number, React.RefObject<DayRowHandle>>>;
  totals: {
    normal: number;
    extra: number;
    noturno: number;
  };
  handleCalculate: () => void;
  handleClear: () => void;
  formatHHmm: (min: number) => string;
  adicionalNoturno: { inicio: number; fim: number };
  setAdicionalNoturno: (inicio: number, fim: number) => void;
  cargaDiaria: { semana: number; fimSemana: number };
  setCargaDiaria: (semana: number, fimSemana: number) => void;
}

interface IApplicationProvider {
  children: ReactNode;
}

export const ApplicationContext = createContext<IApplicationContextProps>(
  {} as IApplicationContextProps
);

const ApplicationProvider: FC<IApplicationProvider> = ({ children }) => {
  const ctx = useProvideApplication();
  return <ApplicationContext.Provider value={ctx}>{children}</ApplicationContext.Provider>;
};

export const useApplication = (): IApplicationContextProps => {
  return useContext(ApplicationContext);
};

export function useProvideApplication(): IApplicationContextProps {
  // Data selecionada
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Número de dias do mês (recalcula se a data mudar)
  const daysInSelectedMonth = useMemo(() => {
    return getDaysInMonth(selectedDate);
  }, [selectedDate]);

  // Array com nomes dos dias da semana
  const dayOfWeekNames = useMemo(() => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], []);

  // Precisamos de uma ref para cada DayRow => guardamos num objeto
  const dayRefs = useRef<Record<number, React.RefObject<DayRowHandle>>>({});

  // Estado para exibir o total calculado
  const [totals, setTotals] = useState({
    normal: 0,
    extra: 0,
    noturno: 0,
  });

  // Adicional noturno e carga diária (estado separado)
  const [adicionalNoturno, setAdicionalNoturnoState] = useState(INITIAL_ADICIONAL_NOTURNO);
  const [cargaDiaria, setCargaDiariaState] = useState(INITIAL_CARGA_DIARIA);

  const setAdicionalNoturno = useCallback((inicio: number, fim: number) => {
    setAdicionalNoturnoState({ inicio, fim });
  }, []);

  const setCargaDiaria = useCallback((semana: number, fimSemana: number) => {
    setCargaDiariaState({ semana, fimSemana });
  }, []);

  // Função que percorre todos os days e soma total
  const handleCalculate = useCallback(() => {
    let somaNormal = 0;
    let somaExtra = 0;
    let somaNoturno = 0;

    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const refObj = dayRefs.current[day];
      if (refObj?.current) {
        const { normal, extra, noturno } = refObj.current.getTotals();
        somaNormal += normal;
        somaExtra += extra;
        somaNoturno += noturno;
      }
    }

    setTotals({
      normal: somaNormal,
      extra: somaExtra,
      noturno: somaNoturno,
    });
  }, [daysInSelectedMonth]);

  // Função para limpar todos os campos
  const handleClear = useCallback(() => {
    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const refObj = dayRefs.current[day];
      if (refObj?.current) {
        refObj.current.resetInputs();
      }
    }
    setTotals({ normal: 0, extra: 0, noturno: 0 });
  }, [daysInSelectedMonth]);

  // Formata em HH:MM
  const formatHHmm = useCallback((min: number) => {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    daysInSelectedMonth,
    dayOfWeekNames,
    dayRefs,
    totals,
    handleCalculate,
    handleClear,
    formatHHmm,
    adicionalNoturno,
    setAdicionalNoturno,
    cargaDiaria,
    setCargaDiaria,
  };
}
export default ApplicationProvider;
