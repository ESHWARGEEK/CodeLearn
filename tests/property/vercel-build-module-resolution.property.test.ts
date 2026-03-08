/**
 * Property-Based Test: Bug Condition Exploration for Vercel Build Fixes
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 * 
 * Feature: vercel-build-fixes
 * Property 1: Fault Condition - Module Resolution Failures Across Feature Branches
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes
 * after implementation.
 * 
 * GOAL: Surface counterexamples that demonstrate the build failures exist
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Module resolution test data structure
 */
interface ModuleResolutionTest {
  branch: string;
  taskNumber: number;
  requiredModules: string[];
  description: string;
}

/**
 * Expected module requirements per feature branch based on bugfix.md
 */
const BRANCH_MODULE_REQUIREMENTS: ModuleResolutionTest[] = [
  {
    branch: 'feature/task-9-deployment',
    taskNumber: 9,
    requiredModules: [
      'lib/deployment/project-deployer.ts',
      'lib/auth/verify.ts',
    ],
    description: 'Task 9: Deployment modules',
  },
  {
    branch: 'feature/task-10-portfolio',
    taskNumber: 10,
    requiredModules: [
      'components/ui/card.tsx',
      'components/ui/button.tsx',
      'components/ui/input.tsx',
    ],
    description: 'Task 10: UI components for portfolio',
  },
  {
    branch: 'feature/task-11-template-library',
    taskNumber: 11,
    requiredModules: [
      'components/developer/TemplateLibrary.tsx',
      'components/ui/card.tsx',
      'components/ui/button.tsx',
      'components/ui/input.tsx',
    ],
    description: 'Task 11: TemplateLibrary and UI components',
  },
  {
    branch: 'feature/task-12-template-extraction',
    taskNumber: 12,
    requiredModules: [
      'components/developer/TemplateLibrary.tsx',
      'components/ui/card.tsx',
      'components/ui/button.tsx',
      'components/ui/input.tsx',
    ],
    description: 'Task 12: Same as task 11',
  },
  {
    branch: 'feature/task-13-code-integration',
    taskNumber: 13,
    requiredModules: [
      'components/developer/TemplateLibrary.tsx',
      'components/ui/card.tsx',
      'components/ui/button.tsx',
      'components/ui/input.tsx',
    ],
    description: 'Task 13: Same as task 11',
  },
  {
    branch: 'feature/task-14-rate-limiting',
    taskNumber: 14,
    requiredModules: [
      'components/developer/TemplateLibrary.tsx',
      'components/ui/card.tsx',
      'components/ui/button.tsx',
      'components/ui/input.tsx',
    ],
    description: 'Task 14: Same as task 11',
  },
  {
    branch: 'feature/task-15-payments',
    taskNumber: 15,
    requiredModules: [
      'components/ui/button.tsx',
      'components/billing/BillingManagement.tsx',
      'components/ui/card.tsx',
    ],
    description: 'Task 15: BillingManagement and UI components',
  },
  {
    branch: 'feature/task-16-ai-workers',
    taskNumber: 16,
    requiredModules: [
      'components/learning/TechnologySelector.tsx',
    ],
    description: 'Task 16: TechnologySelector',
  },
];

/**
 * Check if a module file exists in the current branch
 */
function checkModuleExists(modulePath: string): boolean {
  const fullPath = resolve(process.cwd(), modulePath);
  return existsSync(fullPath);
}

/**
 * Verify module resolution for a given branch configuration
 */
function verifyModuleResolution(test: ModuleResolutionTest): {
  branch: string;
  taskNumber: number;
  missingModules: string[];
  allModulesResolved: boolean;
} {
  const missingModules = test.requiredModules.filter(
    (modulePath) => !checkModuleExists(modulePath)
  );

  return {
    branch: test.branch,
    taskNumber: test.taskNumber,
    missingModules,
    allModulesResolved: missingModules.length === 0,
  };
}

describe('Vercel Build Module Resolution - Bug Condition Exploration', () => {
  describe('Property 1: Fault Condition - Module Resolution Failures', () => {
    it('should document missing modules in current branch (feature/task-9-deployment)', () => {
      // Get current branch test configuration
      const currentBranchTest = BRANCH_MODULE_REQUIREMENTS.find(
        (t) => t.branch === 'feature/task-9-deployment'
      );

      expect(currentBranchTest).toBeDefined();

      const result = verifyModuleResolution(currentBranchTest!);

      console.log('\n=== Bug Condition Exploration Results ===');
      console.log(`Branch: ${result.branch}`);
      console.log(`Task: ${result.taskNumber}`);
      console.log(`Missing Modules: ${result.missingModules.length > 0 ? result.missingModules.join(', ') : 'None'}`);
      console.log(`All Modules Resolved: ${result.allModulesResolved}`);
      console.log('=========================================\n');

      // EXPECTED BEHAVIOR (after fix): All modules should be resolved
      // CURRENT BEHAVIOR (before fix): Some modules may be missing
      // This test documents the current state
      expect(result.allModulesResolved).toBe(true);
    });

    // Property-based test: For ALL feature branches, ALL required modules MUST exist
    test.prop([fc.constantFrom(...BRANCH_MODULE_REQUIREMENTS)])(
      'all required modules must be resolvable for feature branch',
      (branchTest) => {
        const result = verifyModuleResolution(branchTest);

        // Log counterexamples when modules are missing
        if (!result.allModulesResolved) {
          console.log('\n🔴 COUNTEREXAMPLE FOUND:');
          console.log(`  Branch: ${result.branch}`);
          console.log(`  Task: ${result.taskNumber}`);
          console.log(`  Missing Modules:`);
          result.missingModules.forEach((mod) => {
            console.log(`    - ${mod}`);
          });
          console.log('');
        }

        // EXPECTED BEHAVIOR: All modules should exist (allModulesResolved === true)
        // This assertion will FAIL if any modules are missing, which is EXPECTED
        // on unfixed code. The failure confirms the bug exists.
        expect(result.allModulesResolved).toBe(true);
      }
    );

    // Specific test cases for each task based on bugfix requirements
    it('Task 9: should resolve deployment modules', () => {
      const task9 = BRANCH_MODULE_REQUIREMENTS.find((t) => t.taskNumber === 9)!;
      const result = verifyModuleResolution(task9);

      // Requirement 1.1: Task 9 deployment modules
      expect(result.missingModules).toEqual([]);
      expect(checkModuleExists('lib/deployment/project-deployer.ts')).toBe(true);
      expect(checkModuleExists('lib/auth/verify.ts')).toBe(true);
    });

    it('Tasks 10-14: should resolve UI components', () => {
      const uiComponentTasks = BRANCH_MODULE_REQUIREMENTS.filter(
        (t) => t.taskNumber >= 10 && t.taskNumber <= 14
      );

      uiComponentTasks.forEach((task) => {
        const result = verifyModuleResolution(task);

        // Requirements 1.2-1.6: UI components must exist
        expect(checkModuleExists('components/ui/card.tsx')).toBe(true);
        expect(checkModuleExists('components/ui/button.tsx')).toBe(true);
        expect(checkModuleExists('components/ui/input.tsx')).toBe(true);

        if (task.taskNumber >= 11) {
          // Requirements 1.3-1.6: TemplateLibrary must exist for tasks 11-14
          expect(checkModuleExists('components/developer/TemplateLibrary.tsx')).toBe(true);
        }
      });
    });

    it('Task 15: should resolve BillingManagement component', () => {
      const task15 = BRANCH_MODULE_REQUIREMENTS.find((t) => t.taskNumber === 15)!;
      const result = verifyModuleResolution(task15);

      // Requirement 1.7: Task 15 billing components
      expect(checkModuleExists('components/billing/BillingManagement.tsx')).toBe(true);
      expect(checkModuleExists('components/ui/button.tsx')).toBe(true);
      expect(checkModuleExists('components/ui/card.tsx')).toBe(true);
    });

    it('Task 16: should resolve TechnologySelector component', () => {
      const task16 = BRANCH_MODULE_REQUIREMENTS.find((t) => t.taskNumber === 16)!;
      const result = verifyModuleResolution(task16);

      // Requirement 1.8: Task 16 learning component
      expect(checkModuleExists('components/learning/TechnologySelector.tsx')).toBe(true);
    });
  });

  describe('Module Export Verification', () => {
    it('should verify UI components have correct exports', async () => {
      // Only test if files exist
      if (checkModuleExists('components/ui/button.tsx')) {
        const buttonModule = await import('@/components/ui/button');
        expect(buttonModule.Button).toBeDefined();
        expect(buttonModule.buttonVariants).toBeDefined();
      }

      if (checkModuleExists('components/ui/card.tsx')) {
        const cardModule = await import('@/components/ui/card');
        expect(cardModule.Card).toBeDefined();
        expect(cardModule.CardHeader).toBeDefined();
        expect(cardModule.CardFooter).toBeDefined();
        expect(cardModule.CardTitle).toBeDefined();
        expect(cardModule.CardDescription).toBeDefined();
        expect(cardModule.CardContent).toBeDefined();
      }

      if (checkModuleExists('components/ui/input.tsx')) {
        const inputModule = await import('@/components/ui/input');
        expect(inputModule.Input).toBeDefined();
      }
    });

    it('should verify deployment modules have correct exports', async () => {
      if (checkModuleExists('lib/deployment/project-deployer.ts')) {
        const deployerModule = await import('@/lib/deployment/project-deployer');
        expect(deployerModule.deployProject).toBeDefined();
      }

      if (checkModuleExists('lib/auth/verify.ts')) {
        const verifyModule = await import('@/lib/auth/verify');
        // Verify module exports something
        expect(verifyModule).toBeDefined();
      }
    });
  });
});
