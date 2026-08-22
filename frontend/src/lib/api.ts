const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Auto-healing fetch wrapper
 * Attempts to fetch data, and if the API responds with a 500 and a suggestion to retry,
 * or if the network fails, it will automatically retry up to `maxRetries` times.
 */
export async function resilientFetch<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  retries = 3
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // We use cache: 'no-store' to ensure we always fetch live data for the dashboard
        cache: 'no-store'
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        // If the backend suggests a retry or it's a 500 error
        if (json.retrySuggested || response.status >= 500) {
          throw new Error(json.error || `Server error: ${response.status}`);
        } else {
          // Client error (400) - no point in retrying
          throw new Error(json.error || 'Request failed');
        }
      }

      return json.data as T;
    } catch (error) {
      attempt++;
      console.warn(`[Auto-Heal] API call failed (${url}). Attempt ${attempt}/${retries}...`);
      
      if (attempt >= retries) {
        console.error(`[Auto-Heal] Exhausted retries for ${url}.`);
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
    }
  }

  throw new Error('Unreachable code path');
}
