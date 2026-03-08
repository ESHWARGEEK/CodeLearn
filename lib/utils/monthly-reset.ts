/**
 * Monthly usage counter reset utilities
 * 
 * This module provides utilities for resetting monthly usage counters
 * for rate limiting purposes. In a production environment, this would
 * typically be handled by a scheduled Lambda function or cron job.
 */

import { queryItems, deleteItem, TABLES } from '@/lib/db/dynamodb';

/**
 * Get the current month string in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Get the previous month string in YYYY-MM format
 */
export function getPreviousMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

/**
 * Check if it's time to reset monthly counters
 * Returns true if we're in a new month
 */
export function shouldResetCounters(lastResetMonth: string): boolean {
  const currentMonth = getCurrentMonth();
  return lastResetMonth !== currentMonth;
}

/**
 * Reset monthly integration counters for all users
 * This would typically be called by a scheduled job on the 1st of each month
 */
export async function resetMonthlyIntegrationCounters(): Promise<{
  success: boolean;
  resetCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let resetCount = 0;

  try {
    const previousMonth = getPreviousMonth();
    
    // Query all integrations from the previous month
    const integrations = await queryItems(
      TABLES.INTEGRATIONS,
      '#month = :month',
      {
        ':month': previousMonth,
      },
      'userId-month-index',
      undefined,
      {
        '#month': 'month',
      }
    );

    console.log(`Found ${integrations.length} integrations from ${previousMonth} to clean up`);

    // Delete old integration records (they're no longer needed for rate limiting)
    for (const integration of integrations) {
      try {
        await deleteItem(TABLES.INTEGRATIONS, {
          PK: integration.PK,
          SK: integration.SK,
        });
        resetCount++;
      } catch (error) {
        const errorMsg = `Failed to delete integration ${integration.PK}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Successfully reset ${resetCount} integration counters`);

    return {
      success: errors.length === 0,
      resetCount,
      errors,
    };
  } catch (error) {
    const errorMsg = `Failed to reset monthly counters: ${error}`;
    console.error(errorMsg);
    return {
      success: false,
      resetCount,
      errors: [errorMsg],
    };
  }
}

/**
 * Get reset statistics for monitoring
 */
export async function getResetStatistics(): Promise<{
  currentMonth: string;
  previousMonth: string;
  shouldReset: boolean;
  nextResetDate: string;
}> {
  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth();
  
  // Calculate next reset date (first day of next month)
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  return {
    currentMonth,
    previousMonth,
    shouldReset: shouldResetCounters(previousMonth),
    nextResetDate: nextReset.toISOString(),
  };
}

/**
 * Cleanup old integration records beyond retention period
 * This helps keep the database clean by removing very old records
 */
export async function cleanupOldIntegrations(retentionMonths: number = 6): Promise<{
  success: boolean;
  cleanedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let cleanedCount = 0;

  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    const cutoffMonth = cutoffDate.toISOString().slice(0, 7);

    console.log(`Cleaning up integrations older than ${cutoffMonth}`);

    // This is a simplified implementation
    // In production, you'd want to scan through all months older than cutoff
    const oldIntegrations = await queryItems(
      TABLES.INTEGRATIONS,
      '#month < :cutoff',
      {
        ':cutoff': cutoffMonth,
      },
      'userId-month-index',
      undefined,
      {
        '#month': 'month',
      }
    );

    for (const integration of oldIntegrations) {
      try {
        await deleteItem(TABLES.INTEGRATIONS, {
          PK: integration.PK,
          SK: integration.SK,
        });
        cleanedCount++;
      } catch (error) {
        const errorMsg = `Failed to delete old integration ${integration.PK}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Successfully cleaned up ${cleanedCount} old integration records`);

    return {
      success: errors.length === 0,
      cleanedCount,
      errors,
    };
  } catch (error) {
    const errorMsg = `Failed to cleanup old integrations: ${error}`;
    console.error(errorMsg);
    return {
      success: false,
      cleanedCount,
      errors: [errorMsg],
    };
  }
}

/**
 * Manual reset trigger for testing or emergency use
 * This should be used carefully as it will reset all users' counters
 */
export async function manualResetTrigger(): Promise<{
  success: boolean;
  message: string;
  resetCount: number;
}> {
  console.log('Manual reset triggered');
  
  const result = await resetMonthlyIntegrationCounters();
  
  return {
    success: result.success,
    message: result.success 
      ? `Successfully reset ${result.resetCount} integration counters`
      : `Reset failed with ${result.errors.length} errors`,
    resetCount: result.resetCount,
  };
}