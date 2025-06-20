export interface Supply {
    id: string;
    name: string;
    description: string;
    quantity: number;
    minimum_quantity: number;
    unit: {
        id: string;
        name: string;
        symbol: string;
        description: string;
        created_at: string;
        updated_at: string;
    };
    category: {
        id: string;
        label: string;
    };
    supplier: {
        id: string;
        name: string;
    };
    image_url?: string;
}

export interface Category {
    id: string;
    label: string;
}

export interface Supplier {
    id: string;
    name: string;
}

export interface Unit {
    id: string;
    name: string;
    symbol: string;
    description: string;
    created_at: string;
    updated_at: string;
} 