import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devstore/db';
import { productSchema } from '@devstore/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      published: true,
    };
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    
    if (minPrice || maxPrice) {
      where.priceCents = {};
      if (minPrice) where.priceCents.gte = parseInt(minPrice);
      if (maxPrice) where.priceCents.lte = parseInt(maxPrice);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          service: true,
          reviews: {
            where: { verified: true },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = productSchema.parse(body);
    
    const product = await prisma.product.create({
      data: validated,
    });
    
    return NextResponse.json({
      success: true,
      data: product,
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 400 }
    );
  }
}