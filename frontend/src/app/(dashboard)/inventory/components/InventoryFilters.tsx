import React from 'react';
import { Input, InputGroup, InputLeftElement, Select, VStack, HStack, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, FormControl, FormLabel, Button, useBreakpointValue, useColorMode } from '@chakra-ui/react';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (v: string) => void;
  categories: { id: string; label: string }[];
  subcategories: { id: string; label: string }[];
  isFilterOpen: boolean;
  onFilterOpen: () => void;
  onFilterClose: () => void;
  handleCategoryChange: (id: string) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, categories, subcategories, isFilterOpen, onFilterOpen, onFilterClose, handleCategoryChange
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { colorMode } = useColorMode();

  if (isMobile) {
    return (
      <VStack spacing={3} align="stretch">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
          </InputLeftElement>
          <Input
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<FiFilter />} size="sm" variant="outline" onClick={onFilterOpen} w="100%">Filtros</Button>
        <Drawer isOpen={isFilterOpen} placement="bottom" onClose={onFilterClose}>
          <DrawerOverlay />
          <DrawerContent borderTopRadius="xl">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Filtros</DrawerHeader>
            <DrawerBody py={4}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Categoria</FormLabel>
                  <Select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); handleCategoryChange(e.target.value); }} size="sm">
                    <option value="">Todas</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Subcategoria</FormLabel>
                  <Select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)} isDisabled={!selectedCategory} size="sm">
                    <option value="">Todas</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </VStack>
    );
  }

  return (
    <HStack spacing={4} wrap="wrap">
      <InputGroup maxW="400px">
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por nome, modelo ou número de série..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <Select placeholder="Categoria" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); handleCategoryChange(e.target.value); }} maxW="200px">
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.label}</option>
        ))}
      </Select>
      <Select placeholder="Subcategoria" value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)} maxW="200px" isDisabled={!selectedCategory}>
        {subcategories.map(subcategory => (
          <option key={subcategory.id} value={subcategory.id}>{subcategory.label}</option>
        ))}
      </Select>
    </HStack>
  );
}; 