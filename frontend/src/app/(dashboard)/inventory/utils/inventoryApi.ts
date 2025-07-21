export const fetchItems = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch('/api/inventory', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const fetchCategories = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch('/api/categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const fetchSubcategories = async (categoryId: string) => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch(`/api/subcategories/category/${categoryId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const createItem = async (data: any) => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateItem = async (id: string, data: any) => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
};

export const deleteItem = async (id: string) => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

export const depreciateAll = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  const response = await fetch('/api/inventory', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}; 