const API_URL = "http://localhost:3333";

function getHeaders(isJson = true) {
  const token = localStorage.getItem("deskflow_token");

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro na requisição");
  }

  return data as T;
}

export const api = {
  get: async <T>(path: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: getHeaders(false)
    });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body: unknown) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  put: async <T>(path: string, body: unknown) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    return handleResponse<T>(response);
  }
};
