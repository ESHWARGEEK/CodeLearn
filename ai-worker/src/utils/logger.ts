import winston from 'winston';

export class Logger {
  private static instance: winston.Logger;

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        defaultMeta: {
          service: 'codelearn-ai-worker',
          environment: process.env.ENVIRONMENT || 'development',
        },
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ],
      });

      // Add CloudWatch logging in production
      if (process.env.NODE_ENV === 'production') {
        // CloudWatch logs are automatically captured by ECS
        Logger.instance.add(
          new winston.transports.Console({
            format: winston.format.json(),
          })
        );
      }
    }

    return Logger.instance;
  }
}