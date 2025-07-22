export const fetchItems = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log('[API] GET /api/inventory');
  const response = await fetch('/api/inventory', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log('[API] Response /api/inventory:', data);
  return data;
};

export const fetchCategories = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log('[API] GET /api/categories');
  const response = await fetch('/api/categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log('[API] Response /api/categories:', data);
  return data;
};

export const fetchSubcategories = async (categoryId: string) => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log(`[API] GET /api/subcategories/category/${categoryId}`);
  const response = await fetch(`/api/subcategories/category/${categoryId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(`[API] Response /api/subcategories/category/${categoryId}:`, data);
  return data;
};

export const createItem = async (data: any) => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log('[API] POST /api/inventory', data);
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  let respData;
  try {
    respData = await response.clone().json();
  } catch {
    respData = null;
  }
  console.log('[API] Response POST /api/inventory:', respData, 'Status:', response.status);
  return response;
};

export const updateItem = async (id: string, data: any) => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log(`[API] PUT /api/inventory/${id}`, data);
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  let respData;
  try {
    respData = await response.clone().json();
  } catch {
    respData = null;
  }
  console.log(`[API] Response PUT /api/inventory/${id}:`, respData, 'Status:', response.status);
  return response;
};

export const deleteItem = async (id: string) => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log(`[API] DELETE /api/inventory/${id}`);
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  let respData;
  try {
    respData = await response.clone().json();
  } catch {
    respData = null;
  }
  console.log(`[API] Response DELETE /api/inventory/${id}:`, respData, 'Status:', response.status);
  return response;
};

export const depreciateAll = async () => {
  const token = localStorage.getItem('@ti-assistant:token');
  console.log('[API] PATCH /api/inventory');
  const response = await fetch('/api/inventory', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log('[API] Response PATCH /api/inventory:', data);
  return data;
}; 