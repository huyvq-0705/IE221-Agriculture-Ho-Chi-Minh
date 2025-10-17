const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.non_field_errors?.[0] || 'An error occurred');
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return response;
  }

  return response.json();
}

export { fetchApi };
