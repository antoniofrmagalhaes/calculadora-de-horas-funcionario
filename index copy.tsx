import React, { useState, useRef } from 'react';
import { Box, Text, Stack, HStack, Flex, Grid, GridItem, Button } from '@chakra-ui/react';
import { DatePicker } from 'rsuite';
import { BsCalendar2MonthFill } from 'react-icons/bs';
import 'rsuite/dist/rsuite.min.css';

import { DayRow, DayRowHandle } from '@/components/DayRow';

function getDaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = janeiro, 11 = dezembro
  return new Date(year, month + 1, 0).getDate();
}

const dayOfWeekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function HomePage(): JSX.Element {
  // Data selecionada
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Número de dias do mês
  const daysInSelectedMonth = getDaysInMonth(selectedDate);

  // Precisamos de uma ref para cada DayRow => guardamos num objeto (ou array)
  const dayRefs = useRef<Record<number, React.RefObject<DayRowHandle>>>({});

  // Inicializa as refs para cada dia
  // (isso pode ser feito dentro do map, se não existir cria)
  const getDayRef = (day: number) => {
    if (!dayRefs.current[day]) {
      dayRefs.current[day] = React.createRef<DayRowHandle>();
    }
    return dayRefs.current[day];
  };

  // Estado para exibir o total calculado
  const [totals, setTotals] = useState({
    normal: 0,
    extra: 0,
    noturno: 0,
  });

  // Função para rodar quando clicarmos em "CALCULAR"
  const handleCalculate = () => {
    let somaNormal = 0;
    let somaExtra = 0;
    let somaNoturno = 0;

    // Loop em cada dia do mês
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
  };

  // Formata para HH:MM
  const formatHHmm = (min: number) => {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  return (
    <Box w="100%" p={6} bg="gray.100">
      <Stack spacing={6}>
        {/* Cabeçalho com DatePicker */}
        <Flex justifyContent="space-between" alignItems="center">
          {/* Se quiser mover para outro canto, à vontade */}
          <DatePicker
            format="MMM yyyy"
            caretAs={BsCalendar2MonthFill}
            placement="bottomStart"
            value={selectedDate}
            onChange={value => {
              if (value) setSelectedDate(value);
            }}
          />

          <Button colorScheme="blue" onClick={handleCalculate}>
            CALCULAR
          </Button>
        </Flex>

        <Stack spacing={4}>
          {/* Grid Fixo (Cabeçalho) */}
          <Grid templateColumns="repeat(10, 1fr)" gap={4}>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={1}
              colEnd={2}
              bg="teal.100"
              p={2}
            >
              DIA
            </GridItem>

            <GridItem colStart={2} colEnd={4} rowStart={1} bg="blue.100" p={2}>
              1 Turno
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={2}>
                <GridItem bg="blue.200" p={2}>
                  Entrada
                </GridItem>
                <GridItem bg="blue.300" p={2}>
                  Saída
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colStart={4} colEnd={6} rowStart={1} bg="green.100" p={2}>
              2 Turno
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={2}>
                <GridItem bg="green.200" p={2}>
                  Entrada
                </GridItem>
                <GridItem bg="green.300" p={2}>
                  Saída
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colStart={6} colEnd={8} rowStart={1} bg="orange.100" p={2}>
              Extra
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={2}>
                <GridItem bg="orange.200" p={2}>
                  Entrada
                </GridItem>
                <GridItem bg="orange.300" p={2}>
                  Saída
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={8}
              colEnd={9}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Horas Trabalhadas
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={9}
              colEnd={10}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Horas Extras
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={10}
              colEnd={11}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Adicional Noturno
            </GridItem>
          </Grid>

          {/* Lista de dias */}
          <Stack spacing={4}>
            {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map(day => {
              // Dia da semana
              const year = selectedDate.getFullYear();
              const month = selectedDate.getMonth();
              const currentDayDate = new Date(year, month, day);
              const dayOfWeekIndex = currentDayDate.getDay();
              const dayOfWeek = dayOfWeekNames[dayOfWeekIndex];

              return (
                <DayRow
                  key={day}
                  ref={getDayRef(day)} // <-- aqui associamos a ref
                  day={day}
                  dayOfWeek={dayOfWeek}
                />
              );
            })}
          </Stack>

          {/* Linha de TOTAIS */}
          <Grid templateColumns="repeat(10, 1fr)" gap={4}>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={8}
              colEnd={9}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Total H.Normais
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={9}
              colEnd={10}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Total H.Extras
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={10}
              colEnd={11}
              rowStart={1}
              bg="pink.100"
              p={2}
            >
              Total AD.Noturno
            </GridItem>
          </Grid>

          <Grid templateColumns="repeat(10, 1fr)" gap={4}>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={8}
              colEnd={9}
              bg="pink.100"
              p={2}
            >
              {formatHHmm(totals.normal)}
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={9}
              colEnd={10}
              bg="pink.100"
              p={2}
            >
              {formatHHmm(totals.extra)}
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={10}
              colEnd={11}
              bg="pink.100"
              p={2}
            >
              {formatHHmm(totals.noturno)}
            </GridItem>
          </Grid>
        </Stack>
      </Stack>
    </Box>
  );
}
