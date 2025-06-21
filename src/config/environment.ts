
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
    url: "https://ltmnrlabdzesusxdcsnr.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bW5ybGFiZHplc3VzeGRjc25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzQ1MDIsImV4cCI6MjA2NDU1MDUwMn0._rH002dhxh9pGrdT6Q41eW2VYveT3vGsaf7bEI5Nrcs",
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
      environment: 'staging',
    },
    features: {
      enableDebugMode: true,
      enableAnalytics: true,
      enableErrorReporting: true,
    },
    limits: {
      maxItemsPerPage: 25,
    },
  },
  production: {
    app: {
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
