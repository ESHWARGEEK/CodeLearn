// API Route: GET /api/auth/callback/[provider]
// Task 3.4: OAuth callback handler for GitHub and Google

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

    // Create a response that will render a page to validate state from sessionStorage
    // Since we can't access sessionStorage from the server, we need to do this client-side
    const validationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Completing OAuth...</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #0f172a;
              color: white;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              border: 3px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              border-top: 3px solid white;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>Completing authentication...</p>
          </div>
          <script>
            (function() {
              const urlParams = new URLSearchParams(window.location.search);
              const returnedState = urlParams.get('state');
              const code = urlParams.get('code');
              
              // Retrieve stored state from sessionStorage
              const storedState = sessionStorage.getItem('oauth_state');
              const stateTimestamp = sessionStorage.getItem('oauth_state_timestamp');
              
              // Clear stored state
              sessionStorage.removeItem('oauth_state');
              sessionStorage.removeItem('oauth_state_timestamp');
              
              // Validate state exists
              if (!storedState) {
                window.location.href = '/login?error=state_not_found';
                return;
              }
              
              // Validate state matches
              if (storedState !== returnedState) {
                console.error('State mismatch - possible CSRF attack');
                window.location.href = '/login?error=state_mismatch';
                return;
              }
              
              // Validate state is not expired (5 minutes max)
              const now = Date.now();
              const timestamp = parseInt(stateTimestamp || '0', 10);
              const fiveMinutes = 5 * 60 * 1000;
              
              if (now - timestamp > fiveMinutes) {
                window.location.href = '/login?error=state_expired';
                return;
              }
              
              // State is valid, continue with OAuth flow
              // Make a POST request to complete the OAuth exchange
              fetch('/api/auth/callback/${provider}/exchange', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  // Redirect to home page for now (dashboard not implemented yet)
                  // TODO: Redirect to /dashboard when Task 4 is implemented
                  // TODO: Redirect to /onboarding for new users when Task 20 is implemented
                  window.location.href = '/';
                } else {
                  window.location.href = '/login?error=' + encodeURIComponent(data.error || 'oauth_failed');
                }
              })
              .catch(error => {
                console.error('OAuth exchange error:', error);
                window.location.href = '/login?error=oauth_failed';
              });
            })();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(validationHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('oauth_failed')}`, request.url)
    );
  }
}
