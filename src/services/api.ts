import axios from 'axios';
import { invoke } from '@tauri-apps/api/core';

// Live server URL or fallback to localhost
//http://212.115.110.115:8080

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const POS_OVERIDE_TOKEN = import.meta.env.POS_OVERIDE_TOKEN || "Y6}vm2W0aEHUq[8BlwkB%bQj5%6!KH-7";



type AppConfigResponse = {
  backend_url?: string | null;
  main_printer?: string | null;
  kitchen_printer?: string | null;
  config_path?: string | null;
};

let apiBaseUrl = DEFAULT_API_BASE_URL;
let mainPrinterName: string | null = null;
let kitchenPrinterName: string | null = null;

const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const getApiBaseUrl = () => apiBaseUrl;
export const getMainPrinterName = () => mainPrinterName;
export const getKitchenPrinterName = () => kitchenPrinterName;

export const initApiConfig = async () => {
  try {
    const config = await invoke<AppConfigResponse>('load_app_config');
    const configuredUrl = config.backend_url?.trim();
    mainPrinterName = config.main_printer?.trim() || null;
    kitchenPrinterName = config.kitchen_printer?.trim() || null;

    if (configuredUrl) {
      apiBaseUrl = normalizeApiBaseUrl(configuredUrl);
      api.defaults.baseURL = apiBaseUrl;
      console.info(`[API CONFIG] Using backend URL from ${config.config_path ?? 'config.json'}: ${apiBaseUrl}`);
      return;
    }

    api.defaults.baseURL = apiBaseUrl;
    console.info('[API CONFIG] No backend URL found in config.json, using default backend URL');
  } catch (error) {
    api.defaults.baseURL = apiBaseUrl;
    mainPrinterName = null;
    kitchenPrinterName = null;
    console.warn('[API CONFIG] Failed to load config.json, using default backend URL', error);
  }
};

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // safe for cookies / auth
});

api.interceptors.request.use(
  (config) => {
    // Example: attach token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Override auth middleware for POS
    config.headers['x-pos-override'] = POS_OVERIDE_TOKEN;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // 👈 IMPORTANT: return full AxiosResponse
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('[API NO RESPONSE]', error.request);
    } else {
      console.error('[API SETUP ERROR]', error.message);
    }

    return Promise.reject(error);
  }
);
