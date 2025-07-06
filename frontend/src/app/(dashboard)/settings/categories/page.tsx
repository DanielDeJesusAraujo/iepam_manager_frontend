'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useMediaQuery,
  Divider,
  Flex,
} from '@chakra-ui/react';
import InventorySupplyCategories from './components/InventorySupplyCategories';
import ExtraExpenseCategories from './components/ExtraExpenseCategories';
import { useTabs } from '@/contexts/GlobalContext';

// Layout reutilizável para abas persistentes
function PersistentTabsLayout({ tabLabels, children, onTabChange, storageKey = 'persistentTabIndexCategories' }: { tabLabels: string[], children: React.ReactNode[], onTabChange?: (() => void)[], storageKey?: string }) {
  const { activeTab, setActiveTab } = useTabs();
  const prevTab = useRef(0);
  const [hasFetched, setHasFetched] = useState(() => tabLabels.map(() => false));
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setActiveTab(Number(saved));
  }, [storageKey, setActiveTab]);

  useEffect(() => {
    // Ao trocar de aba, resetar o status da aba anterior
    setHasFetched(arr => arr.map((v, i) => i === prevTab.current ? false : v));
    prevTab.current = activeTab;
    // eslint-disable-next-line
  }, [activeTab]);

  useEffect(() => {
    if (!hasFetched[activeTab] && onTabChange && onTabChange[activeTab]) {
      onTabChange[activeTab]();
      setHasFetched(arr => arr.map((v, i) => i === activeTab ? true : v));
    }
    // eslint-disable-next-line
  }, [activeTab, onTabChange, hasFetched]);

  return (
    <Box w="full" h="full">
      <VStack
        spacing={4}
        align="stretch"
        bg={useColorModeValue('white', 'gray.700')}
        backdropFilter="blur(12px)"
        p={{ base: 2, md: 6 }}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        h="full"
        w="full"
      >
        {!isMobile && (
          <>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={3}>
              <Heading size={{ base: 'md', md: 'lg' }} color={useColorModeValue('gray.800', 'white')}>Configurações de Categorias</Heading>
            </Flex>
            <Divider />
          </>
        )}
        <Box marginBottom="20px" position="sticky" top="7vh" zIndex={21} bg={useColorModeValue('white', 'gray.700')} borderRadius="lg">
          <Tabs variant="enclosed" index={activeTab} onChange={setActiveTab} size={{ base: 'sm', md: 'md' }}>
            <TabList 
              overflowX="auto" 
              css={{
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              bg={useColorModeValue('gray.50', 'gray.600')}
              borderRadius="lg"
              p={1}
              gap={1}
            >
              {tabLabels.map(label => (
                <Tab 
                  key={label} 
                  whiteSpace="nowrap"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="medium"
                  minH={{ base: '8', md: '10' }}
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  borderRadius="md"
                  _selected={{
                    bg: useColorModeValue('white', 'gray.700'),
                    color: useColorModeValue('blue.600', 'blue.200'),
                    boxShadow: 'sm',
                    borderColor: useColorModeValue('blue.200', 'blue.600')
                  }}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.500')
                  }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>
        <Box mt={4} flex="1" overflowY="auto">
          {children.map((child, idx) => (
            <Box key={idx} display={activeTab === idx ? 'block' : 'none'} w="full">
              {child}
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  );
}

export default function CategoriesPage() {
  // Função genérica para buscar dados de cada aba
  const fetchTabData = async (tabIndex: number) => {
    // Aqui você pode adicionar lógica específica para cada aba se necessário
    console.log(`Carregando dados da aba ${tabIndex}`);
  };

  // Funções específicas usando a função genérica
  const fetchTabInventorySupply = () => fetchTabData(0);
  const fetchTabExtraExpense = () => fetchTabData(1);

  return (
    <PersistentTabsLayout
      tabLabels={["Inventário e Suprimentos", "Gastos Extras"]}
      onTabChange={[fetchTabInventorySupply, fetchTabExtraExpense]}
    >
      {[
        <InventorySupplyCategories key="inventory-supply" />,
        <ExtraExpenseCategories key="extra-expense" />
      ]}
    </PersistentTabsLayout>
  );
} 