'use client'

import {
    Box,
    VStack,
    Heading,
    Text,
    Switch,
    FormControl,
    FormLabel,
    useColorMode,
    Select,
    useColorModeValue,
    Card,
    CardBody,
    Divider,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export default function ThemeSettings() {
    const { colorMode, setColorMode } = useColorMode()
    const [fontSize, setFontSize] = useState('medium')
    const [accentColor, setAccentColor] = useState('blue')
    const bgColor = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    useEffect(() => {
        // Carregar preferências salvas
        const savedFontSize = localStorage.getItem('@ti-assistant:fontSize')
        const savedAccentColor = localStorage.getItem('@ti-assistant:accentColor')
        
        if (savedFontSize) setFontSize(savedFontSize)
        if (savedAccentColor) setAccentColor(savedAccentColor)
    }, [])

    const handleFontSizeChange = (value: string) => {
        setFontSize(value)
        localStorage.setItem('@ti-assistant:fontSize', value)
        // Aplicar mudança de fonte
        document.documentElement.style.fontSize = value === 'small' ? '14px' : value === 'medium' ? '16px' : '18px'
    }

    const handleAccentColorChange = (value: string) => {
        setAccentColor(value)
        localStorage.setItem('@ti-assistant:accentColor', value)
        // Aplicar mudança de cor
        document.documentElement.style.setProperty('--chakra-colors-accent', `var(--chakra-colors-${value}-500)`)
    }

    return (
        <VStack spacing={6} align="stretch">
            <Heading size="md">Configurações de Tema</Heading>
            
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                    <VStack spacing={6} align="stretch">
                        {/* Modo Escuro */}
                        <FormControl display="flex" alignItems="center" justifyContent="space-between">
                            <FormLabel htmlFor="dark-mode" mb="0">
                                Modo Escuro
                            </FormLabel>
                            <Switch
                                id="dark-mode"
                                isChecked={colorMode === 'dark'}
                                onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
                            />
                        </FormControl>

                        <Divider />

                        {/* Tamanho da Fonte */}
                        <FormControl>
                            <FormLabel>Tamanho da Fonte</FormLabel>
                            <Select
                                value={fontSize}
                                onChange={(e) => handleFontSizeChange(e.target.value)}
                            >
                                <option value="small">Pequeno</option>
                                <option value="medium">Médio</option>
                                <option value="large">Grande</option>
                            </Select>
                        </FormControl>

                        <Divider />

                        {/* Cor de Destaque */}
                        <FormControl>
                            <FormLabel>Cor de Destaque</FormLabel>
                            <Select
                                value={accentColor}
                                onChange={(e) => handleAccentColorChange(e.target.value)}
                            >
                                <option value="blue">Azul</option>
                                <option value="green">Verde</option>
                                <option value="purple">Roxo</option>
                                <option value="orange">Laranja</option>
                                <option value="teal">Verde-azulado</option>
                            </Select>
                        </FormControl>
                    </VStack>
                </CardBody>
            </Card>

            <Text fontSize="sm" color="gray.500">
                As alterações no tema serão aplicadas imediatamente e salvas automaticamente.
            </Text>
        </VStack>
    )
} 