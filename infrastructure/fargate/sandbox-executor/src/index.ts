import express from 'express';
import { executeCode } from './executor';
import { pollSQSQueue } from './queue-poller';

const app = express();
const PORT = process.env.PORT || 3000;
const EXECUTION_TIMEOUT = parseInt(
  process.env.EXECUTION_TIMEOUT || '1800000',
  10
); // 30 minutes

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Direct execution endpoint (for testing)
app.post('/execute', async (req, res) => {
  try {
    const { code, language, timeout } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, language',
      });
    }

    const result = await executeCode({
      code,
      language,
      timeout: timeout || EXECUTION_TIMEOUT,
    });

    res.json(result);
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Fargate sandbox executor listening on port ${PORT}`);
  console.log(`Execution timeout: ${EXECUTION_TIMEOUT}ms`);

  // Start polling SQS queue for jobs (if configured)
  if (process.env.SQS_QUEUE_URL) {
    console.log('Starting SQS queue poller...');
    pollSQSQueue();
  } else {
    console.log('SQS_QUEUE_URL not configured, skipping queue polling');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
