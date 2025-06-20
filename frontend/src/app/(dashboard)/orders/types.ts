export interface Order {
    id: string
    order_number: string
    client_name: string
    model: string
    problem_reported: string
    entry_date: string
    exit_date: string | null
    service_type: string
    total_price: number
    equipment_description: string
    serial_number: string
}

export interface Filters {
    equipment: string
    status: string
    date: string
    serialNumber: string
} 