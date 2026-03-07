# CodeLearn - Design Specifications & UI Templates

## 🤖 AI SYSTEM INSTRUCTIONS
**CRITICAL:** Whenever you are prompted to generate, modify, or integrate code for the CodeLearn project, you **MUST STRICTLY ADHERE** to the design system established in this document. 

1. **No Hallucinations:** Do not invent new UI designs, layouts, color palettes, or core structural elements.
2. **Strict Copy:** Use the exact HTML structures, Tailwind utility classes, CSS variables, and font configurations provided below.
3. **Logic Only:** Your primary role when modifying these files is to add backend integration, dynamic data rendering, state management (e.g., React/Next.js/Vue logic), or interactivity, **while leaving the visual frontend exactly as specified**.
4. **Consistency:** If creating a *new* component not explicitly listed here, you must extract styling patterns (colors, padding, border-radius, shadows) from the provided templates to ensure a 100% consistent look and feel.

---

## 🎨 Global Design Tokens
The application relies on specific font families (`Inter`, `JetBrains Mono`, `Space Grotesk`, `Noto Sans`) and consistent color palettes (Indigo/Slate themes, dark/light mode configs). Always maintain the `<style>` blocks and tailwind config scripts exactly as they appear in the headers of these templates.

---

## 📄 Page Templates

### 1. Landing Page
**Purpose:** The main entry point of the application, explaining the value proposition.

```html
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CodeLearn - Learn by Building Real Projects</title>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<style type="text/tailwindcss">
    :root {
        --primary: #6366F1;
        --primary-dark: #4F46E5;
        --secondary: #8B5CF6;
        --dark-bg: #0F172A;
        --card-bg: #1E293B;
        --text-main: #F8FAFC;
        --text-muted: #94A3B8;
        --accent-green: #10B981;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--dark-bg);
        color: var(--text-main);
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .gradient-text {
        background: linear-gradient(135deg, #818CF8 0%, #C084FC 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .code-editor-bg { background-color: #1e1e1e; }
    .hero-glow {
        background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
    }
    .token-keyword { color: #C586C0; }
    .token-function { color: #DCDCAA; }
    .token-string { color: #CE9178; }
    .token-comment { color: #6A9955; }
    .token-variable { color: #9CDCFE; }
    .token-number { color: #B5CEA8; }
</style>
</head>
<body class="antialiased selection:bg-indigo-500 selection:text-white">
<nav class="fixed w-full z-50 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold font-mono">CL</div>
                <span class="font-bold text-xl tracking-tight">CodeLearn</span>
            </div>
            <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-8">
                    <a class="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#">Learning Paths</a>
                    <a class="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#">Templates</a>
                    <a class="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#">Pricing</a>
                    <a class="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#">Enterprise</a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <a class="text-sm font-medium text-slate-300 hover:text-white hidden sm:block" href="#">Log in</a>
                <a class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]" href="#">Start Learning Free</a>
            </div>
        </div>
    </div>
</nav>
<section class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
    <div class="absolute inset-0 hero-glow z-0 pointer-events-none"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-6 backdrop-blur-sm">
                <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span class="text-xs font-medium text-indigo-300 tracking-wide uppercase">AI-Powered Development</span>
            </div>
            <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">Learn by Building <br/><span class="gradient-text">Real Projects</span></h1>
            <p class="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">Stop watching tutorials. Start coding. Our AI platform guides you through reconstructing real GitHub projects and accelerates your workflow with smart templates.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a class="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group" href="#">
                    Start Learning Free <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
                <a class="w-full sm:w-auto px-8 py-3.5 bg-slate-800 text-white border border-slate-700 rounded-lg font-medium hover:bg-slate-750 transition-colors flex items-center justify-center gap-2" href="#">
                    <span class="material-symbols-outlined text-[20px]">play_circle</span> See How It Works
                </a>
            </div>
            <div class="mt-8 flex items-center justify-center gap-6 text-slate-500 text-sm">
                <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-green-500">check_circle</span><span>No credit card required</span></div>
                <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-green-500">check_circle</span><span>Interactive Sandbox</span></div>
            </div>
        </div>
        <div class="relative mt-12 rounded-xl border border-slate-700/50 shadow-2xl bg-[#0F172A] overflow-hidden group">
            <div class="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div class="text-xs font-mono text-slate-500 flex items-center gap-2"><span class="material-symbols-outlined text-[14px]">lock</span>codelearn-demo-project</div>
                <div class="w-16"></div> 
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 h-[500px] lg:h-[600px]">
                <div class="code-editor-bg border-r border-slate-800 p-6 overflow-hidden font-mono text-sm relative">
                    <div class="absolute top-0 left-0 w-12 h-full border-r border-slate-800 bg-[#1e1e1e] flex flex-col items-center pt-4 gap-4 text-slate-500">
                        <span class="text-xs">1</span><span class="text-xs">2</span><span class="text-xs">3</span><span class="text-xs">4</span><span class="text-xs">5</span><span class="text-xs">6</span><span class="text-xs">7</span><span class="text-xs">8</span><span class="text-xs">9</span><span class="text-xs">10</span><span class="text-xs">11</span><span class="text-xs">12</span><span class="text-xs">13</span><span class="text-xs">14</span><span class="text-xs">15</span>
                    </div>
                    <div class="pl-10 space-y-1">
                        <div><span class="token-keyword">import</span> React, { useState, useEffect } <span class="token-keyword">from</span> <span class="token-string">'react'</span>;</div>
                        <div><span class="token-keyword">import</span> { motion } <span class="token-keyword">from</span> <span class="token-string">'framer-motion'</span>;</div>
                        <br/>
                        <div><span class="token-keyword">export default function</span> <span class="token-function">ProjectCard</span>({ title, progress }) {</div>
                        <div class="pl-4"><span class="token-keyword">const</span> [status, setStatus] = <span class="token-function">useState</span>(<span class="token-string">'idle'</span>);</div>
                        <br/>
                        <div class="pl-4"><span class="token-comment">// AI Suggestion: Add error handling for API call</span></div>
                        <div class="pl-4"><span class="token-keyword">useEffect</span>(() => {</div>
                        <div class="pl-8"><span class="token-function">fetchData</span>().<span class="token-function">then</span>(data => {</div>
                        <div class="pl-12"><span class="token-function">setStatus</span>(<span class="token-string">'loaded'</span>);</div>
                        <div class="pl-8">});</div>
                        <div class="pl-4">}, []);</div>
                        <br/>
                        <div class="pl-4"><span class="token-keyword">return</span> (</div>
                        <div class="pl-8"><<span class="token-variable">div</span> <span class="token-variable">className</span>=<span class="token-string">"card-container"</span>></div>
                        <div class="pl-12"><<span class="token-variable">h3</span>>{title}</<span class="token-variable">h3</span>></div>
                        <div class="pl-12"><<span class="token-variable">ProgressBar</span> <span class="token-variable">value</span>={progress} /></div>
                        <div class="pl-8"></<span class="token-variable">div</span>></div>
                        <div class="pl-4">);</div>
                        <div>}</div>
                    </div>
                    <div class="absolute bottom-6 right-6 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 transform translate-y-2 opacity-90 hover:opacity-100 transition-all">
                        <div class="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Mentor</span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex gap-3">
                                <div class="bg-indigo-600/20 text-indigo-200 text-xs p-2 rounded-lg rounded-tl-none">Try adding a loading state to your component while the data fetches.</div>
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button class="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors">Apply Fix</button>
                                <button class="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors">Explain</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-50 relative">
                    <div class="absolute inset-0 bg-[url('[https://placehold.co/800x600/f8fafc/e2e8f0.png?text=App+Preview](https://placehold.co/800x600/f8fafc/e2e8f0.png?text=App+Preview)')] bg-cover bg-center">
                        <div class="p-8 h-full flex flex-col justify-center items-center gap-6">
                            <div class="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 border border-slate-100">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="font-bold text-slate-800 text-lg">Project Status</h3>
                                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Active</span>
                                </div>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-sm mb-1"><span class="text-slate-500">Completion</span><span class="font-medium text-indigo-600">75%</span></div>
                                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-indigo-500 w-3/4 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div class="flex gap-3 mt-4">
                                        <div class="h-8 w-8 rounded-full bg-slate-200"></div>
                                        <div class="h-8 w-8 rounded-full bg-slate-200"></div>
                                        <div class="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs text-slate-500">+3</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 text-xs px-2 py-1 rounded font-medium shadow-sm border border-slate-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Preview
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<section class="py-10 border-y border-slate-800 bg-slate-900/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">Trusted by developers learning technologies like</p>
        <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div class="flex items-center gap-2 text-xl font-bold text-slate-300"><span class="material-symbols-outlined">code</span> React</div>
            <div class="flex items-center gap-2 text-xl font-bold text-slate-300"><span class="material-symbols-outlined">data_object</span> Node.js</div>
            <div class="flex items-center gap-2 text-xl font-bold text-slate-300"><span class="material-symbols-outlined">layers</span> Next.js</div>
            <div class="flex items-center gap-2 text-xl font-bold text-slate-300"><span class="material-symbols-outlined">dataset</span> Python</div>
            <div class="flex items-center gap-2 text-xl font-bold text-slate-300"><span class="material-symbols-outlined">dns</span> PostgreSQL</div>
        </div>
    </div>
</section>
<section class="py-24 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">One Platform, <span class="text-indigo-400">Two Ways to Grow</span></h2>
            <p class="text-slate-400 max-w-2xl mx-auto">Whether you're just starting out or looking to speed up your workflow, we have the tools you need.</p>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
            <div class="group relative bg-[#1E293B] rounded-2xl p-8 border border-slate-700 hover:border-indigo-500/50 transition-colors overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><span class="material-symbols-outlined text-9xl text-indigo-500">school</span></div>
                <div class="relative z-10">
                    <div class="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6"><span class="material-symbols-outlined text-indigo-400 text-2xl">school</span></div>
                    <h3 class="text-2xl font-bold text-white mb-2">Learning Mode</h3>
                    <p class="text-indigo-300 text-sm font-medium mb-6 uppercase tracking-wide">Free Forever</p>
                    <p class="text-slate-400 mb-8 leading-relaxed">Master new frameworks by rebuilding popular open-source projects from scratch. Our AI breaks down complex codebases into manageable learning tasks.</p>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> Real-world project curriculum</li>
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> Step-by-step AI guidance</li>
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> Automated code review</li>
                    </ul>
                    <a class="inline-flex items-center text-white font-medium hover:text-indigo-400 transition-colors" href="#">Start Learning <span class="material-symbols-outlined ml-1 text-sm">arrow_forward</span></a>
                </div>
            </div>
            <div class="group relative bg-[#1E293B] rounded-2xl p-8 border border-slate-700 hover:border-violet-500/50 transition-colors overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><span class="material-symbols-outlined text-9xl text-violet-500">rocket_launch</span></div>
                <div class="relative z-10">
                    <div class="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-6"><span class="material-symbols-outlined text-violet-400 text-2xl">rocket_launch</span></div>
                    <h3 class="text-2xl font-bold text-white mb-2">Developer Mode</h3>
                    <p class="text-violet-300 text-sm font-medium mb-6 uppercase tracking-wide">Freemium</p>
                    <p class="text-slate-400 mb-8 leading-relaxed">Stop reinventing the wheel. Extract battle-tested components and logic from open-source projects and integrate them into your code instantly.</p>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> AI Smart Template Extraction</li>
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> Instant Code Integration</li>
                        <li class="flex items-center gap-3 text-slate-300"><span class="material-symbols-outlined text-green-500 text-sm">check</span> Tech Stack Migration Tools</li>
                    </ul>
                    <a class="inline-flex items-center text-white font-medium hover:text-violet-400 transition-colors" href="#">Boost Productivity <span class="material-symbols-outlined ml-1 text-sm">arrow_forward</span></a>
                </div>
            </div>
        </div>
    </div>
</section>
<section class="py-24 bg-slate-900/30 border-y border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p class="text-slate-400">From zero to deployed in three simple steps.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-12 relative">
            <div class="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-slate-700 via-indigo-900 to-slate-700 -z-10 transform translate-y-1/2"></div>
            <div class="relative flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 z-10"><span class="text-2xl font-bold text-indigo-400">1</span></div>
                <h3 class="text-xl font-bold mb-3">Choose a Technology</h3>
                <p class="text-slate-400 text-sm leading-relaxed">Select a stack you want to learn. We support React, Vue, Node.js, and more modern frameworks.</p>
            </div>
            <div class="relative flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 z-10"><span class="text-2xl font-bold text-indigo-400">2</span></div>
                <h3 class="text-xl font-bold mb-3">AI Curates the Path</h3>
                <p class="text-slate-400 text-sm leading-relaxed">Our AI analyzes top GitHub repositories and breaks them down into bite-sized, sequential tasks for you.</p>
            </div>
            <div class="relative flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 z-10"><span class="text-2xl font-bold text-indigo-400">3</span></div>
                <h3 class="text-xl font-bold mb-3">Build & Deploy</h3>
                <p class="text-slate-400 text-sm leading-relaxed">Write code in our browser-based editor, get instant feedback, and deploy your portfolio project live.</p>
            </div>
        </div>
    </div>
</section>
<section class="py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p class="text-slate-400">Start for free, upgrade when you need more power.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div class="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                <div class="mb-4">
                    <h3 class="text-lg font-bold">Hobby</h3>
                    <div class="text-3xl font-bold mt-2">$0<span class="text-sm font-normal text-slate-400">/mo</span></div>
                </div>
                <p class="text-sm text-slate-400 mb-6">Perfect for learning and students.</p>
                <ul class="space-y-3 mb-8 text-sm text-slate-300">
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Unlimited Learning Mode</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> 3 Active Projects</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Community Support</li>
                </ul>
                <a class="block w-full py-2.5 text-center rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-colors font-medium text-sm" href="#">Start Free</a>
            </div>
            <div class="bg-slate-800 rounded-xl p-8 border border-indigo-500 relative transform md:-translate-y-4 shadow-xl shadow-indigo-500/10">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Most Popular</div>
                <div class="mb-4">
                    <h3 class="text-lg font-bold">Pro Developer</h3>
                    <div class="text-3xl font-bold mt-2">$19<span class="text-sm font-normal text-slate-400">/mo</span></div>
                </div>
                <p class="text-sm text-slate-400 mb-6">For developers building real apps.</p>
                <ul class="space-y-3 mb-8 text-sm text-slate-300">
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> All Free features</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Unlimited Templates</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> AI Mentor Access</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Private Repos</li>
                </ul>
                <a class="block w-full py-2.5 text-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium text-sm" href="#">Get Started</a>
            </div>
            <div class="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                <div class="mb-4">
                    <h3 class="text-lg font-bold">Team</h3>
                    <div class="text-3xl font-bold mt-2">$99<span class="text-sm font-normal text-slate-400">/mo</span></div>
                </div>
                <p class="text-sm text-slate-400 mb-6">For engineering teams.</p>
                <ul class="space-y-3 mb-8 text-sm text-slate-300">
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> 5 Team Members</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Shared Templates</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Admin Dashboard</li>
                    <li class="flex gap-2"><span class="material-symbols-outlined text-indigo-400 text-base">check</span> Priority Support</li>
                </ul>
                <a class="block w-full py-2.5 text-center rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-colors font-medium text-sm" href="#">Contact Sales</a>
            </div>
        </div>
    </div>
</section>
<footer class="bg-[#0B1120] border-t border-slate-800 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div class="col-span-2 md:col-span-1">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold font-mono">CL</div>
                    <span class="font-bold text-lg">CodeLearn</span>
                </div>
                <p class="text-slate-400 text-sm mb-6">Empowering developers to learn faster and build better with AI.</p>
                <div class="flex space-x-4">
                    <a class="text-slate-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">thumb_up</span></a> 
                    <a class="text-slate-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">code</span></a> 
                    <a class="text-slate-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">videocam</span></a> 
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-white mb-4">Platform</h4>
                <ul class="space-y-2 text-sm text-slate-400">
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Learning Mode</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Developer Mode</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Pricing</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Enterprise</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold text-white mb-4">Resources</h4>
                <ul class="space-y-2 text-sm text-slate-400">
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Documentation</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Blog</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Community</a></li>
                    <li><a class="hover:text-indigo-400 transition-colors" href="#">Changelog</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold text-white mb-4">Stay Updated</h4>
                <form class="flex flex-col gap-2">
                    <input class="bg-slate-800 border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full p-2.5" placeholder="Enter your email" type="email"/>
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors" type="submit">Subscribe</button>
                </form>
            </div>
        </div>
        <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-slate-500 text-sm">© 2024 CodeLearn Inc. All rights reserved.</p>
            <div class="flex gap-6 text-sm text-slate-500">
                <a class="hover:text-slate-300" href="#">Privacy Policy</a>
                <a class="hover:text-slate-300" href="#">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>
</body></html>```

### 2. User Dashboard
**Purpose:** Core user interface tracking progress, projects, stats, and personalized learning paths.

```html
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>User Dashboard - CodeLearn</title>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<style type="text/tailwindcss">
    :root {
        --primary-color: #6366F1;
        --primary-hover: #4F46E5;
        --dark-bg: #0F172A;
        --card-bg: #1E293B;
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --success: #10B981;
        --border-color: #334155;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--dark-bg);
        color: var(--text-primary);
    }
    .font-heading { font-family: 'Space Grotesk', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--dark-bg); }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>
</head>
<body class="h-screen flex overflow-hidden selection:bg-indigo-500 selection:text-white">
<aside class="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-300">
    <div class="p-6">
        <div class="flex items-center gap-3 mb-10">
            <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[20px]">terminal</span></div>
            <h1 class="font-heading text-xl font-bold tracking-tight text-white">CodeLearn</h1>
        </div>
        <nav class="space-y-1">
            <a class="flex items-center gap-3 px-3 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">dashboard</span><span class="text-sm font-medium">Dashboard</span></a>
            <a class="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">school</span><span class="text-sm font-medium">Learning Path</span></a>
            <a class="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">code_blocks</span><span class="text-sm font-medium">Developer Mode</span><span class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">PRO</span></a>
            <a class="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">folder_open</span><span class="text-sm font-medium">My Projects</span></a>
            <a class="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">forum</span><span class="text-sm font-medium">Community</span></a>
        </nav>
        <div class="mt-8">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Tech Stack</h3>
            <div class="space-y-1">
                <button class="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors text-left"><span class="w-2 h-2 rounded-full bg-[#61DAFB]"></span><span class="text-sm">React</span></button>
                <button class="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors text-left"><span class="w-2 h-2 rounded-full bg-[#3C873A]"></span><span class="text-sm">Node.js</span></button>
                <button class="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg group transition-colors text-left">
                    <div class="w-4 h-4 flex items-center justify-center border border-dashed border-gray-600 rounded-full"><span class="material-symbols-outlined text-[10px]">add</span></div>
                    <span class="text-sm text-gray-500">Add Technology</span>
                </button>
            </div>
        </div>
    </div>
    <div class="p-4 border-t border-[#1F2937]">
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <img alt="User Avatar" class="w-9 h-9 rounded-full bg-gray-700" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuAHMQxjl11sKZfFTibo9YwzNYJZcb0rjN-Nq2atIYMHZJB8bJKSiclNDPU_8cUsQLByn0nACTKoAj0O0x6YQQqZAV49hLHWvpViH1DbeFuH44hCZm7g3P3KvLYXphzWz-KIFEidJho9KqpCn4F_VO5rVBVxHMC_b2-kOpqXNaP-f-hgtbzbsRs098jqWi_bUnNL46PzhYeBd92lreMdF44APvKTC3puvsAU7NHXdVqPFgIAkUsqQbsOCi4f02GNPLA0RNjVRzWZYpc](https://lh3.googleusercontent.com/aida-public/AB6AXuAHMQxjl11sKZfFTibo9YwzNYJZcb0rjN-Nq2atIYMHZJB8bJKSiclNDPU_8cUsQLByn0nACTKoAj0O0x6YQQqZAV49hLHWvpViH1DbeFuH44hCZm7g3P3KvLYXphzWz-KIFEidJho9KqpCn4F_VO5rVBVxHMC_b2-kOpqXNaP-f-hgtbzbsRs098jqWi_bUnNL46PzhYeBd92lreMdF44APvKTC3puvsAU7NHXdVqPFgIAkUsqQbsOCi4f02GNPLA0RNjVRzWZYpc)"/>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">Alex Dev</p>
                <p class="text-xs text-gray-500 truncate">Free Plan</p>
            </div>
            <span class="material-symbols-outlined text-gray-500 text-[18px]">settings</span>
        </div>
    </div>
</aside>
<main class="flex-1 flex flex-col h-full bg-[#0F172A] relative overflow-hidden">
    <header class="h-16 border-b border-[#1F2937] bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
        <button class="md:hidden text-gray-400 hover:text-white mr-4"><span class="material-symbols-outlined">menu</span></button>
        <div class="flex-1 max-w-xl">
            <div class="relative group">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors material-symbols-outlined text-[20px]">search</span>
                <input class="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500" placeholder="Search projects, templates, or docs (Cmd+K)" type="text"/>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                    <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#334155] rounded border border-gray-600">⌘</kbd>
                    <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#334155] rounded border border-gray-600">K</kbd>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-4 ml-6">
            <button class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                <span class="material-symbols-outlined text-[22px]">notifications</span>
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0F172A]"></span>
            </button>
            <div class="h-6 w-px bg-[#334155]"></div>
            <button class="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                <span class="material-symbols-outlined text-[20px]">bolt</span><span class="hidden sm:inline">Upgrade to Pro</span>
            </button>
        </div>
    </header>
    <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 class="font-heading text-3xl font-bold text-white mb-2">Welcome back, Alex! 👋</h2>
                <p class="text-gray-400">You're on a roll. Let's keep building.</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-400 bg-[#1E293B] px-4 py-2 rounded-full border border-[#334155]">
                <span class="material-symbols-outlined text-yellow-500 text-[18px]">local_fire_department</span>
                <span class="font-medium text-white">12 Day Streak</span><span>•</span><span>Level 4 Developer</span>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-indigo-500/30 transition-colors group">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><span class="material-symbols-outlined">folder_managed</span></div>
                    <span class="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded"><span class="material-symbols-outlined text-[14px]">trending_up</span> +2 this week</span>
                </div>
                <div class="font-heading text-3xl font-bold text-white mb-1">8</div>
                <p class="text-sm text-gray-400">Projects Completed</p>
            </div>
            <div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-violet-500/30 transition-colors group">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-violet-500/10 rounded-lg text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors"><span class="material-symbols-outlined">schedule</span></div>
                </div>
                <div class="font-heading text-3xl font-bold text-white mb-1">42h</div>
                <p class="text-sm text-gray-400">Total Learning Hours</p>
            </div>
            <div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-pink-500/30 transition-colors group">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-pink-500/10 rounded-lg text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors"><span class="material-symbols-outlined">code</span></div>
                    <span class="text-xs font-medium text-gray-500">Top 5%</span>
                </div>
                <div class="font-heading text-3xl font-bold text-white mb-1">1,240</div>
                <p class="text-sm text-gray-400">Lines of Code Written</p>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
                <section>
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">Continue Learning</h3>
                        <a class="text-sm text-indigo-400 hover:text-indigo-300" href="#">View all</a>
                    </div>
                    <div class="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                        <div class="p-6">
                            <div class="flex items-start justify-between gap-4 mb-6">
                                <div class="flex gap-4">
                                    <div class="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                                        <img alt="React" class="w-10 h-10 object-contain" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuCh_MmskTl4FFbKWtRSXVM-ax7xJg172Yc4atkmNkERVSUVqCsoClEBtNqVB-FjTD97kO1pmbMbIkL8ybfIZi4QlumklNPTsnff39aelDUc8qa7BhQQY-2Q5M7jN4tcAwoJ31fQ3Jo22v4WvffXUPvw6W3jw9iUM1JRxr2xHsl2GLjXAEpXV9VC5DzPPV5JN2hF3woMzDdKRYXwFTb3SZ2lu3v67TUOd4VVTJmdnTn2kBIf8gbqsAT_6M_fTuSL6j8eEkyuM-F-XGM](https://lh3.googleusercontent.com/aida-public/AB6AXuCh_MmskTl4FFbKWtRSXVM-ax7xJg172Yc4atkmNkERVSUVqCsoClEBtNqVB-FjTD97kO1pmbMbIkL8ybfIZi4QlumklNPTsnff39aelDUc8qa7BhQQY-2Q5M7jN4tcAwoJ31fQ3Jo22v4WvffXUPvw6W3jw9iUM1JRxr2xHsl2GLjXAEpXV9VC5DzPPV5JN2hF3woMzDdKRYXwFTb3SZ2lu3v67TUOd4VVTJmdnTn2kBIf8gbqsAT_6M_fTuSL6j8eEkyuM-F-XGM)"/>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wide">Intermediate</span>
                                            <span class="text-gray-500 text-xs">• React & Next.js</span>
                                        </div>
                                        <h4 class="text-xl font-bold text-white mb-1">Full-Stack E-commerce Dashboard</h4>
                                        <p class="text-sm text-gray-400 line-clamp-1">Learn to build a modern dashboard with charts, data tables, and authentication.</p>
                                    </div>
                                </div>
                                <button class="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">
                                    <span class="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
                                </button>
                            </div>
                            <div class="space-y-2">
                                <div class="flex justify-between text-xs font-medium"><span class="text-indigo-300">Current Task: Implement Authentication Flow</span><span class="text-gray-400">65% Complete</span></div>
                                <div class="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%] rounded-full relative">
                                        <div class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                <div class="flex justify-between pt-1"><span class="text-xs text-gray-500 font-mono">12/18 subtasks done</span><span class="text-xs text-gray-500">~2h remaining</span></div>
                            </div>
                        </div>
                        <div class="bg-[#273549] px-6 py-3 border-t border-[#334155] flex items-center justify-between">
                            <div class="flex -space-x-2">
                                <img alt="Student" class="w-6 h-6 rounded-full border-2 border-[#1E293B]" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuAK-ph5enVYDGUyuEkv-og6daE2Vb0VcmSFInhLepctmr7a9JQ6NpJguGaXnOq6dNbFNPiT_e43fChsSd7JWjpBFcU7_TWEJQe89jr3YZtU5M2AfrskQxp5F94ACKAjXM636tVJIoTq5zkEywhe9wOkkLf9lEapyPx4OJbkONhF7vuvk9KsYITWIrpUoRAGYvostpTEu63-Xszda8lOBcbTdABScrlFJz66UpfNbkm6NVEFkgvFQJsCCjKUyKJAyFydSHePDkMokCk](https://lh3.googleusercontent.com/aida-public/AB6AXuAK-ph5enVYDGUyuEkv-og6daE2Vb0VcmSFInhLepctmr7a9JQ6NpJguGaXnOq6dNbFNPiT_e43fChsSd7JWjpBFcU7_TWEJQe89jr3YZtU5M2AfrskQxp5F94ACKAjXM636tVJIoTq5zkEywhe9wOkkLf9lEapyPx4OJbkONhF7vuvk9KsYITWIrpUoRAGYvostpTEu63-Xszda8lOBcbTdABScrlFJz66UpfNbkm6NVEFkgvFQJsCCjKUyKJAyFydSHePDkMokCk)"/>
                                <img alt="Student" class="w-6 h-6 rounded-full border-2 border-[#1E293B]" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuC7z0xUnA5YUS137OLza93VVgU0D2gsF4TABIUGLFnuuhh0cEr19n9zHmFpI6kXKXGTqXyttpGMbG1qb54OFiLGLf2JX0XzgF0zYEK-bqMaP1MnNTWkOEFjeofzmvhsrsxUzswnJ--3pKdNY2b885sptypN6TDiWK6CZg6akndsNl6keJ4qxy13yttugTkd2rj6xAYSQnRRrmZ60tzqB4C2y0VkwuKusFEl089-QlidTNcKiSiAg8mPk88CSP5Mb_qHAKPUE7wBE0c](https://lh3.googleusercontent.com/aida-public/AB6AXuC7z0xUnA5YUS137OLza93VVgU0D2gsF4TABIUGLFnuuhh0cEr19n9zHmFpI6kXKXGTqXyttpGMbG1qb54OFiLGLf2JX0XzgF0zYEK-bqMaP1MnNTWkOEFjeofzmvhsrsxUzswnJ--3pKdNY2b885sptypN6TDiWK6CZg6akndsNl6keJ4qxy13yttugTkd2rj6xAYSQnRRrmZ60tzqB4C2y0VkwuKusFEl089-QlidTNcKiSiAg8mPk88CSP5Mb_qHAKPUE7wBE0c)"/>
                                <img alt="Student" class="w-6 h-6 rounded-full border-2 border-[#1E293B]" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuDCd4z6rm4FHXcV0cw8xzOvv1IwySDw9ZNBVcPfvf1GR-67m8hCXyQkP9OqYQWu2_58JNh19b_TsQraBvXDFwPQDDoxZIF-_v1Skd9b3giX__Crj9u_t90V8Jn8qLpzius9b9nJUxXy70p8rUuhJqg7KdyXvAfiYtZ-GnE-MxBWQJUdiAj7RsiFQBZzEMOCNqdrdNp7uuiO7MVCsijmZeCkllT4RJ9sVjhp-BzL3HTWcAkKHvZ5Kfbb-J5aXeNWOoq5oFadxvqL578](https://lh3.googleusercontent.com/aida-public/AB6AXuDCd4z6rm4FHXcV0cw8xzOvv1IwySDw9ZNBVcPfvf1GR-67m8hCXyQkP9OqYQWu2_58JNh19b_TsQraBvXDFwPQDDoxZIF-_v1Skd9b3giX__Crj9u_t90V8Jn8qLpzius9b9nJUxXy70p8rUuhJqg7KdyXvAfiYtZ-GnE-MxBWQJUdiAj7RsiFQBZzEMOCNqdrdNp7uuiO7MVCsijmZeCkllT4RJ9sVjhp-BzL3HTWcAkKHvZ5Kfbb-J5aXeNWOoq5oFadxvqL578)"/>
                                <span class="w-6 h-6 rounded-full border-2 border-[#1E293B] bg-gray-700 flex items-center justify-center text-[8px] text-white font-medium">+420</span>
                            </div>
                            <button class="text-xs font-medium text-white hover:text-indigo-400 transition-colors flex items-center gap-1">Resume Project <span class="material-symbols-outlined text-[14px]">arrow_forward</span></button>
                        </div>
                    </div>
                </section>
                <section>
                    <h3 class="text-lg font-semibold text-white mb-4">Recommended for You</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-gray-500 transition-all cursor-pointer relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-gray-400 text-[20px]">bookmark</span></div>
                            <div class="w-10 h-10 rounded bg-[#334155] flex items-center justify-center mb-4 text-white"><span class="font-bold text-xl">JS</span></div>
                            <h4 class="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Weather App with API</h4>
                            <p class="text-sm text-gray-400 mb-4 line-clamp-2">Master asynchronous JavaScript by fetching real-time weather data.</p>
                            <div class="flex items-center gap-3 text-xs text-gray-500"><span class="bg-[#0F172A] px-2 py-1 rounded">Beginner</span><span>4 hours</span></div>
                        </div>
                        <div class="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-gray-500 transition-all cursor-pointer relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-gray-400 text-[20px]">bookmark</span></div>
                            <div class="w-10 h-10 rounded bg-[#334155] flex items-center justify-center mb-4 text-emerald-400"><span class="material-symbols-outlined">dataset</span></div>
                            <h4 class="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Supabase Backend Integration</h4>
                            <p class="text-sm text-gray-400 mb-4 line-clamp-2">Learn to connect your frontend to a real database with authentication.</p>
                            <div class="flex items-center gap-3 text-xs text-gray-500"><span class="bg-[#0F172A] px-2 py-1 rounded">Advanced</span><span>6 hours</span></div>
                        </div>
                    </div>
                </section>
            </div>
            <aside class="space-y-6">
                <div class="bg-gradient-to-b from-indigo-900/20 to-[#1E293B] border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"><span class="material-symbols-outlined text-white text-[16px]">smart_toy</span></div>
                        <h3 class="font-bold text-white text-sm">AI Mentor</h3>
                    </div>
                    <p class="text-sm text-gray-300 mb-4 bg-[#0F172A]/50 p-3 rounded-lg border border-indigo-500/10">"Hey Alex! I noticed you paused on the Authentication Flow. Want a quick refresher on JWTs?"</p>
                    <div class="flex gap-2">
                        <button class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/20">Explain JWTs</button>
                        <button class="flex-1 bg-[#334155] hover:bg-[#475569] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">Ask Question</button>
                    </div>
                </div>
                <div class="bg-[#1E293B] border border-[#334155] rounded-xl p-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-white text-sm">Daily Code Challenge</h3>
                        <span class="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase">Hard</span>
                    </div>
                    <div class="bg-[#0F172A] p-3 rounded-lg border border-[#334155] font-mono text-xs text-gray-300 mb-3">
                        <span class="text-purple-400">function</span> <span class="text-blue-400">reverseList</span>(head) {<br/>
                        <span class="text-gray-500">// Your code here...</span><br/>
                        }
                    </div>
                    <button class="w-full text-center text-sm text-gray-300 hover:text-white hover:bg-[#334155] py-2 rounded-lg transition-colors border border-dashed border-gray-600 hover:border-transparent">Solve Challenge (+50 XP)</button>
                </div>
                <div class="bg-[#1E293B] border border-[#334155] rounded-xl p-5">
                    <h3 class="font-bold text-white text-sm mb-4">Community Activity</h3>
                    <div class="space-y-4">
                        <div class="flex gap-3">
                            <img class="w-8 h-8 rounded-full bg-gray-700" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBDF4qgf2umXHFh0cuLmcIC7jT1ldoPtRBiufLzR0ZPzfK4yaBmw-emRNHT1fQr7wmyGzybU1ASG9nLRswwkfVJupC24N8oq0RJXTwxp9wSu5zumjbDe-l4adyO_2qE6uDAI3-R5VofqI2WqTiDjUXIY3SmsGKyPgX2lxwjHZ4ai92WsWqPynzkRVcW5wgixxqpiDaQOhkuSZWsEQ38axBq59qI8f2pAICyt-y4AxNO-GKV_HHgvTsVNfiMd8YZE4NOHk1DBNdgH7I](https://lh3.googleusercontent.com/aida-public/AB6AXuBDF4qgf2umXHFh0cuLmcIC7jT1ldoPtRBiufLzR0ZPzfK4yaBmw-emRNHT1fQr7wmyGzybU1ASG9nLRswwkfVJupC24N8oq0RJXTwxp9wSu5zumjbDe-l4adyO_2qE6uDAI3-R5VofqI2WqTiDjUXIY3SmsGKyPgX2lxwjHZ4ai92WsWqPynzkRVcW5wgixxqpiDaQOhkuSZWsEQ38axBq59qI8f2pAICyt-y4AxNO-GKV_HHgvTsVNfiMd8YZE4NOHk1DBNdgH7I)"/>
                            <div>
                                <p class="text-xs text-gray-300"><span class="font-bold text-white">Sarah</span> forked your project <span class="text-indigo-400">Todo App</span></p>
                                <p class="text-[10px] text-gray-500 mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><span class="material-symbols-outlined text-[16px]">check_circle</span></div>
                            <div>
                                <p class="text-xs text-gray-300">You completed the <span class="text-emerald-400">React Basics</span> module</p>
                                <p class="text-[10px] text-gray-500 mt-1">Yesterday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</main>
</body></html>
```

### 3. Project Workspace Editor
**Purpose:** Interactive code editor interface where users build projects, view AI guidance, and preview live outputs.

```html
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Project Workspace Editor - CodeLearn</title>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<style type="text/tailwindcss">
    :root {
        --bg-dark: #0f172a;
        --bg-panel: #1e293b;
        --bg-editor: #0d1117;
        --border-color: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --primary-color: #6366f1;
        --accent-color: #10b981;
        --editor-line-highlight: #1f2937;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-dark);
        color: var(--text-primary);
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #64748b; }
    .token.keyword { color: #c678dd; }
    .token.function { color: #61afef; }
    .token.string { color: #98c379; }
    .token.comment { color: #5c6370; font-style: italic; }
    .token.operator { color: #56b6c2; }
    .token.number { color: #d19a66; }
    .token.class { color: #e5c07b; }
    .token.tag { color: #e06c75; }
    .token.attr { color: #d19a66; }
</style>
</head>
<body class="h-screen w-screen overflow-hidden flex flex-col">
<header class="h-14 bg-[var(--bg-panel)] border-b border-[var(--border-color)] flex items-center justify-between px-4 shrink-0 z-20">
    <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-[var(--primary-color)] font-bold text-lg"><span class="material-symbols-outlined text-2xl">code_blocks</span> CodeLearn</div>
        <div class="h-6 w-px bg-[var(--border-color)]"></div>
        <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[var(--text-secondary)]">folder_open</span><span class="text-sm font-medium">react-todo-app</span><span class="text-[var(--text-secondary)] text-sm">/ src / components / Header.jsx</span></div>
    </div>
    <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
            <div class="text-sm font-medium text-[var(--text-secondary)]">Task 4/12</div>
            <div class="w-32 h-2 bg-gray-700 rounded-full overflow-hidden"><div class="h-full bg-[var(--primary-color)] w-1/3 rounded-full"></div></div>
        </div>
        <div class="flex items-center bg-black/20 rounded-lg p-1 border border-[var(--border-color)]">
            <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-white/5 rounded transition-colors text-white"><span class="material-symbols-outlined text-[var(--accent-color)] text-lg">play_arrow</span> Run</button>
            <div class="w-px h-4 bg-[var(--border-color)] mx-1"></div>
            <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-white/5 rounded transition-colors text-[var(--text-secondary)] hover:text-white"><span class="material-symbols-outlined text-lg">save</span> Save</button>
        </div>
    </div>
    <div class="flex items-center gap-4">
        <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-md hover:bg-amber-400/20 transition-colors"><span class="material-symbols-outlined text-lg">lightbulb</span> Get Hint</button>
        <button class="text-[var(--text-secondary)] hover:text-white transition-colors relative"><span class="material-symbols-outlined">notifications</span><span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span></button>
        <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border border-white/10 cursor-pointer">JS</div>
    </div>
</header>
<main class="flex-1 flex overflow-hidden">
    <aside class="w-64 bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex flex-col shrink-0">
        <div class="flex border-b border-[var(--border-color)]">
            <button class="flex-1 py-3 text-sm font-medium text-[var(--text-primary)] border-b-2 border-[var(--primary-color)] bg-white/5">Tasks</button>
            <button class="flex-1 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors">Explorer</button>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            <div class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Current Objective</div>
            <div class="bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 rounded-lg p-3">
                <div class="flex items-start gap-3">
                    <div class="mt-0.5"><span class="material-symbols-outlined text-[var(--primary-color)] text-base">radio_button_unchecked</span></div>
                    <div>
                        <h4 class="text-sm font-semibold text-white">Create Header Component</h4>
                        <p class="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Build a responsive header with a logo and navigation links using Flexbox.</p>
                        <div class="mt-2 flex items-center gap-2">
                            <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">React</span>
                            <span class="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30">Tailwind</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full h-px bg-[var(--border-color)]"></div>
            <div class="space-y-3">
                <div class="flex items-start gap-3 group opacity-70 hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[var(--text-secondary)] text-base mt-0.5">check_box_outline_blank</span><span class="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Implement Todo Input Form</span></div>
                <div class="flex items-start gap-3 group opacity-70 hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[var(--text-secondary)] text-base mt-0.5">check_box_outline_blank</span><span class="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Add State Management Logic</span></div>
                <div class="flex items-start gap-3 group opacity-70 hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[var(--text-secondary)] text-base mt-0.5">check_box_outline_blank</span><span class="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Create Task Item Component</span></div>
                <div class="flex items-start gap-3 group opacity-70 hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[var(--text-secondary)] text-base mt-0.5">check_box_outline_blank</span><span class="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Connect LocalStorage</span></div>
            </div>
            <div class="pt-4 mt-2">
                <button class="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-white mb-3"><span class="material-symbols-outlined text-sm">expand_more</span> Completed (3)</button>
                <div class="space-y-2 pl-1">
                    <div class="flex items-center gap-3 opacity-50"><span class="material-symbols-outlined text-[var(--accent-color)] text-base">check_box</span><span class="text-sm text-[var(--text-secondary)] line-through">Project Setup</span></div>
                    <div class="flex items-center gap-3 opacity-50"><span class="material-symbols-outlined text-[var(--accent-color)] text-base">check_box</span><span class="text-sm text-[var(--text-secondary)] line-through">Install Dependencies</span></div>
                </div>
            </div>
        </div>
        <div class="h-1/3 border-t border-[var(--border-color)] bg-black/20 flex flex-col">
            <div class="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-panel)] flex justify-between items-center">
                <span>EXPLORER</span><span class="material-symbols-outlined text-sm cursor-pointer hover:text-white">more_horiz</span>
            </div>
            <div class="flex-1 overflow-y-auto p-2 font-mono text-xs text-[var(--text-secondary)]">
                <div class="pl-2 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">folder</span> src</div>
                <div class="pl-6 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">folder</span> components</div>
                <div class="pl-10 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-l-2 border-[var(--primary-color)] cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">javascript</span> Header.jsx</div>
                <div class="pl-10 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">javascript</span> TodoList.jsx</div>
                <div class="pl-6 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">css</span> App.css</div>
                <div class="pl-6 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">javascript</span> App.jsx</div>
                <div class="pl-6 py-1 hover:bg-white/5 hover:text-white cursor-pointer flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">javascript</span> main.jsx</div>
            </div>
        </div>
    </aside>
    <section class="flex-1 flex flex-col min-w-0 bg-[var(--bg-editor)] relative group">
        <div class="flex items-center bg-[var(--bg-panel)] border-b border-[var(--border-color)] overflow-x-auto scrollbar-thin">
            <div class="px-4 py-2.5 bg-[var(--bg-editor)] text-sm text-white border-t-2 border-[var(--primary-color)] flex items-center gap-2 min-w-fit">
                <span class="material-symbols-outlined text-yellow-400 text-sm">javascript</span> Header.jsx
                <span class="material-symbols-outlined text-base text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded cursor-pointer ml-1">close</span>
            </div>
            <div class="px-4 py-2.5 hover:bg-[var(--bg-editor)] text-sm text-[var(--text-secondary)] border-t-2 border-transparent border-r border-[var(--border-color)] flex items-center gap-2 min-w-fit cursor-pointer">
                <span class="material-symbols-outlined text-blue-400 text-sm">css</span> App.css
                <span class="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 rounded cursor-pointer ml-1">close</span>
            </div>
            <div class="px-4 py-2.5 hover:bg-[var(--bg-editor)] text-sm text-[var(--text-secondary)] border-t-2 border-transparent border-r border-[var(--border-color)] flex items-center gap-2 min-w-fit cursor-pointer">
                <span class="material-symbols-outlined text-yellow-400 text-sm">javascript</span> App.jsx
                <span class="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 rounded cursor-pointer ml-1">close</span>
            </div>
        </div>
        <div class="flex-1 relative flex font-mono text-sm">
            <div class="w-12 bg-[var(--bg-editor)] text-[var(--text-secondary)] opacity-50 flex flex-col items-end pr-3 pt-4 select-none text-xs leading-6 shrink-0">
                <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div>
            </div>
            <div class="flex-1 pt-4 pl-2 overflow-auto scrollbar-thin leading-6">
                <div class="whitespace-pre"><span class="token keyword">import</span> React <span class="token keyword">from</span> <span class="token string">'react'</span>;
<span class="token keyword">import</span> { Link } <span class="token keyword">from</span> <span class="token string">'react-router-dom'</span>;
<span class="token comment">// Task: Create a responsive header component</span>
<span class="token keyword">const</span> <span class="token function">Header</span> = () => {
  <span class="token keyword">return</span> (
    <span class="token tag"><header</span> <span class="token attr">className</span>=<span class="token string">"bg-slate-900 border-b border-slate-800 p-4"</span><span class="token tag">></span>
        <span class="token tag"><div</span> <span class="token attr">className</span>=<span class="token string">"container mx-auto flex justify-between items-center"</span><span class="token tag">></span>
            <span class="token tag"><div</span> <span class="token attr">className</span>=<span class="token string">"flex items-center gap-2"</span><span class="token tag">></span>
                <span class="token tag"><span</span> <span class="token attr">className</span>=<span class="token string">"text-2xl"</span><span class="token tag">></span>📝<span class="token tag"></span></span>
                <span class="token tag"><h1</span> <span class="token attr">className</span>=<span class="token string">"text-xl font-bold text-white"</span><span class="token tag">></span>TaskMaster<span class="token tag"></h1></span>
            <span class="token tag"></div></span>
            <span class="token tag"><nav></span>
                <span class="token tag"><ul</span> <span class="token attr">className</span>=<span class="token string">"flex gap-6"</span><span class="token tag">></span>
                    <span class="token tag"><li></span><span class="token tag"><Link</span> <span class="token attr">to</span>=<span class="token string">"/"</span> <span class="token attr">className</span>=<span class="token string">"text-slate-300 hover:text-white"</span><span class="token tag">></span>Home<span class="token tag"></Link></span><span class="token tag"></li></span>
                    <span class="token tag"><li></span><span class="token tag"><Link</span> <span class="token attr">to</span>=<span class="token string">"/active"</span> <span class="token attr">className</span>=<span class="token string">"text-slate-300 hover:text-white"</span><span class="token tag">></span>Active<span class="token tag"></Link></span><span class="token tag"></li></span>
                <span class="token tag"></ul></span>
            <span class="token tag"></nav></span>
        <span class="token tag"></div></span>
    <span class="token tag"></header></span>
  );
};
<span class="token keyword">export</span> <span class="token keyword">default</span> Header;</div>
            </div>
            <div class="absolute top-[265px] left-[320px] w-0.5 h-5 bg-[var(--accent-color)] animate-pulse"></div>
        </div>
        <div class="h-32 bg-[var(--bg-panel)] border-t border-[var(--border-color)] flex flex-col shrink-0">
            <div class="flex items-center px-4 border-b border-[var(--border-color)]">
                <button class="py-1.5 px-3 text-xs font-medium text-white border-b-2 border-[var(--accent-color)]">Terminal</button>
                <button class="py-1.5 px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-white">Problems <span class="bg-red-500/20 text-red-400 px-1.5 rounded-full ml-1 text-[10px]">0</span></button>
                <button class="py-1.5 px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-white">Output</button>
                <div class="flex-1"></div>
                <button class="p-1 hover:bg-white/5 rounded text-[var(--text-secondary)]"><span class="material-symbols-outlined text-sm">keyboard_arrow_down</span></button>
            </div>
            <div class="p-2 font-mono text-xs overflow-y-auto flex-1">
                <div class="text-green-400">➜  react-todo-app git:(main) <span class="text-white">npm run dev</span></div>
                <div class="text-[var(--text-secondary)] mt-1">> vite dev</div>
                <div class="mt-2 text-[var(--text-primary)]">  VITE v4.4.9  <span class="text-green-400">ready in 240 ms</span></div>
                <div class="mt-1 flex items-center gap-2"><span class="text-green-400">➜</span><span class="text-white font-bold">Local:</span><span class="text-blue-400 hover:underline cursor-pointer">http://localhost:5173/</span></div>
            </div>
        </div>
    </section>
    <aside class="w-[400px] flex flex-col border-l border-[var(--border-color)] shrink-0 bg-[var(--bg-dark)]">
        <div class="h-1/2 flex flex-col border-b border-[var(--border-color)]">
            <div class="h-10 bg-[var(--bg-panel)] flex items-center px-3 border-b border-[var(--border-color)] gap-2">
                <div class="flex gap-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div class="flex-1 bg-[var(--bg-dark)] rounded h-6 flex items-center px-2 text-xs text-[var(--text-secondary)] border border-[var(--border-color)] truncate">http://localhost:5173/</div>
                <span class="material-symbols-outlined text-sm text-[var(--text-secondary)] cursor-pointer hover:text-white">refresh</span>
                <span class="material-symbols-outlined text-sm text-[var(--text-secondary)] cursor-pointer hover:text-white">open_in_new</span>
            </div>
            <div class="flex-1 bg-white overflow-hidden relative group">
                <div class="w-full h-full bg-slate-50 flex flex-col">
                    <div class="bg-slate-900 text-white p-4 flex justify-between items-center shadow-sm">
                        <div class="flex items-center gap-2"><span class="text-xl">📝</span><span class="font-bold">TaskMaster</span></div>
                        <div class="text-sm text-slate-300 flex gap-4"><span>Home</span><span>Active</span></div>
                    </div>
                    <div class="p-8 flex justify-center">
                        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                            <h2 class="text-2xl font-bold text-slate-800 mb-4">My Tasks</h2>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100"><div class="w-5 h-5 rounded border-2 border-slate-300"></div><span class="text-slate-600">Buy groceries</span></div>
                                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100"><div class="w-5 h-5 rounded border-2 border-slate-300"></div><span class="text-slate-600">Walk the dog</span></div>
                            </div>
                            <button class="mt-4 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add New Task</button>
                        </div>
                    </div>
                </div>
                <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity">375 x 667</div>
            </div>
        </div>
        <div class="flex-1 flex flex-col bg-[var(--bg-panel)] overflow-hidden">
            <div class="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center">
                <div class="flex items-center gap-2"><div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span class="font-semibold text-sm">AI Mentor</span></div>
                <button class="text-[var(--text-secondary)] hover:text-white"><span class="material-symbols-outlined text-lg">more_horiz</span></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-600/30 shrink-0"><span class="material-symbols-outlined text-sm">smart_toy</span></div>
                    <div class="flex flex-col gap-1">
                        <div class="text-xs font-semibold text-[var(--text-secondary)]">CodeLearn AI</div>
                        <div class="bg-[var(--bg-editor)] border border-[var(--border-color)] rounded-lg rounded-tl-none p-3 text-sm text-gray-300 leading-relaxed shadow-sm">I see you're working on the Header component. Remember to use <code class="bg-black/30 px-1 rounded text-orange-300 text-xs">flex</code> and <code class="bg-black/30 px-1 rounded text-orange-300 text-xs">justify-between</code> to space out the logo and navigation links properly.</div>
                    </div>
                </div>
                <div class="flex gap-3 flex-row-reverse">
                    <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><span class="text-xs font-bold text-white">ME</span></div>
                    <div class="flex flex-col gap-1 items-end">
                        <div class="bg-[var(--primary-color)] text-white rounded-lg rounded-tr-none p-3 text-sm leading-relaxed shadow-sm">How do I make the links change color on hover?</div>
                    </div>
                </div>
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-600/30 shrink-0"><span class="material-symbols-outlined text-sm">smart_toy</span></div>
                    <div class="flex items-center gap-1 mt-2">
                        <div class="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                        <div class="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce delay-100"></div>
                        <div class="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-[var(--border-color)] bg-[var(--bg-panel)]">
                <div class="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                    <button class="whitespace-nowrap px-3 py-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition-colors">Explain code</button>
                    <button class="whitespace-nowrap px-3 py-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition-colors">Find bugs</button>
                    <button class="whitespace-nowrap px-3 py-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition-colors">Optimize</button>
                </div>
                <div class="relative">
                    <input class="w-full bg-[var(--bg-dark)] text-sm text-white rounded-lg pl-4 pr-10 py-3 border border-[var(--border-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] placeholder-gray-500" placeholder="Ask AI Mentor..." type="text"/>
                    <button class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white rounded-md transition-colors"><span class="material-symbols-outlined text-lg">send</span></button>
                </div>
            </div>
        </div>
    </aside>
</main>
<footer class="h-6 bg-[var(--primary-color)] text-white text-[10px] flex items-center justify-between px-3 select-none">
    <div class="flex items-center gap-4">
        <div class="flex items-center gap-1 cursor-pointer hover:opacity-80"><span class="material-symbols-outlined text-[14px]">account_tree</span><span>main*</span></div>
        <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-red-300">error</span><span>0</span><span class="material-symbols-outlined text-[14px] text-yellow-300 ml-1">warning</span><span>0</span></div>
    </div>
    <div class="flex items-center gap-4">
        <span class="cursor-pointer hover:opacity-80">Ln 14, Col 32</span><span class="cursor-pointer hover:opacity-80">UTF-8</span><span class="cursor-pointer hover:opacity-80">Javascript React</span>
        <div class="flex items-center gap-1 cursor-pointer hover:opacity-80"><span class="material-symbols-outlined text-[14px]">wifi</span><span>Connected</span></div>
    </div>
</footer>
</body></html>
```

### 4. Template Library
**Purpose:** Browseable library of reusable snippets, configurations, and boilerplates for Developer Mode.

html```
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Library - CodeLearn</title>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<style type="text/tailwindcss">
    :root {
        --primary: #6366F1;
        --primary-dark: #4F46E5;
        --secondary: #10B981;
        --background: #0F172A;
        --surface: #1E293B;
        --surface-hover: #334155;
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --border: #334155;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--background);
        color: var(--text-primary);
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .code-preview {
        background-color: #0d1117;
        background-image: radial-gradient(#1f2937 1px, transparent 1px);
        background-size: 20px 20px;
    }
</style>
</head>
<body class="h-screen flex flex-col overflow-hidden">
<header class="h-16 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 shrink-0 z-20">
    <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-[var(--primary)] font-bold text-xl tracking-tight"><span class="material-symbols-outlined text-3xl">terminal</span>CodeLearn</div>
        <div class="h-6 w-px bg-[var(--border)] mx-2"></div>
        <nav class="flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <a class="hover:text-white transition-colors" href="#">Learning</a>
            <a class="text-white bg-[var(--surface-hover)] px-3 py-1.5 rounded-md transition-colors" href="#">Developer</a>
            <a class="hover:text-white transition-colors" href="#">Projects</a>
        </nav>
    </div>
    <div class="flex items-center gap-4">
        <div class="relative group">
            <span class="absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]"><span class="material-symbols-outlined text-[20px]">search</span></span>
            <input class="bg-[var(--background)] border border-[var(--border)] text-sm rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-white placeholder-slate-500 transition-all" placeholder="Search templates..." type="text"/>
            <div class="absolute right-2 top-2 text-[10px] text-[var(--text-secondary)] border border-[var(--border)] rounded px-1.5 py-0.5">⌘K</div>
        </div>
        <button class="relative p-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-full transition-colors"><span class="material-symbols-outlined">notifications</span><span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--surface)]"></span></button>
        <div class="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
            <div class="text-right hidden md:block">
                <div class="text-sm font-medium text-white">Alex Chen</div>
                <div class="text-xs text-[var(--text-secondary)]">Free Plan</div>
            </div>
            <img alt="Profile" class="w-9 h-9 rounded-full border border-[var(--border)]" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBI2vYElsDBdkr8i19eQHqhZuQ0Cjy6PoXS-4Yt2ReKG5fk9qdEQK4efUPmq57SoYP8YYjVO6xCrP75i_28C2OPjXGIM7Z4bqSJqaKEJ_Jr42crbUDRaknoEsFyMRltpEQF1BwJDBU22IhIbJMz2s6JIi4TUX5LCtcxEiA4j8uvPcmNXGopReGjgRsobu9BBconhOMSx3MIqop4niyOcL-B8k44AP_BwuORWpBVHN53-V_UFTFJORHot4BhWi62VX79PvjItd_00WI](https://lh3.googleusercontent.com/aida-public/AB6AXuBI2vYElsDBdkr8i19eQHqhZuQ0Cjy6PoXS-4Yt2ReKG5fk9qdEQK4efUPmq57SoYP8YYjVO6xCrP75i_28C2OPjXGIM7Z4bqSJqaKEJ_Jr42crbUDRaknoEsFyMRltpEQF1BwJDBU22IhIbJMz2s6JIi4TUX5LCtcxEiA4j8uvPcmNXGopReGjgRsobu9BBconhOMSx3MIqop4niyOcL-B8k44AP_BwuORWpBVHN53-V_UFTFJORHot4BhWi62VX79PvjItd_00WI)"/>
        </div>
    </div>
</header>
<div class="flex flex-1 overflow-hidden">
    <aside class="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0 hidden lg:flex">
        <div class="p-4">
            <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-6">
                <div class="flex items-center gap-2 text-[var(--primary)] text-sm font-semibold mb-1"><span class="material-symbols-outlined text-lg">bolt</span>Developer Mode</div>
                <p class="text-xs text-[var(--text-secondary)] leading-relaxed">Access AI-powered templates to accelerate your development workflow.</p>
            </div>
            <div class="space-y-1">
                <div class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2">Library</div>
                <a class="flex items-center gap-3 px-3 py-2 text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-md" href="#"><span class="material-symbols-outlined text-[20px]">grid_view</span>All Templates</a>
                <a class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">favorite</span>Saved</a>
                <a class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">history</span>Recent Integrations</a>
            </div>
            <div class="mt-8 space-y-1">
                <div class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2">Categories</div>
                <a class="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors group" href="#">
                    <span class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px]">lock</span>Authentication</span><span class="text-xs bg-[var(--background)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] group-hover:text-white">12</span>
                </a>
                <a class="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors group" href="#">
                    <span class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px]">database</span>Data Fetching</span><span class="text-xs bg-[var(--background)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] group-hover:text-white">8</span>
                </a>
                <a class="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors group" href="#">
                    <span class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px]">web</span>UI Components</span><span class="text-xs bg-[var(--background)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] group-hover:text-white">24</span>
                </a>
                <a class="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-colors group" href="#">
                    <span class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px]">api</span>API Routes</span><span class="text-xs bg-[var(--background)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] group-hover:text-white">15</span>
                </a>
            </div>
        </div>
        <div class="mt-auto p-4 border-t border-[var(--border)]">
            <button class="w-full flex items-center justify-center gap-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] text-sm font-medium text-white py-2 rounded-lg transition-colors border border-[var(--border)]"><span class="material-symbols-outlined text-lg">chat</span>Ask AI Mentor</button>
        </div>
    </aside>
    <main class="flex-1 flex flex-col min-w-0 bg-[var(--background)] relative">
        <div class="sticky top-0 z-10 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-[var(--border)] px-8 py-3 flex items-center justify-between shadow-lg">
            <div class="flex items-center gap-4 w-full max-w-2xl">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 shrink-0"><span class="material-symbols-outlined text-lg">data_usage</span></div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1"><span class="text-xs font-medium text-amber-500">Free Plan Usage Limit</span><span class="text-xs font-bold text-white">3/5 Integrations</span></div>
                    <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div class="bg-amber-500 h-full rounded-full" style="width: 60%"></div></div>
                </div>
            </div>
            <a class="hidden sm:flex items-center gap-1 text-sm font-medium text-white hover:text-[var(--primary)] whitespace-nowrap ml-4 transition-colors" href="#">Upgrade to Pro <span class="material-symbols-outlined text-lg">arrow_forward</span></a>
        </div>
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-white mb-2">Template Library</h1>
                    <p class="text-[var(--text-secondary)]">Browse reusable components extracted from top open-source projects.</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
                        <button class="p-1.5 rounded bg-[var(--surface-hover)] text-white shadow-sm"><span class="material-symbols-outlined text-xl">grid_view</span></button>
                        <button class="p-1.5 rounded text-[var(--text-secondary)] hover:text-white"><span class="material-symbols-outlined text-xl">view_list</span></button>
                    </div>
                    <select class="bg-[var(--surface)] border border-[var(--border)] text-sm text-white rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer">
                        <option>Most Popular</option>
                        <option>Highest Rated</option>
                        <option>Newest</option>
                    </select>
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-8">
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">All Tech</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors"><img alt="React" class="w-4 h-4" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBoNg0gDS6tRDO8c4Cm8MLyccZ0Ff3ma4SIkhC4ckAxZ03KBvdJ0WTdQXbvSpD_mDoDZ1ERjIgaXXEXs31efZCMqaTQGHmnNgOjtEEsUwza_0KsUm0x21fet4X_qvgsl1AtEaRiyvPXP-KroRBB7NfP1hlT-ubdcX9vE7TxjYEYalLhjoFoDhACFqrfn-2AucJSRT1BOHJic5txHu-6FP3jZO7LnqZtRJ9FywnrKETxIUD-wJGSdOC4Urhfcxdh8apypqYIEOJX_MU](https://lh3.googleusercontent.com/aida-public/AB6AXuBoNg0gDS6tRDO8c4Cm8MLyccZ0Ff3ma4SIkhC4ckAxZ03KBvdJ0WTdQXbvSpD_mDoDZ1ERjIgaXXEXs31efZCMqaTQGHmnNgOjtEEsUwza_0KsUm0x21fet4X_qvgsl1AtEaRiyvPXP-KroRBB7NfP1hlT-ubdcX9vE7TxjYEYalLhjoFoDhACFqrfn-2AucJSRT1BOHJic5txHu-6FP3jZO7LnqZtRJ9FywnrKETxIUD-wJGSdOC4Urhfcxdh8apypqYIEOJX_MU)"/>React</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors"><img alt="Next.js" class="w-4 h-4 invert" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuDLHFJSovXV23az9i5aCfd3_1Pw35mx04OeEtasJpNaheL2aAViHfHWvgZMbWoPWQFS3VH2gkna5CUrJH_IfKNXLPqkb0sZgKO3hXnhnXzia8YekxZy1JWde_5jjtVStAqb9tDRQLUVo-7eYk3qZv55MGM507qnGiYXEVetLCUW1ov7j6BHg7PWrbr4UMmA29T7PfCw9BPooHTK77gOOrBJL0nR1swposSHJz87p1FJNm1Aej4gfQsj6WJiqPkBPJ9aVPY2MpV7p1s](https://lh3.googleusercontent.com/aida-public/AB6AXuDLHFJSovXV23az9i5aCfd3_1Pw35mx04OeEtasJpNaheL2aAViHfHWvgZMbWoPWQFS3VH2gkna5CUrJH_IfKNXLPqkb0sZgKO3hXnhnXzia8YekxZy1JWde_5jjtVStAqb9tDRQLUVo-7eYk3qZv55MGM507qnGiYXEVetLCUW1ov7j6BHg7PWrbr4UMmA29T7PfCw9BPooHTK77gOOrBJL0nR1swposSHJz87p1FJNm1Aej4gfQsj6WJiqPkBPJ9aVPY2MpV7p1s)"/>Next.js</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors"><img alt="Node.js" class="w-4 h-4" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuDY42PXQhIkRn6W0s14ToABp-ZGk8PY2aIast9LOnkdPPiX0UXG7RX9YmgD_djG4RgciF13i8USO5bdHaBWyR7sup3sbpTH73tjRwZrkub4IIn1QcDoL_c-TtRUz_vfW44ADZdnBxuCCoJkRs_2xf59b80YAowuvuGHogIvAz7eCPn1n1V9dEtv4WTJkSHtt7a-rIJdbyieYyBg3aDEidXCjmKd-lg708HUM1F7paUG7f8IVXqozs07eIY4o1E8GtVzsFcYdnfNA_0](https://lh3.googleusercontent.com/aida-public/AB6AXuDY42PXQhIkRn6W0s14ToABp-ZGk8PY2aIast9LOnkdPPiX0UXG7RX9YmgD_djG4RgciF13i8USO5bdHaBWyR7sup3sbpTH73tjRwZrkub4IIn1QcDoL_c-TtRUz_vfW44ADZdnBxuCCoJkRs_2xf59b80YAowuvuGHogIvAz7eCPn1n1V9dEtv4WTJkSHtt7a-rIJdbyieYyBg3aDEidXCjmKd-lg708HUM1F7paUG7f8IVXqozs07eIY4o1E8GtVzsFcYdnfNA_0)"/>Node.js</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors"><img alt="Vue" class="w-4 h-4" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBWF_Krc-WhxLFYFCC8CWNKc_dv_POE2HHM4HmDhtyUAo61B16kArJ-IEcpCbGvGQ8LfJcjNZMb2i3okqoJIxNgAnOK61nqEsv8O9rX65Sn1T_jJNIqjpPnpHrpUA8T67oO0bArkiImstc4Ejt8qWXyr-HP36u_tRjxak4rL_6wVvlxi8tH871S9_O4i-XDYE_C78w2D0KL3GBKau9vXXipmjp1ruthTvi6P3EM-5uZfDBcAaE57NpSS28NL67e--ys6OdwNg5zbXs](https://lh3.googleusercontent.com/aida-public/AB6AXuBWF_Krc-WhxLFYFCC8CWNKc_dv_POE2HHM4HmDhtyUAo61B16kArJ-IEcpCbGvGQ8LfJcjNZMb2i3okqoJIxNgAnOK61nqEsv8O9rX65Sn1T_jJNIqjpPnpHrpUA8T67oO0bArkiImstc4Ejt8qWXyr-HP36u_tRjxak4rL_6wVvlxi8tH871S9_O4i-XDYE_C78w2D0KL3GBKau9vXXipmjp1ruthTvi6P3EM-5uZfDBcAaE57NpSS28NL67e--ys6OdwNg5zbXs)"/>Vue</button>
                <div class="w-px bg-[var(--border)] mx-2 h-6 self-center"></div>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors">Auth</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors">UI</button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)] text-sm font-medium transition-colors">Database</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                <div class="group bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full">
                    <div class="h-40 relative code-preview border-b border-[var(--border)] p-4 overflow-hidden group-hover:bg-slate-900 transition-colors">
                        <div class="absolute top-3 right-3 z-10"><span class="bg-black/50 backdrop-blur text-[10px] font-mono text-white px-2 py-1 rounded border border-white/10">Next.js 14</span></div>
                        <pre class="text-[10px] text-slate-400 font-mono leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">import { auth } from "@/auth"
export default async function Page() {
  const session = await auth()
  if (!session) return redirect("/login")
  return (
    <div>Protected Content</div>
  )
}</pre>
                        <div class="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-80"></div>
                        <div class="absolute bottom-3 left-3 flex gap-2">
                            <img alt="Next.js" class="w-5 h-5 invert drop-shadow-md" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2oPaNyEa7Xg8nvYOxQDxca5d-bSFxEkZSFh93-1NmFXUdppxACpWoBECTDbncBRdSozkt-NlkNfsQJ-XS1pgNXEQnWaCPm35w7PB_s7sMz24AvG9GyIywHhle-Xlb3_J8Z3rPcx-gCUWweSKXM7LTOdXpDa9riCc67r28Ec3k4EvNGxnwkEIu9iBiImM8fEm8dMqVtiqaXV6-oDDJkpQfJeoXkE9j6I_F9njpFUODCUHKR7f2E7L_HGwQUBM4e6hEZnZ_nNG3s](https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2oPaNyEa7Xg8nvYOxQDxca5d-bSFxEkZSFh93-1NmFXUdppxACpWoBECTDbncBRdSozkt-NlkNfsQJ-XS1pgNXEQnWaCPm35w7PB_s7sMz24AvG9GyIywHhle-Xlb3_J8Z3rPcx-gCUWweSKXM7LTOdXpDa9riCc67r28Ec3k4EvNGxnwkEIu9iBiImM8fEm8dMqVtiqaXV6-oDDJkpQfJeoXkE9j6I_F9njpFUODCUHKR7f2E7L_HGwQUBM4e6hEZnZ_nNG3s)"/>
                            <img alt="TS" class="w-5 h-5 drop-shadow-md" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuBSZmm-g-MIRDMhD66p0QAKAztv_XTqqZCDS4dZ6H4rmIsHerVBbS-CPdP5vp6IG1aYOTrV2fbrowxUK7Zszc3ALgt0CZVPIN_MndNYAeHfGnZrvMmsJdS9g8V8jhdi40jlAl7d6E1CoFZXYKaKRZbSEXDfrxugqMHCHHJEB27vYkjvQGUFzadBKVkNKQcfgUlZi6FUiLNeLTLiBgNJSb4htZI_1hUfghH2p1af_OnmXlbqZkQBGCr01SsjGrQum-HLmHFMnRZ6zDY](https://lh3.googleusercontent.com/aida-public/AB6AXuBSZmm-g-MIRDMhD66p0QAKAztv_XTqqZCDS4dZ6H4rmIsHerVBbS-CPdP5vp6IG1aYOTrV2fbrowxUK7Zszc3ALgt0CZVPIN_MndNYAeHfGnZrvMmsJdS9g8V8jhdi40jlAl7d6E1CoFZXYKaKRZbSEXDfrxugqMHCHHJEB27vYkjvQGUFzadBKVkNKQcfgUlZi6FUiLNeLTLiBgNJSb4htZI_1hUfghH2p1af_OnmXlbqZkQBGCr01SsjGrQum-HLmHFMnRZ6zDY)"/>
                        </div>
                    </div>
                    <div class="p-5 flex flex-col flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-white group-hover:text-[var(--primary)] transition-colors">NextAuth.js Config</h3>
                            <div class="flex items-center gap-1 text-amber-400 text-xs font-bold"><span class="material-symbols-outlined text-[16px] fill-current">star</span>4.9</div>
                        </div>
                        <p class="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">Complete authentication setup with NextAuth v5, Google Provider, and middleware protection.</p>
                        <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-700">#auth</span>
                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-700">#security</span>
                        </div>
                        <div class="flex gap-3">
                            <button class="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"><span class="material-symbols-outlined text-[18px]">add_circle</span>Integrate</button>
                            <button class="p-2 text-[var(--text-secondary)] hover:text-white bg-[var(--surface-hover)] hover:bg-slate-600 rounded-lg transition-colors border border-[var(--border)]"><span class="material-symbols-outlined text-[20px]">code</span></button>
                        </div>
                    </div>
                </div>
                </div>
        </div>
    </main>
</div>
</body></html>
```

### 5. User Portfolio Profile
**Purpose:** Public-facing or internal display of user achievements, tech stack, and current projects.

html```
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>User Portfolio Profile - CodeLearn</title>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<script>
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    mono: ['JetBrains Mono', 'monospace'],
                },
                colors: {
                    indigo: {
                        50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1',
                        600: '#4f46e5', 700: '#4338ca', 900: '#312e81',
                    },
                    slate: { 800: '#1e293b', 900: '#0f172a', }
                }
            }
        }
    }
</script>
<style type="text/tailwindcss">
    @layer utilities {
        .glass-panel { @apply bg-white border border-slate-200 shadow-sm; }
        .dark .glass-panel { @apply bg-slate-800 border-slate-700; }
    }
</style>
</head>
<body class="bg-gray-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-700">
<nav class="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center gap-8">
                <div class="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                    <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">C</div>
                    <span class="font-bold text-xl tracking-tight text-slate-900">CodeLearn</span>
                </div>
                <div class="hidden md:flex space-x-1">
                    <a class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors" href="#">Dashboard</a>
                    <a class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors" href="#">Learning Paths</a>
                    <a class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors" href="#">Templates</a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="relative hidden sm:block">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="material-symbols-outlined text-gray-400 text-[20px]">search</span></span>
                    <input class="block w-64 pl-10 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="Search projects or developers..." type="text"/>
                </div>
                <button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none relative">
                    <span class="material-symbols-outlined">notifications</span><span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                <div class="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden cursor-pointer">
                    <img alt="User avatar" class="h-full w-full object-cover" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuCm7nFIuzdEyGM2a8vPI8O6AoUNS8spnGrn_XKduEv6Kin5z6KFZ5H6xyJb0afrKQc-T9h5n5nvxiEI9I1eDC2njzRtF4zMDhLqTwgAZAumnGByCA0QuHcqSEMkkk8gTqof9aUBkxER2EymXQbSQ2aMtEGWwu8YQJni0lC6IrW3xNvpnGGJyyUq6cUDJdeDrLyW_hoZ83EOYIUGQM9fYXL-RXz50TdL7YPsYA02mbMA60UEWH1kl8ytVof3hX5vJFuVJlvo4z8DCJc](https://lh3.googleusercontent.com/aida-public/AB6AXuCm7nFIuzdEyGM2a8vPI8O6AoUNS8spnGrn_XKduEv6Kin5z6KFZ5H6xyJb0afrKQc-T9h5n5nvxiEI9I1eDC2njzRtF4zMDhLqTwgAZAumnGByCA0QuHcqSEMkkk8gTqof9aUBkxER2EymXQbSQ2aMtEGWwu8YQJni0lC6IrW3xNvpnGGJyyUq6cUDJdeDrLyW_hoZ83EOYIUGQM9fYXL-RXz50TdL7YPsYA02mbMA60UEWH1kl8ytVof3hX5vJFuVJlvo4z8DCJc)"/>
                </div>
            </div>
        </div>
    </div>
</nav>
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="relative mb-8 group">
        <div class="h-48 w-full rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden relative">
            <div class="absolute inset-0 bg-[url('[https://www.transparenttextures.com/patterns/carbon-fibre.png](https://www.transparenttextures.com/patterns/carbon-fibre.png)')] opacity-20"></div>
            <div class="absolute top-4 right-4 flex gap-2">
                <button class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
                    <span class="material-symbols-outlined text-[18px]">share</span> Share Profile
                </button>
                <div class="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 gap-2">
                    <span class="text-white text-sm font-medium">Public View</span>
                    <button class="w-8 h-4 bg-green-400 rounded-full relative transition-colors cursor-pointer"><span class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></span></button>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 px-6 pb-6 pt-0 relative">
            <div class="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                <div class="relative">
                    <div class="h-32 w-32 rounded-full ring-4 ring-white bg-white overflow-hidden shadow-md">
                        <img alt="Alex Morgan" class="h-full w-full object-cover" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuCMpmTRvUGs31kiNN3rpdEbG2mYwfE2b0LjXRiw0itOgmsgJ__Yp0xwEn0Qz7O-Is-6R4W3yKmZnT6WbTE4M7-GburwtWCHDzdWnHnbmrKvny_tnCvSUkKlfNpe1QOgfi7Co_WlXX--Msg35mUgGbNviMdjvsE14vNvndXccq5jCcwu6WnQud8K0obEp-Uvyz22Hjvni_qRdL1ALtmUqQ1Z5w8xV2hL2oL3gYpcWasBxRWAl77kjoRnjf4EUOAGdvl6pB-W2uCeBko](https://lh3.googleusercontent.com/aida-public/AB6AXuCMpmTRvUGs31kiNN3rpdEbG2mYwfE2b0LjXRiw0itOgmsgJ__Yp0xwEn0Qz7O-Is-6R4W3yKmZnT6WbTE4M7-GburwtWCHDzdWnHnbmrKvny_tnCvSUkKlfNpe1QOgfi7Co_WlXX--Msg35mUgGbNviMdjvsE14vNvndXccq5jCcwu6WnQud8K0obEp-Uvyz22Hjvni_qRdL1ALtmUqQ1Z5w8xV2hL2oL3gYpcWasBxRWAl77kjoRnjf4EUOAGdvl6pB-W2uCeBko)"/>
                    </div>
                    <div class="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center" title="Online"></div>
                </div>
                <div class="flex-1 pt-12 md:pt-0">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">Alex Morgan <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">PRO</span></h1>
                            <p class="text-gray-500 font-medium text-sm mt-1">Full Stack Developer • React Enthusiast • AI Integrator</p>
                            <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px] text-gray-400">location_on</span> San Francisco, CA</span>
                                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px] text-gray-400">work</span> Open to work</span>
                                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px] text-gray-400">calendar_month</span> Joined March 2023</span>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Edit Profile</button>
                        </div>
                    </div>
                    <div class="mt-4 max-w-3xl">
                        <p class="text-gray-600 leading-relaxed text-sm">Passionate about building accessible, pixel-perfect user interfaces that blend art with code. Currently deep-diving into AI-assisted development workflows. I turn coffee into clean, reusable components.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600">bar_chart</span> Overview</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div class="text-indigo-600 font-bold text-2xl">12</div><div class="text-indigo-800 text-xs font-medium uppercase tracking-wide mt-1">Projects</div>
                    </div>
                    <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <div class="text-emerald-600 font-bold text-2xl">142h</div><div class="text-emerald-800 text-xs font-medium uppercase tracking-wide mt-1">Learning</div>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div class="text-amber-600 font-bold text-2xl">🔥 14</div><div class="text-amber-800 text-xs font-medium uppercase tracking-wide mt-1">Day Streak</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div class="text-purple-600 font-bold text-2xl">8</div><div class="text-purple-800 text-xs font-medium uppercase tracking-wide mt-1">Certificates</div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600">code</span> Tech Stack</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">React & Next.js</span><span class="text-gray-500">Advanced</span></div>
                        <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: 90%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">TypeScript</span><span class="text-gray-500">Intermediate</span></div>
                        <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: 75%"></div></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="lg:col-span-2 space-y-8">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-900">Project Showcase</h2>
                    <a class="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1" href="#">View all projects <span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="h-40 bg-gray-200 relative overflow-hidden">
                            <img alt="E-commerce Dashboard" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="[https://lh3.googleusercontent.com/aida-public/AB6AXuAUfa3u3NdY-O8GwQUJxIq6IpO1kOIqNYAGh81p_hGkLqcO4N7NOm6te-78EDQunEoB65ZW6AqZV3uPcOoONCcn8_Z5NI9JOQbLD6NkAhgOjh0GCtdLHeynV8Szjio6msDvNcwf8BNAbJw8BW5r369micrJKLkiY8L9r3wOjwoofnvU6l3cYS5mBmkFoGRXUf_KqO8zcDR-uLKpEzGk0kLDLB6LMbFNPDmfaQ2y45FTI_PcLjKcUefIUDLDdVrxF1aJ5qSg7C6K0R0](https://lh3.googleusercontent.com/aida-public/AB6AXuAUfa3u3NdY-O8GwQUJxIq6IpO1kOIqNYAGh81p_hGkLqcO4N7NOm6te-78EDQunEoB65ZW6AqZV3uPcOoONCcn8_Z5NI9JOQbLD6NkAhgOjh0GCtdLHeynV8Szjio6msDvNcwf8BNAbJw8BW5r369micrJKLkiY8L9r3wOjwoofnvU6l3cYS5mBmkFoGRXUf_KqO8zcDR-uLKpEzGk0kLDLB6LMbFNPDmfaQ2y45FTI_PcLjKcUefIUDLDdVrxF1aJ5qSg7C6K0R0)"/>
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <a class="bg-white text-gray-900 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors" href="#">View Live</a>
                                <a class="bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors" href="#">View Code</a>
                            </div>
                        </div>
                        <div class="p-5">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">E-commerce Dashboard</h3>
                                <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">v2.0</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-4 line-clamp-2">A full-featured analytics dashboard for online stores featuring real-time data visualization.</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">React</span>
                                <span class="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-1 rounded">Tailwind</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div class="relative pl-4 border-l-2 border-gray-100 space-y-8">
                    <div class="relative">
                        <span class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                            <div><p class="text-sm font-medium text-gray-900">Completed Project: <span class="text-indigo-600 font-semibold">E-commerce Dashboard</span></p></div>
                            <span class="text-xs text-gray-400 whitespace-nowrap">2 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
</body></html>
```

### 6. Login Page
**Purpose:** Authentication screen for returning users (Dark Theme styled specifically).

html```
<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CodeLearn - Login</title>
<link href="[https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<script id="tailwind-config">
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: { "primary": "#5b13ec", "background-light": "#f6f6f8", "background-dark": "#161022", },
                fontFamily: { "display": ["Space Grotesk", "sans-serif"], "body": ["Noto Sans", "sans-serif"], },
                borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
        },
    }
</script>
</head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
<div class="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">
    <div class="relative hidden lg:flex w-full lg:w-1/2 bg-slate-900 items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" style="background-image: url('[https://lh3.googleusercontent.com/aida-public/AB6AXuAFlFZIqdKj9lEK-2opyIEUJu5OFDYVnlvs90oTIi1x2TbzKVn_x-qciFzyNJFTlkY76PcRK23qbhq8suZlSQwZDoosBOULEEOAW3kAkvTQellfeDM7g8SJXlBLPxzhAN8sG20b0NeLjj7SyhinVuPS6k6vcOmVruiM4ZLEFd0K3ArUDpsTVjAW30T-9DbuZkh_izpcE1igKLOI6Mlfot_JD7cTpRREgDpVF630OfxZrVGL2gWfHgMSuUDXRSazBMjqOIirvUSMFjc](https://lh3.googleusercontent.com/aida-public/AB6AXuAFlFZIqdKj9lEK-2opyIEUJu5OFDYVnlvs90oTIi1x2TbzKVn_x-qciFzyNJFTlkY76PcRK23qbhq8suZlSQwZDoosBOULEEOAW3kAkvTQellfeDM7g8SJXlBLPxzhAN8sG20b0NeLjj7SyhinVuPS6k6vcOmVruiM4ZLEFd0K3ArUDpsTVjAW30T-9DbuZkh_izpcE1igKLOI6Mlfot_JD7cTpRREgDpVF630OfxZrVGL2gWfHgMSuUDXRSazBMjqOIirvUSMFjc)');"></div>
        <div class="absolute inset-0 z-10 bg-gradient-to-tr from-background-dark via-primary/40 to-transparent mix-blend-multiply"></div>
        <div class="relative z-20 p-12 text-center">
            <div class="mb-6 flex justify-center"><span class="material-symbols-outlined text-white text-6xl">terminal</span></div>
            <h2 class="text-4xl font-bold text-white mb-4 tracking-tight">Master Coding with AI</h2>
            <p class="text-slate-200 text-lg max-w-md mx-auto leading-relaxed">Build real projects, accelerate your learning curve, and join a community of future developers.</p>
        </div>
    </div>
    <div class="flex w-full lg:w-1/2 flex-col justify-center bg-background-light dark:bg-background-dark p-6 sm:p-12 xl:p-24 relative">
        <div class="lg:hidden flex items-center gap-2 mb-8"><span class="material-symbols-outlined text-primary text-3xl">terminal</span><span class="text-xl font-bold tracking-tight">CodeLearn</span></div>
        <div class="w-full max-w-md mx-auto">
            <div class="mb-10 text-left">
                <h1 class="text-3xl md:text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">Welcome Back</h1>
                <p class="text-slate-500 dark:text-slate-400 text-base">Log in to continue your journey with CodeLearn.</p>
            </div>
            <form class="flex flex-col gap-5">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-200" for="email">Email Address</label>
                    <div class="relative flex items-center">
                        <span class="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined">mail</span>
                        <input class="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white pl-11 pr-4 py-3 text-base focus:border-primary focus:ring-primary dark:focus:ring-primary/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" id="email" placeholder="you@example.com" required="" type="email"/>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <label class="text-sm font-medium text-slate-700 dark:text-slate-200" for="password">Password</label>
                    </div>
                    <div class="relative flex items-center">
                        <span class="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined">lock</span>
                        <input class="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white pl-11 pr-11 py-3 text-base focus:border-primary focus:ring-primary dark:focus:ring-primary/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" id="password" placeholder="Enter your password" required="" type="password"/>
                    </div>
                </div>
                <div class="flex justify-end"><a class="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a></div>
                <button class="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-lg shadow-primary/25" type="submit">Log In</button>
            </form>
            <div class="relative my-8">
                <div aria-hidden="true" class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                <div class="relative flex justify-center text-sm"><span class="bg-background-light dark:bg-background-dark px-2 text-slate-500 dark:text-slate-400">Or continue with</span></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <button class="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm">Google</button>
                <button class="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm">GitHub</button>
            </div>
            <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">Don't have an account? <a class="font-medium text-primary hover:text-primary/80 transition-colors" href="#">Sign up for free</a></p>
        </div>
    </div>
</div>
</body></html>
```

### 7. Registration Page
**Purpose:** Account creation screen for new users (Matches the Login theme).

html```
<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CodeLearn - Create Account</title>
<script src="[https://cdn.tailwindcss.com?plugins=forms,container-queries](https://cdn.tailwindcss.com?plugins=forms,container-queries)"></script>
<link href="[https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap)" rel="stylesheet"/>
<link href="[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)" rel="stylesheet"/>
<script>
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "primary": "#5b13ec", "primary-hover": "#4a0bc2",
                    "background-light": "#f6f6f8", "background-dark": "#171122",
                    "surface-dark": "#2f2348", "surface-input": "#221933",
                    "border-color": "#443267", "text-secondary": "#a492c9",
                },
                fontFamily: { "display": ["Space Grotesk", "sans-serif"] },
                borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
        },
    }
</script>
<style>
    body { font-family: "Space Grotesk", sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-white">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-color px-6 py-4 md:px-10">
    <div class="flex items-center gap-4 text-slate-900 dark:text-white">
        <div class="size-8 text-primary"><span class="material-symbols-outlined text-3xl">terminal</span></div>
        <h2 class="text-xl font-bold leading-tight tracking-[-0.015em]">CodeLearn</h2>
    </div>
    <div class="flex items-center gap-4">
        <span class="hidden sm:inline text-sm font-medium text-slate-500 dark:text-text-secondary">Already have an account?</span>
        <button class="flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 dark:border-border-color hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-slate-900 dark:text-white text-sm font-bold">Log In</button>
    </div>
</header>
<main class="flex-1 flex flex-col md:flex-row h-full">
    <div class="hidden md:flex md:w-1/2 lg:w-5/12 relative flex-col justify-between p-10 lg:p-16 overflow-hidden bg-surface-dark/50">
        <div class="absolute inset-0 z-0">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-background-dark to-background-dark"></div>
        </div>
        <div class="relative z-10 flex flex-col h-full justify-center">
            <div class="mb-10">
                <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-6">AI-Powered Learning</span>
                <h1 class="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">Build real projects,<br/> faster than ever.</h1>
                <p class="text-lg text-text-secondary max-w-md">Join thousands of developers using CodeLearn to master new skills through AI-guided projects and smart templates.</p>
            </div>
        </div>
    </div>
    <div class="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-background-light dark:bg-background-dark">
        <div class="w-full max-w-md space-y-8">
            <div class="text-center md:text-left">
                <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h2>
                <p class="mt-2 text-sm text-slate-600 dark:text-text-secondary">Start your journey with a 14-day free trial. No credit card required.</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <button class="flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-border-color bg-white dark:bg-surface-input px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-surface-dark">Google</button>
                <button class="flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-border-color bg-white dark:bg-surface-input px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-surface-dark">GitHub</button>
            </div>
            <div class="relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-300 dark:border-border-color"></div></div>
                <div class="relative flex justify-center"><span class="bg-background-light dark:bg-background-dark px-2 text-xs uppercase text-slate-500 dark:text-text-secondary">Or continue with email</span></div>
            </div>
            <form action="#" class="space-y-6" method="POST">
                <div>
                    <label class="block text-sm font-medium leading-6 text-slate-900 dark:text-white" for="name">Full Name</label>
                    <div class="mt-2 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3"><span class="material-symbols-outlined text-text-secondary text-[20px]">person</span></div>
                        <input class="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-border-color focus:ring-2 focus:ring-primary bg-white dark:bg-surface-input sm:text-sm" id="name" name="name" placeholder="Jane Doe" type="text"/>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium leading-6 text-slate-900 dark:text-white" for="email">Email Address</label>
                    <div class="mt-2 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3"><span class="material-symbols-outlined text-text-secondary text-[20px]">mail</span></div>
                        <input class="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-border-color focus:ring-2 focus:ring-primary bg-white dark:bg-surface-input sm:text-sm" id="email" name="email" placeholder="jane@example.com" type="email"/>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium leading-6 text-slate-900 dark:text-white" for="password">Password</label>
                    <div class="mt-2 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3"><span class="material-symbols-outlined text-text-secondary text-[20px]">lock</span></div>
                        <input class="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-border-color focus:ring-2 focus:ring-primary bg-white dark:bg-surface-input sm:text-sm" id="password" name="password" placeholder="Create a strong password" type="password"/>
                    </div>
                    <p class="mt-2 text-xs text-text-secondary">Must be at least 8 characters long.</p>
                </div>
                <div class="flex items-start">
                    <div class="flex h-6 items-center"><input class="h-4 w-4 rounded border-slate-300 dark:border-border-color bg-white dark:bg-surface-input text-primary focus:ring-primary" id="terms" type="checkbox"/></div>
                    <div class="ml-3 text-sm leading-6"><label class="font-medium text-slate-700 dark:text-slate-300" for="terms">I agree to the <a class="font-semibold text-primary hover:text-primary-hover" href="#">Terms of Service</a> and <a class="font-semibold text-primary hover:text-primary-hover" href="#">Privacy Policy</a>.</label></div>
                </div>
                <button class="flex w-full justify-center rounded-lg bg-primary px-3 py-3.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors" type="submit">Join the Community</button>
            </form>
            <p class="text-center text-xs text-slate-500 dark:text-slate-500">© 2024 CodeLearn. All rights reserved.</p>
        </div>
    </div>
</main>
</body></html>
```