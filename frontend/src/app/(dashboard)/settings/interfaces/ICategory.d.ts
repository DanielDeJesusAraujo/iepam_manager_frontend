export interface Category {
  id: string;
  value: string;
  label: string;
  description?: string;
  subcategories?: Subcategory[];
}