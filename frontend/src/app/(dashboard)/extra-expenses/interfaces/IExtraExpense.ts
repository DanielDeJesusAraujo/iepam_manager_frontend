export interface ExtraExpense {
  id: string;
  category_id: string;
  description?: string;
  amount: number;
  date: string;
  location_id?: string;
  event_id?: string;
  user_id?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    value: string;
    label: string;
    description?: string;
  };
  location?: {
    id: string;
    name: string;
    address: string;
    branch: string;
  };
  event?: {
    id: string;
    title: string;
    description: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateExtraExpenseData {
  category_id: string;
  description?: string;
  amount: number;
  date: string;
  location_id?: string;
  event_id?: string;
  receipt_url?: string;
  notes?: string;
}

export interface UpdateExtraExpenseData {
  category_id?: string;
  description?: string;
  amount?: number;
  date?: string;
  location_id?: string;
  event_id?: string;
  receipt_url?: string;
  notes?: string;
} 