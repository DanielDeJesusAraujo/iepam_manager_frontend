'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Tipos para o estado global
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ORGANIZER' | 'SUPPORT' | 'TECHNICIAN';
  branch_id?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  supply: any;
}

interface Supply {
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

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  model: string;
  serial_number: string;
  status: string;
  category: {
    label: string;
  };
  image_url?: string;
  acquisition_price?: number;
  residual_value?: number;
  service_life?: number;
  finality?: string;
  acquisition_date?: string;
  location?: {
    id: string;
    name: string;
  };
}

interface GlobalState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  cart: CartItem[];
  loading: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  activeTab: number;
  searchQuery: string;
  statusFilter: string;
  supplies: Supply[];
  suppliesLastFetched: number | null;
  inventoryItems: InventoryItem[];
  inventoryLastFetched: number | null;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// Ações do reducer
type GlobalAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SUPPLIES'; payload: Supply[] }
  | { type: 'SET_INVENTORY_ITEMS'; payload: InventoryItem[] }
  | { type: 'INITIALIZE_FROM_STORAGE' };

// Estado inicial
const initialState: GlobalState = {
  user: null,
  isAuthenticated: false,
  token: null,
  cart: [],
  loading: true,
  theme: 'light',
  notifications: [],
  activeTab: 0,
  searchQuery: '',
  statusFilter: '',
  supplies: [],
  suppliesLastFetched: null,
  inventoryItems: [],
  inventoryLastFetched: null,
};

// Reducer
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
        theme: state.theme, // Manter o tema
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'SET_STATUS_FILTER':
      return {
        ...state,
        statusFilter: action.payload,
      };

    case 'SET_SUPPLIES':
      return {
        ...state,
        supplies: action.payload,
        suppliesLastFetched: Date.now(),
      };

    case 'SET_INVENTORY_ITEMS':
      return {
        ...state,
        inventoryItems: action.payload,
        inventoryLastFetched: Date.now(),
      };

    case 'INITIALIZE_FROM_STORAGE':
      try {
        const storedUser = localStorage.getItem('@ti-assistant:user');
        const storedToken = localStorage.getItem('@ti-assistant:token');
        const storedCart = localStorage.getItem('@ti-assistant:cart');
        const storedTheme = localStorage.getItem('@ti-assistant:theme') as 'light' | 'dark';
        const storedActiveTab = localStorage.getItem('@ti-assistant:activeTab');
        const storedSupplies = localStorage.getItem('@ti-assistant:supplies');
        const storedSuppliesLastFetched = localStorage.getItem('@ti-assistant:suppliesLastFetched');
        const storedInventoryItems = localStorage.getItem('@ti-assistant:inventoryItems');
        const storedInventoryLastFetched = localStorage.getItem('@ti-assistant:inventoryLastFetched');

        let parsedCart = [];
        if (storedCart) {
          try {
            parsedCart = JSON.parse(storedCart);
          } catch (parseError) {
            console.error('Erro ao fazer parse do carrinho:', parseError);
            parsedCart = [];
          }
        }

        return {
          ...state,
          user: storedUser ? JSON.parse(storedUser) : null,
          isAuthenticated: !!storedToken,
          token: storedToken,
          cart: parsedCart,
          theme: storedTheme || 'light',
          activeTab: storedActiveTab ? parseInt(storedActiveTab) : 0,
          supplies: storedSupplies ? JSON.parse(storedSupplies) : [],
          suppliesLastFetched: storedSuppliesLastFetched ? parseInt(storedSuppliesLastFetched) : null,
          inventoryItems: storedInventoryItems ? JSON.parse(storedInventoryItems) : [],
          inventoryLastFetched: storedInventoryLastFetched ? parseInt(storedInventoryLastFetched) : null,
          loading: false,
        };
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        return {
          ...state,
          loading: false,
        };
      }

    default:
      return state;
  }
}

// Contexto
const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  // Funções auxiliares
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  setActiveTab: (tabIndex: number) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSupplies: (supplies: Supply[]) => void;
  setInventoryItems: (inventoryItems: InventoryItem[]) => void;
  handleLogout: () => void;
} | undefined>(undefined);

// Provider
interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Inicializar dados do localStorage
  useEffect(() => {
    console.log('Inicializando dados do localStorage...');
    dispatch({ type: 'INITIALIZE_FROM_STORAGE' });
  }, []);

  // Persistir dados no localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('@ti-assistant:user', JSON.stringify(state.user));
    }
    if (state.token) {
      localStorage.setItem('@ti-assistant:token', state.token);
    }
  }, [state.user, state.token]);

  useEffect(() => {
    try {
      const cartString = JSON.stringify(state.cart);
      localStorage.setItem('@ti-assistant:cart', cartString);
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:activeTab', state.activeTab.toString());
  }, [state.activeTab]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:supplies', JSON.stringify(state.supplies));
  }, [state.supplies]);

  useEffect(() => {
    if (state.suppliesLastFetched) {
      localStorage.setItem('@ti-assistant:suppliesLastFetched', state.suppliesLastFetched.toString());
    }
  }, [state.suppliesLastFetched]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:inventoryItems', JSON.stringify(state.inventoryItems));
  }, [state.inventoryItems]);

  useEffect(() => {
    if (state.inventoryLastFetched) {
      localStorage.setItem('@ti-assistant:inventoryLastFetched', state.inventoryLastFetched.toString());
    }
  }, [state.inventoryLastFetched]);

  // Limpar localStorage no logout
  const handleLogout = () => {
    localStorage.removeItem('@ti-assistant:user');
    localStorage.removeItem('@ti-assistant:token');
    localStorage.removeItem('@ti-assistant:cart');
    localStorage.removeItem('@ti-assistant:supplies');
    localStorage.removeItem('@ti-assistant:suppliesLastFetched');
    localStorage.removeItem('@ti-assistant:inventoryItems');
    localStorage.removeItem('@ti-assistant:inventoryLastFetched');
    dispatch({ type: 'LOGOUT' });
  };

  // Funções auxiliares
  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateCartItem = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const removeNotification = (notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  const setActiveTab = (tabIndex: number) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabIndex });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setStatusFilter = (filter: string) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: filter });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setSupplies = (supplies: Supply[]) => {
    dispatch({ type: 'SET_SUPPLIES', payload: supplies });
  };

  const setInventoryItems = (inventoryItems: InventoryItem[]) => {
    dispatch({ type: 'SET_INVENTORY_ITEMS', payload: inventoryItems });
  };

  const value = {
    state,
    dispatch,
    // Funções auxiliares
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    addNotification,
    removeNotification,
    setActiveTab,
    setSearchQuery,
    setStatusFilter,
    setTheme,
    setSupplies,
    setInventoryItems,
    handleLogout,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal deve ser usado dentro de um GlobalProvider');
  }
  return context;
}

// Hooks específicos para facilitar o uso
export function useUser() {
  const { state } = useGlobal();
  return { user: state.user, isAuthenticated: state.isAuthenticated };
}

export function useCart() {
  const { state, addToCart, removeFromCart, updateCartItem, clearCart } = useGlobal();
  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
  };
}

export function useNotifications() {
  const { state, addNotification, removeNotification } = useGlobal();
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
  };
}

export function useTheme() {
  const { state, setTheme } = useGlobal();
  return {
    theme: state.theme,
    setTheme,
  };
}

export function useTabs() {
  const { state, setActiveTab } = useGlobal();
  return {
    activeTab: state.activeTab,
    setActiveTab,
  };
}

export function useFilters() {
  const { state, setSearchQuery, setStatusFilter } = useGlobal();
  return {
    searchQuery: state.searchQuery,
    statusFilter: state.statusFilter,
    setSearchQuery,
    setStatusFilter,
  };
}

export function useSupplies() {
  const { state, setSupplies } = useGlobal();
  return {
    supplies: state.supplies,
    suppliesLastFetched: state.suppliesLastFetched,
    setSupplies,
  };
}

export function useInventoryItems() {
  const { state, setInventoryItems } = useGlobal();
  return {
    inventoryItems: state.inventoryItems,
    inventoryLastFetched: state.inventoryLastFetched,
    setInventoryItems,
  };
} 