// utils/api.ts

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

interface ApiOptions extends RequestInit {
  endpoint: string;
  body?: any;
}

export const apiFetch = async ({ endpoint, body, ...options }: ApiOptions) => {
  const url = `${backendUrl}${endpoint}`;
  const config: RequestInit = {
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  return { status: response.status, data };
};
