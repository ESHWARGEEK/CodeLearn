export interface OrchestrationConfig {
  // LangChain Configuration
  langchain: {
    enabled: boolean;
    anthropicApiKey?: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
    maxIterations: number;
    verbose: boolean;
    handleParsingErrors: boolean;
  };

  // Agent Configuration
  agents: {
    curator: {
      enabled: boolean;
      modelId: string;
      maxTokens: number;
      temperature: number;
      topP: number;
    };
    teacher: {
      enabled: boolean;
      modelId: string;
      maxTokens: number;
      temperature: number;
      topP: number;
    };
    code: {
      enabled: boolean;
      modelId: string;
      maxTokens: number;
      temperature: number;
      topP: number;
    };
    mentor: {
      enabled: boolean;
      modelId: string;
      maxTokens: number;
      temperature: number;
      topP: number;
    };
  };

  // Workflow Configuration
  workflow: {
    enabled: boolean;
    maxStepsPerWorkflow: number;
    maxParallelSteps: number;
    stepTimeoutMs: number;
    workflowTimeoutMs: number;
  };

  // Retry Configuration
  retry: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    exponentialBackoff: boolean;
    retryableErrors: string[];
    permanentErrors: string[];
  };

  // Monitoring Configuration
  monitoring: {
    metricsEnabled: boolean;
    healthCheckIntervalMs: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const defaultOrchestrationConfig: OrchestrationConfig = {
  langchain: {
    enabled: true,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-3-5-sonnet-20241022',
    temperature: 0.1,
    maxTokens: 1000,
    maxIterations: 5,
    verbose: process.env.NODE_ENV === 'development',
    handleParsingErrors: true,
  },

  agents: {
    curator: {
      enabled: true,
      modelId: 'meta.llama3-1-70b-instruct-v1:0',
      maxTokens: 4000,
      temperature: 0.7,
      topP: 0.9,
    },
    teacher: {
      enabled: true,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      maxTokens: 3000,
      temperature: 0.3,
      topP: 0.9,
    },
    code: {
      enabled: true,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      maxTokens: 4000,
      temperature: 0.2,
      topP: 0.9,
    },
    mentor: {
      enabled: true,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      maxTokens: 2500,
      temperature: 0.6,
      topP: 0.9,
    },
  },

  workflow: {
    enabled: true,
    maxStepsPerWorkflow: 10,
    maxParallelSteps: 3,
    stepTimeoutMs: 300000, // 5 minutes
    workflowTimeoutMs: 1800000, // 30 minutes
  },

  retry: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    exponentialBackoff: true,
    retryableErrors: [
      'timeout',
      'network',
      'rate limit',
      'service unavailable',
      'internal server error',
      'throttling',
    ],
    permanentErrors: [
      'validation',
      'authentication',
      'authorization',
      'invalid',
      'forbidden',
      'not found',
    ],
  },

  monitoring: {
    metricsEnabled: true,
    healthCheckIntervalMs: 60000, // 1 minute
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
  },
};

/**
 * Load orchestration configuration from environment variables and defaults
 */
export function loadOrchestrationConfig(): OrchestrationConfig {
  const config = { ...defaultOrchestrationConfig };

  // Override with environment variables if present
  if (process.env.LANGCHAIN_ENABLED !== undefined) {
    config.langchain.enabled = process.env.LANGCHAIN_ENABLED === 'true';
  }

  if (process.env.LANGCHAIN_MODEL_NAME) {
    config.langchain.modelName = process.env.LANGCHAIN_MODEL_NAME;
  }

  if (process.env.LANGCHAIN_TEMPERATURE) {
    config.langchain.temperature = parseFloat(process.env.LANGCHAIN_TEMPERATURE);
  }

  if (process.env.LANGCHAIN_MAX_TOKENS) {
    config.langchain.maxTokens = parseInt(process.env.LANGCHAIN_MAX_TOKENS, 10);
  }

  if (process.env.MAX_RETRIES) {
    config.retry.maxRetries = parseInt(process.env.MAX_RETRIES, 10);
  }

  if (process.env.WORKFLOW_ENABLED !== undefined) {
    config.workflow.enabled = process.env.WORKFLOW_ENABLED === 'true';
  }

  if (process.env.METRICS_ENABLED !== undefined) {
    config.monitoring.metricsEnabled = process.env.METRICS_ENABLED === 'true';
  }

  // Validate configuration
  validateOrchestrationConfig(config);

  return config;
}

/**
 * Validate orchestration configuration
 */
function validateOrchestrationConfig(config: OrchestrationConfig): void {
  // Validate LangChain config
  if (config.langchain.enabled && !config.langchain.anthropicApiKey) {
    console.warn('LangChain enabled but ANTHROPIC_API_KEY not provided, falling back to direct routing');
    config.langchain.enabled = false;
  }

  if (config.langchain.temperature < 0 || config.langchain.temperature > 1) {
    throw new Error('LangChain temperature must be between 0 and 1');
  }

  if (config.langchain.maxTokens < 1 || config.langchain.maxTokens > 8192) {
    throw new Error('LangChain maxTokens must be between 1 and 8192');
  }

  // Validate agent configs
  Object.entries(config.agents).forEach(([agentName, agentConfig]) => {
    if (agentConfig.temperature < 0 || agentConfig.temperature > 1) {
      throw new Error(`${agentName} agent temperature must be between 0 and 1`);
    }

    if (agentConfig.topP < 0 || agentConfig.topP > 1) {
      throw new Error(`${agentName} agent topP must be between 0 and 1`);
    }

    if (agentConfig.maxTokens < 1) {
      throw new Error(`${agentName} agent maxTokens must be positive`);
    }
  });

  // Validate workflow config
  if (config.workflow.maxStepsPerWorkflow < 1 || config.workflow.maxStepsPerWorkflow > 50) {
    throw new Error('maxStepsPerWorkflow must be between 1 and 50');
  }

  if (config.workflow.maxParallelSteps < 1 || config.workflow.maxParallelSteps > 10) {
    throw new Error('maxParallelSteps must be between 1 and 10');
  }

  // Validate retry config
  if (config.retry.maxRetries < 0 || config.retry.maxRetries > 10) {
    throw new Error('maxRetries must be between 0 and 10');
  }

  if (config.retry.baseDelayMs < 100 || config.retry.baseDelayMs > 60000) {
    throw new Error('baseDelayMs must be between 100 and 60000');
  }

  if (config.retry.maxDelayMs < config.retry.baseDelayMs) {
    throw new Error('maxDelayMs must be greater than or equal to baseDelayMs');
  }
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(config: OrchestrationConfig): Record<string, any> {
  return {
    langchainEnabled: config.langchain.enabled,
    enabledAgents: Object.entries(config.agents)
      .filter(([, agentConfig]) => agentConfig.enabled)
      .map(([agentName]) => agentName),
    workflowEnabled: config.workflow.enabled,
    maxRetries: config.retry.maxRetries,
    metricsEnabled: config.monitoring.metricsEnabled,
    logLevel: config.monitoring.logLevel,
  };
}