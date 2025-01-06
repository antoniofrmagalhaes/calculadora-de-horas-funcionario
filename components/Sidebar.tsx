import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Slide,
  Flex,
  Text,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Button,
  VStack,
  HStack,
  Link,
} from '@chakra-ui/react';
import { RiCloseLine } from 'react-icons/ri';
import { useApplication } from '@/contexts/ApplicationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void; 
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { adicionalNoturno, setAdicionalNoturno, cargaDiaria, setCargaDiaria } = useApplication();

  // Estados temporários para configurações
  const [tempAdicionalNoturno, setTempAdicionalNoturno] = useState(adicionalNoturno);
  const [tempCargaDiaria, setTempCargaDiaria] = useState(cargaDiaria);

  const handleSave = () => {
    setAdicionalNoturno(tempAdicionalNoturno.inicio, tempAdicionalNoturno.fim);
    setCargaDiaria(tempCargaDiaria.semana, tempCargaDiaria.fimSemana);
    onClose(); // Fecha o sidebar após salvar
  };

  return (
    <Slide direction="left" in={isOpen} style={{ zIndex: 9999 }}>
      <Box position="relative" w="340px" h="100vh" bg="gray.200" shadow="lg" p={4}>
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <Box fontWeight="bold">Configurações</Box>
          <IconButton aria-label="Fechar Sidebar" icon={<RiCloseLine size={32} />} onClick={onClose} bg="none" />
        </Flex>

        {/* Configuração de Adicional Noturno */}
        <Box mb={6}>
          <Text fontSize="xs" fontWeight="bold" mb={4}>
            Ajuste o período inicial e final utilizado no cálculo do adicional noturno. (Padrao 22h ate às 5h instituída
            pelo Decreto-Lei nº{' '}
            <Link href="https://legislacao.presidencia.gov.br/atos?tipo=DEL&numero=5452&ano=1943&ato=7da0TWq5kMjpmT218">
              5.452/1943
            </Link>
            .)
          </Text>
          <VStack align="flex-start" spacing={0}>
            <HStack width="100%">
              <Text flex={1}>Início do período (horas)</Text>
              <Box width="70px">
                <NumberInput
                  value={tempAdicionalNoturno.inicio / 60}
                  min={0}
                  max={24}
                  onChange={valueString =>
                    setTempAdicionalNoturno({
                      ...tempAdicionalNoturno,
                      inicio: Number(valueString) * 60,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>{' '}
              </Box>
            </HStack>

            <HStack width="100%">
              <Text flex={1}>Fim do período (horas)</Text>
              <Box width="70px">
                <NumberInput
                  value={tempAdicionalNoturno.fim / 60}
                  min={0}
                  max={24}
                  onChange={valueString =>
                    setTempAdicionalNoturno({
                      ...tempAdicionalNoturno,
                      fim: Number(valueString) * 60,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>{' '}
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* Configuração de Carga Diária */}
        <Box width="100%" mb={6}>
          <Text fontSize="xs" fontWeight="bold" mb={4}>
            Ajuste as horas padrão de carga diária utilizadas no cálculo.
          </Text>
          <VStack align="flex-start" spacing={0}>
            <HStack width="100%">
              <Text flex={1}>Carga semanal (horas)</Text>
              <Box width="70px">
                <NumberInput
                  value={tempCargaDiaria.semana / 60}
                  min={0}
                  max={24}
                  onChange={valueString =>
                    setTempCargaDiaria({
                      ...tempCargaDiaria,
                      semana: Number(valueString) * 60,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </HStack>

            <HStack width="100%">
              <Text flex={1}>Carga fim de semana (horas)</Text>
              <Box width="70px">
                <NumberInput
                  value={tempCargaDiaria.fimSemana / 60}
                  min={0}
                  max={24}
                  onChange={valueString =>
                    setTempCargaDiaria({
                      ...tempCargaDiaria,
                      fimSemana: Number(valueString) * 60,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>{' '}
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* Botão Salvar */}
        <Flex position="absolute" justifyContent="flex-end" right={4} bottom={4}>
          <Button size="sm" colorScheme="blue" onClick={handleSave}>
            Salvar
          </Button>
        </Flex>
      </Box>
    </Slide>
  );
}
