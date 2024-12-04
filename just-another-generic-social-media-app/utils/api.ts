// utils/api.ts

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

interface ApiOptions extends RequestInit {
  endpoint: string;
  body?: any;
  isFormData?: boolean; // New flag to indicate FormData
}

export const apiFetch = async ({
  endpoint,
  body,
  isFormData = false,
  ...options
}: ApiOptions) => {
  const url = `${backendUrl}${endpoint}`;
  const config: RequestInit = {
    credentials: "include", // Include cookies in requests
    ...options,
  };

  if (body) {
    if (isFormData) {
      config.body = body; // FormData handles its own headers
    } else {
      config.headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If response is not JSON, return null or handle accordingly
      console.error("Failed to parse JSON response:", e);
      data = null;
    }

    return { status: response.status, data };
  } catch (error) {
    console.error("apiFetch error:", error);
    return { status: 500, data: null };
  }
};
