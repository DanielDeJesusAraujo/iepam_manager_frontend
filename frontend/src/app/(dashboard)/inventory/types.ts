export interface InventoryItem {
    id: string;
    item: string;
    name: string;
    model: string;
    serial_number: string;
    finality: string;
    acquisition_price: number;
    acquisition_date: string;
    status: 'STANDBY' | 'IN_USE' | 'MAINTENANCE' | 'DISCARDED';
    location: {
        id: string;
        name: string;
    };
    locale?: {
        id: string;
        name: string;
        description?: string;
    };
    category: {
        id: string;
        label: string;
    };
    subcategory: {
        id: string;
        label: string;
    };
    supplier_id?: string;
    description?: string;
    image_url?: string;
}

export type GroupByOption = 'none' | 'location' | 'category' | 'status' | 'subcategory'; 