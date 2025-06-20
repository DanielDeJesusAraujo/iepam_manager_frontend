import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Icon,
    VStack,
    Card,
    CardBody,
    useColorModeValue,
    HStack,
    Divider,
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';

interface Alert {
    id: string;
    about: string;
    danger_level: string;
    description: string;
    created_at: string;
    server?: {
        id: string;
        IP: string;
    };
    printer?: {
        id: string;
        name: string;
    };
}

interface MobileAlertsProps {
    alerts: Alert[];
    onDelete: (id: string) => void;
}

export function MobileAlerts({ alerts, onDelete }: MobileAlertsProps) {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const getDangerLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'baixo':
                return 'green';
            case 'médio':
                return 'yellow';
            case 'alto':
                return 'orange';
            case 'crítico':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Container maxW="container.xl" py={4}>
            <Heading size="md" mb={4} marginTop='4vh'>Alertas</Heading>

            <VStack spacing={4} align="stretch">
                {alerts.length === 0 ? (
                    <Card>
                        <CardBody>
                            <Text textAlign="center" color="gray.500">
                                Nenhum alerta encontrado
                            </Text>
                        </CardBody>
                    </Card>
                ) : (
                    alerts.map((alert) => (
                        <Card key={alert.id} variant="outline">
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <Flex justify="space-between" align="center">
                                        <Badge
                                            colorScheme={getDangerLevelColor(alert.danger_level)}
                                            variant="subtle"
                                            px={2}
                                            py={1}
                                            rounded="md"
                                        >
                                            {alert.danger_level}
                                        </Badge>
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label="Mais opções"
                                                icon={<Icon as={MoreVertical} sx={{ '& svg': { stroke: 'currentColor' } }} />}
                                                variant="ghost"
                                                size="sm"
                                            />
                                            <MenuList>
                                                <MenuItem onClick={() => onDelete(alert.id)}>
                                                    Excluir
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Flex>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">Sobre</Text>
                                        <Text fontSize="sm">{alert.about}</Text>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">Descrição</Text>
                                        <Text fontSize="sm">{alert.description}</Text>
                                    </Box>

                                    <Divider />

                                    <HStack justify="space-between">
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm">Dispositivo</Text>
                                            <Text fontSize="sm">
                                                {alert.server ? `Servidor: ${alert.server.IP}` :
                                                    alert.printer ? `Impressora: ${alert.printer.name}` :
                                                        'N/A'}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm">Data</Text>
                                            <Text fontSize="sm">
                                                {new Date(alert.created_at).toLocaleString()}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))
                )}
            </VStack>
        </Container>
    );
} 