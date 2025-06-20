export interface Supply {
    id: string;
    name: string;
    description: string;
    category: {
        id: string;
        value: string;
        label: string;
    };
    subcategory?: {
        id: string;
        value: string;
        label: string;
    };
    minimum_quantity: number;
    current_quantity: number;
    quantity: number;
    image_url?: string;
}

export interface SupplyRequest {
    id: string;
    supply?: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unit: {
            id: string;
            name: string;
            symbol: string;
        };
    };
    item_name?: string;
    description?: string;
    unit?: {
        id: string;
        name: string;
        symbol: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
    notes: string;
    created_at: string;
    requester_confirmation: boolean;
    manager_delivery_confirmation: boolean;
    delivery_deadline: string;
    destination: string;
    is_custom?: boolean;
} 