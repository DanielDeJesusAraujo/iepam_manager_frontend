import { InventoryItem } from '../types';
import { GroupByOption } from '../types';

export const groupItems = (items: InventoryItem[], groupBy: GroupByOption): Record<string, InventoryItem[]> => {
    if (groupBy === 'none') {
        return { 'Todos os Itens': items };
    }

    return items.reduce((groups, item) => {
        let groupKey: string;

        switch (groupBy) {
            case 'location':
                groupKey = item.location.name;
                break;
            case 'category':
                groupKey = item.category.label;
                break;
            case 'status':
                groupKey = item.status;
                break;
            case 'subcategory':
                groupKey = item.subcategory.label;
                break;
            default:
                groupKey = 'Outros';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }

        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, InventoryItem[]>);
}; 