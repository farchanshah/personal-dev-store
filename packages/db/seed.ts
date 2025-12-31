import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@devstore/utils/security';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@devstore.com',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'user@devstore.com',
      name: 'Test User',
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'web-templates',
        name: 'Web Templates',
        description: 'Premium website templates and themes',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'code-tools',
        name: 'Code Tools',
        description: 'Development tools and utilities',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'services',
        name: 'Services',
        description: 'Professional development services',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'merchandise',
        name: 'Merchandise',
        description: 'Developer merchandise and swag',
      },
    }),
  ]);

  // Create digital products
  const digitalProducts = await Promise.all([
    prisma.product.create({
      data: {
        slug: 'react-admin-dashboard',
        title: 'React Admin Dashboard',
        description: 'Premium React admin dashboard with TypeScript, Tailwind CSS, and 50+ components',
        content: 'Complete admin dashboard solution with authentication, charts, tables, and more.',
        type: 'DIGITAL',
        category: 'Web Templates',
        tags: ['react', 'typescript', 'dashboard', 'admin'],
        priceCents: 4900,
        comparePriceCents: 9900,
        stock: null,
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w-800',
        ],
        featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        featured: true,
        published: true,
        downloadUrl: 'https://example.com/download/react-admin-dashboard.zip',
        fileSize: 1024000,
        fileType: 'zip',
        seoTitle: 'React Admin Dashboard - Premium Template',
        seoDescription: 'Professional React admin dashboard template with TypeScript and Tailwind CSS',
      },
    }),
    prisma.product.create({
      data: {
        slug: 'nextjs-ecommerce',
        title: 'Next.js E-commerce Template',
        description: 'Full-featured Next.js e-commerce template with Stripe integration',
        content: 'Complete e-commerce solution with product catalog, cart, checkout, and admin panel.',
        type: 'DIGITAL',
        category: 'Web Templates',
        tags: ['nextjs', 'ecommerce', 'stripe', 'tailwind'],
        priceCents: 6900,
        comparePriceCents: 12900,
        stock: null,
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        ],
        featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        featured: true,
        published: true,
        downloadUrl: 'https://example.com/download/nextjs-ecommerce.zip',
        fileSize: 2048000,
        fileType: 'zip',
      },
    }),
  ]);

  // Create physical products
  const physicalProducts = await Promise.all([
    prisma.product.create({
      data: {
        slug: 'developer-hoodie',
        title: 'Developer Hoodie',
        description: 'Premium cotton hoodie for developers',
        content: 'Comfortable hoodie with developer-themed design',
        type: 'PHYSICAL',
        category: 'Merchandise',
        tags: ['clothing', 'hoodie', 'merch'],
        priceCents: 4500,
        stock: 100,
        sku: 'DH-001',
        barcode: '123456789012',
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        ],
        featuredImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        featured: false,
        published: true,
        weight: 500,
        dimensions: {
          length: 30,
          width: 20,
          height: 5,
        },
      },
    }),
  ]);

  // Create service products
  const serviceProduct = await prisma.product.create({
    data: {
      slug: 'fullstack-development',
      title: 'Full-Stack Development',
      description: 'Custom full-stack web application development',
      content: 'Professional web application development using modern technologies',
      type: 'SERVICE',
      category: 'Services',
      tags: ['development', 'web', 'consulting', 'custom'],
      priceCents: 500000,
      stock: null,
      images: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      ],
      featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      featured: true,
      published: true,
      service: {
        create: {
          durationDays: 30,
          deliverables: [
            'Complete source code',
            'Documentation',
            'Deployment assistance',
            '1 month support',
          ],
          revisions: 3,
          supportDays: 30,
          process: [
            'Consultation & Planning',
            'Design & Prototyping',
            'Development',
            'Testing & Quality Assurance',
            'Deployment',
            'Support & Maintenance',
          ],
          addons: [
            {
              id: 'addon-1',
              name: 'Priority Support',
              description: '24/7 priority support for 6 months',
              priceCents: 100000,
            },
            {
              id: 'addon-2',
              name: 'Additional Features',
              description: 'Additional feature development',
              priceCents: 50000,
            },
          ],
        },
      },
    },
  });

  // Create reviews
  await prisma.review.createMany({
    data: [
      {
        productId: digitalProducts[0].id,
        userId: user.id,
        rating: 5,
        title: 'Excellent dashboard!',
        content: 'Saved me weeks of development time. Highly recommended!',
        verified: true,
      },
      {
        productId: digitalProducts[0].id,
        userId: admin.id,
        rating: 4,
        title: 'Great template',
        content: 'Well structured and easy to customize.',
        verified: true,
      },
      {
        productId: serviceProduct.id,
        userId: user.id,
        rating: 5,
        title: 'Professional service',
        content: 'Delivered exactly what was promised. Great communication throughout the project.',
        verified: true,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@devstore.com / Admin123!`);
  console.log(`👤 Test user: user@devstore.com / User123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });