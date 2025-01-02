import React, {
  useState,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Grid, GridItem, Input, Text } from '@chakra-ui/react';
import { normalizeString, parseTimeString } from '@/utils/timeUtils';

export interface DayRowHandle {
  /** Retorna as horas normal, extra e noturna (em minutos). */
  getTotals: () => {
    normal: number;   // em minutos
    extra: number;    // em minutos
    noturno: number;  // em minutos
  };
}

/**
 * Propriedades esperadas pelo componente DayRow.
 */
interface DayRowProps {
  day: number;      // Dia do mês (1..31).
  dayOfWeek: string; // Nome/Abreviação do dia da semana (ex.: "Seg", "Ter", "Sáb", "Dom").
}

/**
 * Constantes para adicional noturno: [22:00..05:00]
 */
const INICIO_ADICIONAL_NOTURNO = 22 * 60; // 22:00 => 1320
const FIM_ADICIONAL_NOTURNO = 5 * 60;     // 05:00 => 300

// Cargas diárias obrigatórias em minutos:
const CARGA_DIARIA_SEMANA = 8 * 60;       // 8h
const CARGA_DIARIA_FIM_SEMANA = 4 * 60;   // 4h

/**
 * Função que calcula quantos minutos de [start..end] caem no intervalo [22:00..24:00] + [00:00..05:00].
 */
function calcAdicionalNoturno(startMin: number, endMin: number): number {
  function overlap(s: number, e: number, x: number, y: number): number {
    if (e <= x || s >= y) return 0;
    const ini = Math.max(s, x);
    const fim = Math.min(e, y);
    return Math.max(0, fim - ini);
  }

  let totalNight = 0;
  if (endMin >= startMin) {
    // Intervalo normal (não cruza meia-noite)
    totalNight += overlap(startMin, endMin, INICIO_ADICIONAL_NOTURNO, 1440);
    totalNight += overlap(startMin, endMin, 0, FIM_ADICIONAL_NOTURNO);
  } else {
    // Cruza meia-noite
    totalNight += overlap(startMin, 1440, INICIO_ADICIONAL_NOTURNO, 1440);
    totalNight += overlap(startMin, 1440, 0, FIM_ADICIONAL_NOTURNO);
    totalNight += overlap(0, endMin, INICIO_ADICIONAL_NOTURNO, 1440);
    totalNight += overlap(0, endMin, 0, FIM_ADICIONAL_NOTURNO);
  }
  return totalNight;
}

/**
 * Implementação do componente DayRow com forwardRef
 */
function DayRowComponent(
  { day, dayOfWeek }: DayRowProps,
  ref: React.Ref<DayRowHandle>
) {
  // Estado local: horários digitados
  const [values, setValues] = useState({
    turno_1_entrada: '',
    turno_1_saida: '',
    turno_2_entrada: '',
    turno_2_saida: '',
    extra_entrada: '',
    extra_saida: '',
  });

  // Refs para auto-jump
  const inputRefs = {
    turno_1_entrada: useRef<HTMLInputElement>(null),
    turno_1_saida: useRef<HTMLInputElement>(null),
    turno_2_entrada: useRef<HTMLInputElement>(null),
    turno_2_saida: useRef<HTMLInputElement>(null),
    extra_entrada: useRef<HTMLInputElement>(null),
    extra_saida: useRef<HTMLInputElement>(null),
  };

  // Ordem de auto-jump
  const fieldOrder = [
    'turno_1_entrada',
    'turno_1_saida',
    'turno_2_entrada',
    'turno_2_saida',
    'extra_entrada',
    'extra_saida',
  ] as const;

  /**
   * handleChange: restringe a 0..4 dígitos e faz auto-jump quando chega a 4.
   */
  const handleChange = (field: keyof typeof values, newValue: string) => {
    if (!/^\d{0,4}$/.test(newValue)) {
      return;
    }
    setValues(prev => ({ ...prev, [field]: newValue }));

    if (newValue.length === 4) {
      const currentIndex = fieldOrder.indexOf(field);
      if (currentIndex >= 0 && currentIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentIndex + 1];
        inputRefs[nextField].current?.focus();
      }
    }
  };

  // Verifica se é sábado ou domingo
  const normalizedDay = normalizeString(dayOfWeek);
  const isSunday = normalizedDay === 'dom';
  const isSaturday = normalizedDay === 'sab';
  const isWeekend = isSaturday || isSunday;

  // Total de minutos do dia
  const totalMinutes = useMemo(() => {
    function duration(s: number, e: number) {
      if (s === 0 && e === 0) return 0;
      return e >= s ? e - s : 1440 - s + e; // cruza meia-noite
    }
    const t1Start = parseTimeString(values.turno_1_entrada);
    const t1End = parseTimeString(values.turno_1_saida);
    const t2Start = parseTimeString(values.turno_2_entrada);
    const t2End = parseTimeString(values.turno_2_saida);
    const xStart = parseTimeString(values.extra_entrada);
    const xEnd = parseTimeString(values.extra_saida);

    const total = duration(t1Start, t1End) + duration(t2Start, t2End) + duration(xStart, xEnd);
    return total;
  }, [values]);

  // Horas extras
  const extraMinutes = useMemo(() => {
    const requiredHours = isWeekend ? CARGA_DIARIA_FIM_SEMANA : CARGA_DIARIA_SEMANA;
    const excedente = totalMinutes - requiredHours;
    return excedente > 0 ? excedente : 0;
  }, [totalMinutes, isWeekend]);

  // Adicional noturno
  const adicionalNoturnoMinutos = useMemo(() => {
    const t1Start = parseTimeString(values.turno_1_entrada);
    const t1End = parseTimeString(values.turno_1_saida);
    const t2Start = parseTimeString(values.turno_2_entrada);
    const t2End = parseTimeString(values.turno_2_saida);
    const xStart = parseTimeString(values.extra_entrada);
    const xEnd = parseTimeString(values.extra_saida);

    return (
      calcAdicionalNoturno(t1Start, t1End) +
      calcAdicionalNoturno(t2Start, t2End) +
      calcAdicionalNoturno(xStart, xEnd)
    );
  }, [values]);

  // Verificação de ERRO de parse
  const isErroParse = useMemo(() => {
    return Object.values(values).some(v => {
      // Se 4 dígitos e parse=0 mas não é '0000'
      if (v.length === 4 && parseTimeString(v) === 0 && v !== '0000') {
        return true;
      }
      return false;
    });
  }, [values]);

  // Se total < carga diária => marcamos como "abaixo"
  const belowRequired = useMemo(() => {
    const required = isWeekend ? CARGA_DIARIA_FIM_SEMANA : CARGA_DIARIA_SEMANA;
    return totalMinutes > 0 && totalMinutes < required;
  }, [totalMinutes, isWeekend]);

  // Retorna as horas formatadas
  const formatHHmm = (min: number) => {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  // BG e cor das colunas
  const hasGlobalError = isErroParse;

  const horasTrabalhadasBg = useMemo(() => {
    if (hasGlobalError) return 'red.500';
    if (totalMinutes === 0) return 'white';
    return belowRequired ? 'red.500' : 'green.500';
  }, [hasGlobalError, totalMinutes, belowRequired]);

  const horasTrabalhadasColor = useMemo(() => {
    if (hasGlobalError) return 'white';
    if (totalMinutes === 0) return 'black';
    return 'white';
  }, [hasGlobalError, totalMinutes]);

  const horasExtrasBg = hasGlobalError ? 'red.500' : extraMinutes > 0 ? 'green.500' : 'white';
  const horasExtrasColor = hasGlobalError ? 'white' : extraMinutes > 0 ? 'white' : 'black';

  const adicionalNoturnoBg = hasGlobalError ? 'red.500' : adicionalNoturnoMinutos > 0 ? 'purple.400' : 'white';
  const adicionalNoturnoColor = hasGlobalError ? 'white' : adicionalNoturnoMinutos > 0 ? 'white' : 'black';

  // Se ERRO => inputs ficam em estilo diferenciado
  const inputStyleProps = hasGlobalError
    ? {
        focusBorderColor: '#000',
        borderColor: '#000',
        _placeholder: { color: '#000' },
        color: '#000',
      }
    : {};

  /**
   * Implementação do método "getTotals()" que será exposto ao pai via ref.
   * Retornamos os valores em minutos.
   */
  useImperativeHandle(ref, () => ({
    getTotals() {
      if (hasGlobalError) {
        // Se tem ERRO, podemos retornar 0 (ou um objeto indicando erro)
        return { normal: 0, extra: 0, noturno: 0 };
      }
      // Horas normais => totalMinutes - extraMinutes (mínimo 0)
      const normal = Math.max(totalMinutes - extraMinutes, 0);
      return {
        normal,
        extra: extraMinutes,
        noturno: adicionalNoturnoMinutos,
      };
    },
  }));

  return (
    <Grid
      templateColumns="repeat(10, 1fr)"
      gap={4}
      bg={hasGlobalError ? 'red.500' : 'inherit'}
      border={hasGlobalError ? '1px solid #000' : 'none'}
      borderRadius="md"
    >
      {/* DIA e DIA DA SEMANA */}
      <GridItem
        display="flex"
        alignItems="center"
        justifyContent="center"
        colStart={1}
        colEnd={2}
        bg={hasGlobalError ? 'red.500' : 'teal.50'}
        color={hasGlobalError ? 'white' : 'black'}
        p={2}
      >
        <Text fontWeight="bold">
          {day} - {dayOfWeek}
        </Text>
      </GridItem>

      {/* TURNO 1 */}
      <GridItem colStart={2} colEnd={4} bg="white" p={2}>
        <Grid
          templateColumns="repeat(2, 1fr)"
          gap={2}
          style={isSunday ? { opacity: 0.8, pointerEvents: 'none' } : {}}
        >
          <GridItem>
            <Input
              placeholder="Entrada"
              size="sm"
              value={values.turno_1_entrada}
              onChange={e => handleChange('turno_1_entrada', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.turno_1_entrada}
              disabled={isSunday}
            />
          </GridItem>
          <GridItem>
            <Input
              placeholder="Saída"
              size="sm"
              value={values.turno_1_saida}
              onChange={e => handleChange('turno_1_saida', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.turno_1_saida}
              disabled={isSunday}
            />
          </GridItem>
        </Grid>
      </GridItem>

      {/* TURNO 2 */}
      <GridItem colStart={4} colEnd={6} bg="white" p={2}>
        <Grid
          templateColumns="repeat(2, 1fr)"
          gap={2}
          style={isSunday ? { opacity: 0.8, pointerEvents: 'none' } : {}}
        >
          <GridItem>
            <Input
              placeholder="Entrada"
              size="sm"
              value={values.turno_2_entrada}
              onChange={e => handleChange('turno_2_entrada', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.turno_2_entrada}
              disabled={isSunday}
            />
          </GridItem>
          <GridItem>
            <Input
              placeholder="Saída"
              size="sm"
              value={values.turno_2_saida}
              onChange={e => handleChange('turno_2_saida', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.turno_2_saida}
              disabled={isSunday}
            />
          </GridItem>
        </Grid>
      </GridItem>

      {/* EXTRA */}
      <GridItem colStart={6} colEnd={8} bg="white" p={2}>
        <Grid
          templateColumns="repeat(2, 1fr)"
          gap={2}
          style={isSunday ? { opacity: 0.8, pointerEvents: 'none' } : {}}
        >
          <GridItem>
            <Input
              placeholder="Entrada"
              size="sm"
              value={values.extra_entrada}
              onChange={e => handleChange('extra_entrada', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.extra_entrada}
              disabled={isSunday}
            />
          </GridItem>
          <GridItem>
            <Input
              placeholder="Saída"
              size="sm"
              value={values.extra_saida}
              onChange={e => handleChange('extra_saida', e.target.value)}
              {...inputStyleProps}
              ref={inputRefs.extra_saida}
              disabled={isSunday}
            />
          </GridItem>
        </Grid>
      </GridItem>

      {/* HORAS TRABALHADAS */}
      <GridItem
        colStart={8}
        colEnd={9}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={horasTrabalhadasBg}
        color={horasTrabalhadasColor}
        p={2}
        fontWeight="bold"
      >
        {hasGlobalError
          ? 'ERRO'
          : totalMinutes === 0
          ? isSunday
            ? '--'
            : '00:00'
          : formatHHmm(totalMinutes)}
      </GridItem>

      {/* HORAS EXTRAS */}
      <GridItem
        colStart={9}
        colEnd={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={hasGlobalError ? 'red.500' : horasExtrasBg}
        color={hasGlobalError ? 'white' : horasExtrasColor}
        p={2}
        fontWeight="bold"
      >
        {hasGlobalError
          ? 'ERRO'
          : extraMinutes > 0
          ? formatHHmm(extraMinutes)
          : isSunday
          ? '--'
          : '00:00'}
      </GridItem>

      {/* ADICIONAL NOTURNO */}
      <GridItem
        colStart={10}
        colEnd={11}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={hasGlobalError ? 'red.500' : adicionalNoturnoBg}
        color={hasGlobalError ? 'white' : adicionalNoturnoColor}
        p={2}
        fontWeight="bold"
      >
        {hasGlobalError
          ? 'ERRO'
          : adicionalNoturnoMinutos > 0
          ? formatHHmm(adicionalNoturnoMinutos)
          : isSunday
          ? '--'
          : '00:00'}
      </GridItem>
    </Grid>
  );
}

// Exportamos usando forwardRef para permitir pegar o "getTotals()"
export const DayRow = forwardRef(DayRowComponent);
