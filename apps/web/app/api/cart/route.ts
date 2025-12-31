import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@devstore/db';

export async function GET(request: NextRequest) {
  try {
    const cartId = cookies().get('cart_id')?.value;
    
    if (!cartId) {
      return NextResponse.json({
        success: true,
        data: { items: [] },
      });
    }
    
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
    
    return NextResponse.json({
      success: true,
      data: cart || { items: [] },
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, options } = body;
    
    let cartId = cookies().get('cart_id')?.value;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check stock for physical products
    if (product.type === 'PHYSICAL' && product.stock && product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      );
    }
    
    if (!cartId) {
      const cart = await prisma.cart.create({
        data: {},
      });
      
      cartId = cart.id;
      cookies().set('cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
        options,
      },
      create: {
        cartId,
        productId,
        quantity,
        options,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: cartItem,
    });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}