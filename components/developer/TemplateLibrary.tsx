'use client';

interface TemplateLibraryProps {
  userId?: string;
}

export default function TemplateLibrary({ userId }: TemplateLibraryProps) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-violet-400 text-[28px]">
            library_books
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Template Library</h3>
          <p className="text-sm text-gray-400">Browse and use project templates</p>
        </div>
      </div>
      
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-8 text-center">
        <span className="material-symbols-outlined text-gray-500 text-[48px] mb-3 block">
          construction
        </span>
        <p className="text-gray-400 mb-2">Template library is currently in development</p>
        <p className="text-sm text-gray-500">
          Project templates and starter code will be available soon
        </p>
      </div>
    </div>
  );
}