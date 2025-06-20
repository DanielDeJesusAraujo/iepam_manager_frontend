import { Supply } from './types';

export const initializeFormData = (initialData?: Supply) => {
    if (initialData) {
        return {
            name: initialData.name || '',
            description: initialData.description || '',
            quantity: initialData.quantity || 0,
            minimum_quantity: initialData.minimum_quantity || 0,
            unit_id: initialData.unit?.id || '',
            category_id: initialData.category?.id || '',
            supplier_id: initialData.supplier?.id || '',
            image_url: initialData.image_url || '',
        };
    }
    return {
        name: '',
        description: '',
        quantity: 0,
        minimum_quantity: 0,
        unit_id: '',
        category_id: '',
        supplier_id: '',
        image_url: '',
    };
}; 