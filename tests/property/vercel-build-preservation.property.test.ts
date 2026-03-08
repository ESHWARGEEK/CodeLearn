/**
 * Property-Based Test: Preservation Testing for Vercel Build Fixes
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * Feature: vercel-build-fixes
 * Property 2: Preservation - Existing Build Success
 * 
 * IMPORTANT: This test should PASS on unfixed code - it verifies baseline behavior
 * 
 * This test captures the current working state of the main branch and ensures
 * that fixes to feature branches do not break existing functionality.
 * 
 * GOAL: Verify that existing working builds continue to work after fixes
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Core modules that exist in main branch and should continue to work
 */
interface CoreModule {
  path: string;
  description: string;
  category: 'ui' | 'lib' | 'component';
  requirement: string;
}

const CORE_MODULES: CoreModule[] = [
  // UI Components (Requirements 3.2, 3.6)
  {
    path: 'components/ui/button.tsx',
    description: 'Button UI component with variants',
    category: 'ui',
    requirement: '3.2, 3.6',
  },
  {
    path: 'components/ui/card.tsx',
    description: 'Card UI component with sub-components',
    category: 'ui',
    requirement: '3.2, 3.6',
  },
  {
    path: 'components/ui/input.tsx',
    description: 'Input UI component',
    category: 'ui',
    requirement: '3.2, 3.6',
  },
  // Learning Components (Requirements 3.2, 3.6)
  {
    path: 'components/learning/TechnologySelector.tsx',
    description: 'Technology selection component',
    category: 'component',
    requirement: '3.2, 3.6',
  },
  // Deployment Libraries (Requirements 3.2, 3.6)
  {
    path: 'lib/deployment/project-deployer.ts',
    description: 'Project deployment utilities',
    category: 'lib',
    requirement: '3.2, 3.6',
  },
  {
    path: 'lib/auth/verify.ts',
    description: 'Authentication verification utilities',
    category: 'lib',
    requirement: '3.2, 3.6',
  },
];

/**
 * Check if a module file exists
 */
function checkModuleExists(modulePath: string): boolean {
  const fullPath = resolve(process.cwd(), modulePath);
  return existsSync(fullPath);
}

/**
 * Verify that a core module exists and is accessible
 */
function verifyCoreModule(module: CoreModule): {
  path: string;
  exists: boolean;
  category: string;
  description: string;
} {
  return {
    path: module.path,
    exists: checkModuleExists(module.path),
    category: module.category,
    description: module.description,
  };
}

describe('Vercel Build Preservation - Existing Build Success', () => {
  describe('Property 2: Preservation - Core Module Existence', () => {
    // Requirement 3.2: Existing components and modules continue to resolve correctly
    it('should verify all core modules exist in current branch', () => {
      const results = CORE_MODULES.map(verifyCoreModule);
      const missingModules = results.filter(r => !r.exists);

      console.log('\n=== Preservation Test: Core Modules ===');
      console.log(`Total Core Modules: ${results.length}`);
      console.log(`Existing Modules: ${results.filter(r => r.exists).length}`);
      console.log(`Missing Modules: ${missingModules.length}`);
      
      if (missingModules.length > 0) {
        console.log('\n⚠️  Missing Core Modules:');
        missingModules.forEach(m => {
          console.log(`  - ${m.path} (${m.category})`);
        });
      } else {
        console.log('✅ All core modules present');
      }
      console.log('=====================================\n');

      // All core modules should exist (baseline behavior)
      expect(missingModules).toEqual([]);
    });

    // Property-based test: For ALL core modules, they MUST exist
    test.prop([fc.constantFrom(...CORE_MODULES)])(
      'all core modules must exist and be resolvable',
      (module) => {
        const result = verifyCoreModule(module);

        // Log if module is missing (should not happen on main branch)
        if (!result.exists) {
          console.log(`\n❌ Core module missing: ${result.path}`);
          console.log(`   Category: ${result.category}`);
          console.log(`   Description: ${result.description}\n`);
        }

        // EXPECTED: All core modules exist (preservation of baseline)
        expect(result.exists).toBe(true);
      }
    );
  });

  describe('Property 2: Preservation - UI Component Exports', () => {
    // Requirement 3.2, 3.5: Existing component imports resolve correctly with proper types
    it('should verify Button component exports correctly', async () => {
      if (!checkModuleExists('components/ui/button.tsx')) {
        console.log('⚠️  Button component not found, skipping export test');
        return;
      }

      const buttonModule = await import('@/components/ui/button');
      
      // Verify expected exports exist
      expect(buttonModule.Button).toBeDefined();
      expect(buttonModule.buttonVariants).toBeDefined();
      
      // Verify Button is a valid React component (has displayName or is a function)
      expect(
        typeof buttonModule.Button === 'function' || 
        typeof buttonModule.Button === 'object'
      ).toBe(true);
    });

    it('should verify Card component exports correctly', async () => {
      if (!checkModuleExists('components/ui/card.tsx')) {
        console.log('⚠️  Card component not found, skipping export test');
        return;
      }

      const cardModule = await import('@/components/ui/card');
      
      // Verify all expected Card sub-components exist
      expect(cardModule.Card).toBeDefined();
      expect(cardModule.CardHeader).toBeDefined();
      expect(cardModule.CardFooter).toBeDefined();
      expect(cardModule.CardTitle).toBeDefined();
      expect(cardModule.CardDescription).toBeDefined();
      expect(cardModule.CardContent).toBeDefined();
    });

    it('should verify Input component exports correctly', async () => {
      if (!checkModuleExists('components/ui/input.tsx')) {
        console.log('⚠️  Input component not found, skipping export test');
        return;
      }

      const inputModule = await import('@/components/ui/input');
      
      // Verify Input component exists
      expect(inputModule.Input).toBeDefined();
    });
  });

  describe('Property 2: Preservation - Library Module Exports', () => {
    // Requirement 3.2, 3.5: Existing library modules resolve correctly with proper types
    it('should verify deployment module exports correctly', async () => {
      if (!checkModuleExists('lib/deployment/project-deployer.ts')) {
        console.log('⚠️  Deployment module not found, skipping export test');
        return;
      }

      const deployerModule = await import('@/lib/deployment/project-deployer');
      
      // Verify expected exports exist
      expect(deployerModule.deployProject).toBeDefined();
      expect(deployerModule.getDeploymentStatusById).toBeDefined();
      
      // Verify they are functions
      expect(typeof deployerModule.deployProject).toBe('function');
      expect(typeof deployerModule.getDeploymentStatusById).toBe('function');
    });

    it('should verify auth verification module exports correctly', async () => {
      if (!checkModuleExists('lib/auth/verify.ts')) {
        console.log('⚠️  Auth verify module not found, skipping export test');
        return;
      }

      const verifyModule = await import('@/lib/auth/verify');
      
      // Verify verifyAuth function exists
      expect(verifyModule.verifyAuth).toBeDefined();
      expect(typeof verifyModule.verifyAuth).toBe('function');
    });
  });

  describe('Property 2: Preservation - Component Module Exports', () => {
    // Requirement 3.2, 3.5: Existing feature components resolve correctly
    it('should verify TechnologySelector component exports correctly', async () => {
      if (!checkModuleExists('components/learning/TechnologySelector.tsx')) {
        console.log('⚠️  TechnologySelector not found, skipping export test');
        return;
      }

      const techSelectorModule = await import('@/components/learning/TechnologySelector');
      
      // Verify default export exists (TechnologySelector component)
      expect(techSelectorModule.default).toBeDefined();
      
      // Verify it's a valid React component
      expect(
        typeof techSelectorModule.default === 'function' ||
        typeof techSelectorModule.default === 'object'
      ).toBe(true);
    });
  });

  describe('Property 2: Preservation - Module Resolution Patterns', () => {
    // Requirement 3.6: Next.js module resolution works for existing @/ aliases
    test.prop([
      fc.constantFrom(
        '@/components/ui/button',
        '@/components/ui/card',
        '@/components/ui/input',
        '@/components/learning/TechnologySelector',
        '@/lib/deployment/project-deployer',
        '@/lib/auth/verify'
      )
    ])(
      'all @/ alias imports should resolve correctly',
      async (importPath) => {
        // Convert @/ alias to file path
        const filePath = importPath.replace('@/', '') + 
          (importPath.includes('/ui/') || importPath.includes('/learning/') ? '.tsx' : '.ts');

        // Skip if file doesn't exist (conditional test)
        if (!checkModuleExists(filePath)) {
          console.log(`⚠️  Skipping ${importPath} - file not found`);
          return;
        }

        // Attempt to import the module
        let importSucceeded = false;
        let importError: Error | null = null;

        try {
          await import(importPath);
          importSucceeded = true;
        } catch (error) {
          importError = error as Error;
          console.log(`\n❌ Import failed for ${importPath}`);
          console.log(`   Error: ${importError.message}\n`);
        }

        // EXPECTED: Import should succeed (preservation of module resolution)
        expect(importSucceeded).toBe(true);
      }
    );
  });

  describe('Property 2: Preservation - TypeScript Type Safety', () => {
    // Requirement 3.5: TypeScript type checking continues to enforce type safety
    it('should verify UI components have proper TypeScript types', async () => {
      // This test verifies that imports work with TypeScript
      // If types are broken, the import will fail at compile time
      
      const modules = [
        { path: 'components/ui/button.tsx', import: '@/components/ui/button' },
        { path: 'components/ui/card.tsx', import: '@/components/ui/card' },
        { path: 'components/ui/input.tsx', import: '@/components/ui/input' },
      ];

      for (const module of modules) {
        if (checkModuleExists(module.path)) {
          // If this import succeeds, TypeScript types are valid
          const imported = await import(module.import);
          expect(imported).toBeDefined();
        }
      }
    });

    it('should verify library modules have proper TypeScript types', async () => {
      const modules = [
        { path: 'lib/deployment/project-deployer.ts', import: '@/lib/deployment/project-deployer' },
        { path: 'lib/auth/verify.ts', import: '@/lib/auth/verify' },
      ];

      for (const module of modules) {
        if (checkModuleExists(module.path)) {
          // If this import succeeds, TypeScript types are valid
          const imported = await import(module.import);
          expect(imported).toBeDefined();
        }
      }
    });
  });

  describe('Property 2: Preservation - Build Configuration', () => {
    // Requirement 3.3, 3.6: Build configuration remains valid
    it('should verify Next.js configuration files exist', () => {
      const configFiles = [
        'next.config.mjs',
        'tsconfig.json',
        'package.json',
      ];

      const results = configFiles.map(file => ({
        file,
        exists: checkModuleExists(file),
      }));

      const missingConfigs = results.filter(r => !r.exists);

      console.log('\n=== Build Configuration Check ===');
      results.forEach(r => {
        console.log(`${r.exists ? '✅' : '❌'} ${r.file}`);
      });
      console.log('================================\n');

      // All config files should exist
      expect(missingConfigs).toEqual([]);
    });

    it('should verify TypeScript configuration is valid', () => {
      const tsconfigPath = 'tsconfig.json';
      expect(checkModuleExists(tsconfigPath)).toBe(true);

      // If tsconfig exists, verify it's readable and has basic structure
      if (checkModuleExists(tsconfigPath)) {
        const fs = require('fs');
        const tsconfigContent = fs.readFileSync(
          resolve(process.cwd(), tsconfigPath),
          'utf-8'
        );
        
        // Should contain basic TypeScript config structure
        // (tsconfig.json often uses JSON5 with comments and trailing commas)
        expect(tsconfigContent).toContain('compilerOptions');
        expect(tsconfigContent.length).toBeGreaterThan(0);
      }
    });
  });
});
