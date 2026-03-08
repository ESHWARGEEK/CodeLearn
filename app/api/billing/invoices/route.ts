/**
 * Billing Invoices API Route
 * Retrieves billing history and invoices for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { getUser } from '@/lib/db/users';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // Get user information
    const user = await getUser(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // If user has no Stripe customer ID, return empty invoices
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          invoices: [],
        },
      });
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 20, // Last 20 invoices
    });

    // Format invoice data
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description || `${invoice.lines.data[0]?.description || 'Subscription'}`,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
    }));

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
      },
    });
  } catch (error) {
    console.error('Invoices API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve invoices' } },
      { status: 500 }
    );
  }
}