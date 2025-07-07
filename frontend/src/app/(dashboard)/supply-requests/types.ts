export interface Supply {
    id: string;
    name: string;
    description: string;
    quantity: number;
    category_id: string;
    subcategory_id: string | null;
    created_at: string;
    updated_at: string;
    minimum_quantity: number;
    supplier_id: string;
    image_url: string | null;
    unit_id: string;
    unit_price: number;
    freight: number;
    category: {
        id: string;
        value: string;
        label: string;
        created_at: string;
        updated_at: string;
    };
    supplier: {
        id: string;
        name: string;
        phone: string;
        email: string;
        address: string;
        cnpj: string;
        contact_person: string;
        created_at: string;
    };
    unit: {
        id: string;
        name: string;
        symbol: string;
        description: string;
        created_at: string;
        updated_at: string;
    };
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