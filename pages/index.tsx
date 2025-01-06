import React from 'react';
import { Box, Stack, Grid, GridItem, useDisclosure, IconButton } from '@chakra-ui/react';
import { DatePicker } from 'rsuite';
import { BsCalendar2MonthFill } from 'react-icons/bs';
import 'rsuite/dist/rsuite.min.css';

import { useApplication } from '@/contexts/ApplicationContext';
import { RiMenuLine } from 'react-icons/ri';
import { Sidebar } from '@/components/Sidebar';
import DayList from '@/components/DayList';

export default function HomePage(): JSX.Element {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const {
    selectedDate,
    setSelectedDate,
    daysInSelectedMonth,
    dayOfWeekNames,
    dayRefs,
    totals,
    handleCalculate,
    handleClear,
    formatHHmm,
  } = useApplication();

  return (
    <Box w="100%" p={6} bg="gray.100">
      <Sidebar isOpen={isOpen} onClose={onClose} onToggle={onToggle} />
      <Stack spacing={6}>
        <Stack spacing={4}>
          <Grid templateColumns="repeat(10, 1fr)" gap={4}>
            <GridItem display="flex" alignItems="center" justifyContent="flex-start" colStart={1} colEnd={2}>
              {/* Ícone: RiMenuLine => para abrir a Sidebar */}
              <IconButton aria-label="Abrir menu" icon={<RiMenuLine size={32} />} onClick={onOpen} bg="none" />
            </GridItem>
            <GridItem display="flex" alignItems="center" justifyContent="center" colStart={10} colEnd={11}>
              {/* DatePicker que altera o selectedDate no contexto */}
              <DatePicker
                format="MMM yyyy"
                caretAs={BsCalendar2MonthFill}
                placement="bottomEnd"
                value={selectedDate}
                onChange={value => {
                  if (value) setSelectedDate(value);
                }}
              />
            </GridItem>
          </Grid>

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
          <DayList
            daysInSelectedMonth={daysInSelectedMonth}
            selectedDate={selectedDate}
            dayRefs={dayRefs}
            dayOfWeekNames={dayOfWeekNames}
          />

          {/* Linha de TOTAIS (Cabeçalho) */}
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

          {/* Linha de TOTAIS (botoes e valores) */}
          <Grid templateColumns="repeat(10, 1fr)" gap={4}>
            {/* Botão LIMPAR */}
            <GridItem
              cursor="pointer"
              onClick={handleClear}
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={6}
              colEnd={7}
              color="white"
              bg="red.500"
              p={2}
            >
              LIMPAR
            </GridItem>

            {/* Botão CALCULAR */}
            <GridItem
              cursor="pointer"
              onClick={handleCalculate}
              display="flex"
              alignItems="center"
              justifyContent="center"
              colStart={7}
              colEnd={8}
              color="white"
              bg="blue.500"
              p={2}
            >
              CALCULAR
            </GridItem>

            {/* Totais */}
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
