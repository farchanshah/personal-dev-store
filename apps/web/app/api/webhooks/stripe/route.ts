import { NextRequest, NextResponse } from 'next/server';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { prisma } from '@devstore/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  try {
    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'stripe',
        eventType: event.type,
        payload: event.data.object,
      },
    });
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  
  await prisma.$transaction(async (tx) => {
    // Update order status
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentId: session.payment_intent as string,
        paidAt: new Date(),
        customerEmail: session.customer_email,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    // Create invoice
    await tx.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: `INV-${Date.now()}`,
        amountCents: order.amountCents,
        currency: order.currency,
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    
    // Handle digital products
    const digitalItems = order.items.filter(item => item.product.type === 'DIGITAL');
    
    for (const item of digitalItems) {
      // Generate download link (simplified - in reality use S3 signed URLs)
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/download/${crypto.randomUUID()}`;
      
      await tx.deliverable.create({
        data: {
          orderId: order.id,
          title: `${item.product.title} - Digital Download`,
          fileUrl: downloadUrl,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }
    
    // Send confirmation email (simplified)
    console.log(`Order ${order.id} completed. Send email to ${order.customerEmail}`);
    
    // If service product, update service status
    const serviceItems = order.items.filter(item => item.product.type === 'SERVICE');
    
    if (serviceItems.length > 0) {
      await tx.order.update({
        where: { id: order.id },
        data: { serviceStatus: 'AWAITING_BRIEF' },
      });
      
      // Send service onboarding email
      console.log(`Service order ${order.id} - send briefing instructions`);
    }
  });
}