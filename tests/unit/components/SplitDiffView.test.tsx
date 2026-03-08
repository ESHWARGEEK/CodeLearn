import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SplitDiffView from '@/components/developer/SplitDiffView';

const mockDiffContent = `@@ -1,5 +1,6 @@
 import React from 'react';
-import { Button } from './ui/button';
+import { Button } from '@/components/ui/button';
+import { Card } from '@/components/ui/card';
 
 export default function Component() {
   return (
@@ -8,3 +9,4 @@ export default function Component() {
       <Button>Click me</Button>
     </div>
   );
+  // Added comment
 }`;

describe('SplitDiffView', () => {
  it('renders file path and language info', () => {
    render(
      <SplitDiffView
        filePath="src/components/TestComponent.tsx"
        changes={mockDiffContent}
      />
    );

    expect(screen.getByText('src/components/TestComponent.tsx')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('displays before and after headers', () => {
    render(
      <SplitDiffView
        filePath="test.js"
        changes={mockDiffContent}
      />
    );

    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('renders diff content in split view format', () => {
    render(
      <SplitDiffView
        filePath="test.js"
        changes={mockDiffContent}
      />
    );

    // Check that context lines appear in both columns
    const contextLines = screen.getAllByText('import React from \'react\';');
    expect(contextLines.length).toBeGreaterThan(0);

    // Check that additions and deletions are properly displayed
    expect(screen.getByText('import { Button } from \'./ui/button\';')).toBeInTheDocument();
    expect(screen.getByText('import { Button } from \'@/components/ui/button\';')).toBeInTheDocument();
    expect(screen.getByText('import { Card } from \'@/components/ui/card\';')).toBeInTheDocument();
  });

  it('handles empty diff content gracefully', () => {
    render(
      <SplitDiffView
        filePath="empty.js"
        changes=""
      />
    );

    expect(screen.getByText('empty.js')).toBeInTheDocument();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('detects correct language from file extension', () => {
    const testCases = [
      { path: 'test.tsx', expectedLang: 'typescript' },
      { path: 'test.jsx', expectedLang: 'javascript' },
      { path: 'test.css', expectedLang: 'css' },
      { path: 'test.html', expectedLang: 'html' },
      { path: 'test.json', expectedLang: 'json' },
      { path: 'test.md', expectedLang: 'markdown' },
      { path: 'test.unknown', expectedLang: 'text' },
    ];

    testCases.forEach(({ path, expectedLang }) => {
      const { unmount } = render(
        <SplitDiffView
          filePath={path}
          changes={mockDiffContent}
        />
      );

      expect(screen.getByText(expectedLang)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <SplitDiffView
        filePath="test.js"
        changes={mockDiffContent}
        className="custom-class"
      />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('handles complex diff with multiple hunks', () => {
    const complexDiff = `@@ -1,3 +1,3 @@
 function test() {
-  console.log('old');
+  console.log('new');
 }
@@ -10,2 +10,3 @@
 const value = 42;
+const newValue = 43;
 export default value;`;

    render(
      <SplitDiffView
        filePath="complex.js"
        changes={complexDiff}
      />
    );

    expect(screen.getByText('console.log(\'old\');')).toBeInTheDocument();
    expect(screen.getByText('console.log(\'new\');')).toBeInTheDocument();
    expect(screen.getByText('const newValue = 43;')).toBeInTheDocument();
  });
});