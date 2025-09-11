// lib/master-api.ts
const API_BASE = 'https://api.smartcorpweb.com/api/master';

export const masterApi = {
  // Country methods
  getCountries: async () => {
    const response = await fetch(`${API_BASE}/countries`);
    return response.json();
  },
  
  getCountryById: async (id: number) => {
    const response = await fetch(`${API_BASE}/countries/${id}`);
    return response.json();
  },
  
  createCountry: async (data: any) => {
    const response = await fetch(`${API_BASE}/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // State methods
  getStatesByCountry: async (countryId: number) => {
    const response = await fetch(`${API_BASE}/states/${countryId}`);
    return response.json();
  },
  
  createState: async (data: any) => {
    const response = await fetch(`${API_BASE}/states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // City methods
  getCitiesByState: async (stateId: number) => {
    const response = await fetch(`${API_BASE}/cities/${stateId}`);
    return response.json();
  },
  
  createCity: async (data: any) => {
    const response = await fetch(`${API_BASE}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};