'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Tipos para o estado global
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ORGANIZER' | 'SUPPORT';
  branch_id?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  supply: any;
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

    case 'INITIALIZE_FROM_STORAGE':
      try {
        const storedUser = localStorage.getItem('@ti-assistant:user');
        const storedToken = localStorage.getItem('@ti-assistant:token');
        const storedCart = localStorage.getItem('@ti-assistant:cart');
        const storedTheme = localStorage.getItem('@ti-assistant:theme') as 'light' | 'dark';
        const storedActiveTab = localStorage.getItem('@ti-assistant:activeTab');

        return {
          ...state,
          user: storedUser ? JSON.parse(storedUser) : null,
          isAuthenticated: !!storedToken,
          token: storedToken,
          cart: storedCart ? JSON.parse(storedCart) : [],
          theme: storedTheme || 'light',
          activeTab: storedActiveTab ? parseInt(storedActiveTab) : 0,
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
    localStorage.setItem('@ti-assistant:cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:activeTab', state.activeTab.toString());
  }, [state.activeTab]);

  // Limpar localStorage no logout
  const handleLogout = () => {
    localStorage.removeItem('@ti-assistant:user');
    localStorage.removeItem('@ti-assistant:token');
    localStorage.removeItem('@ti-assistant:cart');
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