import { InventoryItem } from '../types';

export const getStatusColor = (status: InventoryItem['status']): string => {
    switch (status) {
        case 'STANDBY':
            return 'yellow';
        case 'IN_USE':
            return 'green';
        case 'MAINTENANCE':
            return 'orange';
        case 'DISCARDED':
            return 'red';
        default:
            return 'gray';
    }
};

export const getStatusLabel = (status: InventoryItem['status']): string => {
    switch (status) {
        case 'STANDBY':
            return 'Em Espera';
        case 'IN_USE':
            return 'Em Uso';
        case 'MAINTENANCE':
            return 'Em Manutenção';
        case 'DISCARDED':
            return 'Descartado';
        default:
            return 'Desconhecido';
    }
}; 