
// Environment-aware configuration
// This file handles different configurations for development, staging, and production

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    enableDebugMode: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  limits: {
    maxFileUploadSize: number;
    maxItemsPerPage: number;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  supabase: {
    url: "https://kedvffvamfrxyqpmwmnk.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZHZmZnZhbWZyeHlxcG13bW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjkyODEsImV4cCI6MjA2NTg0NTI4MX0.D7UpzeOdBFKxyV_irGpDAYyc32kugMcSXunVNQqjVuQ",
  },
  app: {
    name: 'Zarify',
    version: '1.0.0',
    environment: 'development',
  },
  features: {
    enableDebugMode: true,
    enableAnalytics: false,
    enableErrorReporting: false,
  },
  limits: {
    maxFileUploadSize: 5 * 1024 * 1024, // 5MB
    maxItemsPerPage: 50,
  },
};

// Environment-specific overrides
const environmentConfigs: Record<string, Partial<EnvironmentConfig>> = {
  development: {
    features: {
      enableDebugMode: true,
      enableAnalytics: false,
      enableErrorReporting: false,
    },
  },
  staging: {
    app: {
      name: 'Zarify',
      version: '1.0.0',
      environment: 'staging',
    },
    features: {
      enableDebugMode: true,
      enableAnalytics: true,
      enableErrorReporting: true,
    },
    limits: {
      maxFileUploadSize: 5 * 1024 * 1024, // 5MB
      maxItemsPerPage: 25,
    },
  },
  production: {
    app: {
      name: 'Zarify',
      version: '1.0.0',
      environment: 'production',
    },
    features: {
      enableDebugMode: false,
      enableAnalytics: true,
      enableErrorReporting: true,
    },
    limits: {
      maxFileUploadSize: 10 * 1024 * 1024, // 10MB
      maxItemsPerPage: 100,
    },
  },
};

// Detect environment based on hostname or environment variable
const detectEnvironment = (): string => {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('staging') || hostname.includes('stage')) {
    return 'staging';
  } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else {
    return 'production';
  }
};

// Create final configuration by merging default with environment-specific
const createConfig = (): EnvironmentConfig => {
  const environment = detectEnvironment();
  const envConfig = environmentConfigs[environment] || {};
  
  return {
    ...defaultConfig,
    ...envConfig,
    app: {
      ...defaultConfig.app,
      ...envConfig.app,
      environment: environment as 'development' | 'staging' | 'production',
    },
    features: {
      ...defaultConfig.features,
      ...envConfig.features,
    },
    limits: {
      ...defaultConfig.limits,
      ...envConfig.limits,
    },
  };
};

export const config = createConfig();

// Helper functions
export const isDevelopment = () => config.app.environment === 'development';
export const isStaging = () => config.app.environment === 'staging';
export const isProduction = () => config.app.environment === 'production';

// Debug utilities
export const debugLog = (message: string, data?: any) => {
  if (config.features.enableDebugMode) {
    console.log(`[${config.app.environment.toUpperCase()}] ${message}`, data);
  }
};

export const debugError = (message: string, error?: any) => {
  if (config.features.enableDebugMode) {
    console.error(`[${config.app.environment.toUpperCase()}] ${message}`, error);
  }
};
