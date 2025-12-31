import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@devstore/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, successUrl, cancelUrl, customerEmail } = body;
    
    const cartId = cookies().get('cart_id')?.value;
    
    if (!items?.length && !cartId) {
      return NextResponse.json(
        { success: false, error: 'No items in cart' },
        { status: 400 }
      );
    }
    
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    if (items?.length) {
      // Items provided directly
      const products = await prisma.product.findMany({
        where: {
          id: { in: items.map((item: any) => item.productId) },
          published: true,
        },
      });
      
      lineItems = items.map((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
        return {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.images.slice(0, 1),
              metadata: {
                productId: product.id,
                type: product.type,
              },
            },
            unit_amount: product.priceCents,
          },
          quantity: item.quantity,
        };
      });
      
    } else if (cartId) {
      // Items from cart
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      
      if (!cart?.items.length) {
        return NextResponse.json(
          { success: false, error: 'Cart is empty' },
          { status: 400 }
        );
      }
      
      lineItems = cart.items.map(item => ({
        price_data: {
          currency: item.product.currency.toLowerCase(),
          product_data: {
            name: item.product.title,
            description: item.product.description || undefined,
            images: item.product.images.slice(0, 1),
            metadata: {
              productId: item.product.id,
              type: item.product.type,
            },
          },
          unit_amount: item.product.priceCents,
        },
        quantity: item.quantity,
      }));
    }
    
    // Calculate total
    const amountCents = lineItems.reduce(
      (sum, item) => sum + (item.price_data!.unit_amount! * item.quantity!),
      0
    );
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        amountCents,
        currency: 'USD',
        customerEmail,
        items: {
          create: lineItems.map(item => ({
            productId: item.price_data!.product_data!.metadata!.productId,
            quantity: item.quantity!,
            unitPrice: item.price_data!.unit_amount!,
            totalPrice: item.price_data!.unit_amount! * item.quantity!,
          })),
        },
      },
    });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
      },
    });
    
    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSession: session.id },
    });
    
    // Clear cart if exists
    if (cartId) {
      await prisma.cart.delete({
        where: { id: cartId },
      });
      cookies().delete('cart_id');
    }
    
    return NextResponse.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}