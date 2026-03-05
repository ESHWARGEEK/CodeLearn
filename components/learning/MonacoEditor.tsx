'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onSave: () => void;
  readOnly?: boolean;
}

export function MonacoEditor({
  code,
  language,
  onChange,
  onSave,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      minimap: { enabled: true },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      readOnly,
    });

    // Add keyboard shortcut for manual save (Cmd/Ctrl + S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleManualSave();
    });

    // Configure TypeScript/JavaScript language features
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  const handleManualSave = () => {
    setIsSaving(true);
    onSave();
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      
      // Reset auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new auto-save timer (30 seconds)
      autoSaveTimerRef.current = setTimeout(() => {
        setIsSaving(true);
        onSave();
        setTimeout(() => setIsSaving(false), 1000);
      }, 30000);
    }
  };

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly,
        }}
        loading={
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading editor...</div>
          </div>
        }
      />
      
      {/* Save indicator */}
      {isSaving && (
        <div className="absolute bottom-4 right-4 rounded-md bg-green-500 px-3 py-1.5 text-xs text-white shadow-lg">
          ✓ Saved
        </div>
      )}
    </div>
  );
}
