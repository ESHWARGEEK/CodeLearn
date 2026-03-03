'use client';

// Landing Page for CodeLearn Platform
// Modern dark design with hero section and features

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-blue-600">
                <span className="text-sm font-bold">CL</span>
              </div>
              <span className="text-xl font-bold">CodeLearn</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Already have an account?
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 border border-purple-500/20">
              AI-Powered Learning
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Learn by Building
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Real Projects
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10">
              An AI-driven platform that guides you to learn by building real-world projects. Get
              instant AI mentorship and accelerate your coding journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Start Learning Free
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-base font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              ✓ No credit card required · ✓ 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">One Platform, Two Ways to Grow</h2>
            <p className="text-lg text-slate-400">
              Whether you&apos;re learning or building, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Learning Mode */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Learning Mode</h3>
              <p className="text-slate-400 mb-6">
                Master new technologies by building real projects with AI guidance. Get curated
                projects, step-by-step tasks, and instant mentorship.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">AI-curated project recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Real-time code execution & preview</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">24/7 AI mentor for instant help</span>
                </li>
              </ul>
            </div>

            {/* Developer Mode */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <span className="material-symbols-outlined text-3xl">code</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Developer Mode</h3>
              <p className="text-slate-400 mb-6">
                Extract and integrate code templates from any GitHub repository. AI analyzes and
                adapts code to fit your project perfectly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">✓</span>
                  <span className="text-slate-300">Smart template extraction from GitHub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">✓</span>
                  <span className="text-slate-300">Context-aware code integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">✓</span>
                  <span className="text-slate-300">One-click undo & version control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-slate-400">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-2xl font-bold text-purple-400 border border-purple-500/20">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Choose a Technology</h3>
              <p className="text-slate-400">
                Select from React, Vue, Node.js, Python, and more. Tell us what you want to learn.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-2xl font-bold text-purple-400 border border-purple-500/20">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">AI Curates the Path</h3>
              <p className="text-slate-400">
                Our AI finds the perfect projects and creates a personalized learning roadmap for
                you.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-2xl font-bold text-purple-400 border border-purple-500/20">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Build & Deploy</h3>
              <p className="text-slate-400">
                Code in our browser IDE, get instant feedback, and deploy your project to showcase
                your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-400">Start for free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Hobby */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h3 className="text-xl font-bold mb-2">Hobby</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">3 Learning projects</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">5 AI integrations/month</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Community support</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Creator */}
            <div className="rounded-2xl border-2 border-purple-500 bg-slate-900 p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-xs font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Pro Creator</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Unlimited AI integrations</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Priority AI responses</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Advanced analytics</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Upgrade Now
              </Link>
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h3 className="text-xl font-bold mb-2">Team</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Up to 10 team members</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Shared workspaces</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-purple-400">✓</span>
                  <span className="text-slate-300">Admin dashboard</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-blue-600">
                <span className="text-sm font-bold">CL</span>
              </div>
              <span className="text-lg font-bold">CodeLearn</span>
            </div>
            <p className="text-sm text-slate-400">© 2024 CodeLearn. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
