// API Route: GET /api/auth/callback/[provider]
// OAuth callback handler for GitHub and Google - Improved for smoother flow

import { NextRequest, NextResponse } from 'next/server';
import { exchangeOAuthCode, getUserFromToken } from '@/lib/auth/cognito';

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    if (!state) {
      return NextResponse.redirect(new URL('/login?error=missing_state', request.url));
    }

    // Validate provider
    if (provider !== 'github' && provider !== 'google') {
      return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url));
    }

    // Improved validation page with better UX
    const validationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Signing you in...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #0a0b14 0%, #13141f 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              max-width: 400px;
            }
            .logo {
              width: 64px;
              height: 64px;
              margin: 0 auto 1.5rem;
              background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: bold;
              box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
            }
            .spinner {
              width: 48px;
              height: 48px;
              margin: 0 auto 1.5rem;
              border: 3px solid rgba(139, 92, 246, 0.2);
              border-radius: 50%;
              border-top-color: #8b5cf6;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            h1 {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: white;
            }
            p {
              font-size: 14px;
              color: #94a3b8;
              line-height: 1.6;
            }
            .error {
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              padding: 1rem;
              margin-top: 1rem;
              color: #fca5a5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CL</div>
            <div class="spinner"></div>
            <h1>Completing sign in...</h1>
            <p>Please wait while we securely authenticate your account.</p>
            <div id="error-message" class="error" style="display: none;"></div>
          </div>
          <script>
            (async function() {
              try {
                const urlParams = new URLSearchParams(window.location.search);
                const returnedState = urlParams.get('state');
                const code = urlParams.get('code');
                
                // Retrieve stored state from sessionStorage
                const storedState = sessionStorage.getItem('oauth_state');
                const stateTimestamp = sessionStorage.getItem('oauth_state_timestamp');
                
                // Clear stored state immediately
                sessionStorage.removeItem('oauth_state');
                sessionStorage.removeItem('oauth_state_timestamp');
                
                // Validate state exists
                if (!storedState) {
                  console.error('OAuth state not found in session storage');
                  window.location.href = '/login?error=state_not_found';
                  return;
                }
                
                // Validate state matches (CSRF protection)
                if (storedState !== returnedState) {
                  console.error('OAuth state mismatch - possible CSRF attack');
                  window.location.href = '/login?error=state_mismatch';
                  return;
                }
                
                // Validate state is not expired (5 minutes max)
                const now = Date.now();
                const timestamp = parseInt(stateTimestamp || '0', 10);
                const fiveMinutes = 5 * 60 * 1000;
                
                if (now - timestamp > fiveMinutes) {
                  console.error('OAuth state expired');
                  window.location.href = '/login?error=state_expired';
                  return;
                }
                
                // State is valid, exchange code for tokens
                const response = await fetch('/api/auth/callback/${provider}/exchange', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ code }),
                  credentials: 'include',
                });
                
                const data = await response.json();
                
                if (data.success) {
                  // Store user data in sessionStorage for auth context to pick up
                  if (data.user) {
                    sessionStorage.setItem('oauth_user', JSON.stringify(data.user));
                  }
                  
                  // Success! Redirect to dashboard
                  // The dashboard will load user from sessionStorage
                  window.location.href = '/dashboard';
                } else {
                  // Show error and redirect after 2 seconds
                  const errorEl = document.getElementById('error-message');
                  if (errorEl) {
                    errorEl.textContent = data.error || 'Authentication failed. Please try again.';
                    errorEl.style.display = 'block';
                  }
                  setTimeout(() => {
                    window.location.href = '/login?error=' + encodeURIComponent(data.error || 'oauth_failed');
                  }, 2000);
                }
              } catch (error) {
                console.error('OAuth exchange error:', error);
                const errorEl = document.getElementById('error-message');
                if (errorEl) {
                  errorEl.textContent = 'Network error. Redirecting...';
                  errorEl.style.display = 'block';
                }
                setTimeout(() => {
                  window.location.href = '/login?error=oauth_failed';
                }, 2000);
              }
            })();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(validationHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('oauth_failed')}`, request.url)
    );
  }
}
