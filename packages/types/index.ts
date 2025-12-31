export * from './product';
export * from './order';
export * from './user';
export * from './api';
export * from './cart';

// File: packages/types/product.ts
export interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  type: 'DIGITAL' | 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
  category?: string;
  tags: string[];
  
  // Pricing
  priceCents: number;
  currency: string;
  comparePriceCents?: number;
  costCents?: number;
  
  // Inventory
  stock?: number;
  sku?: string;
  barcode?: string;
  
  // Digital
  downloadUrl?: string;
  fileSize?: number;
  fileType?: string;
  
  // Physical
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Display
  images: string[];
  featuredImage?: string;
  featured: boolean;
  published: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  
  // Relations
  service?: Service;
  reviews?: Review[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  productId: string;
  
  durationDays?: number;
  deliverables: string[];
  revisions: number;
  supportDays: number;
  requirements?: Record<string, any>;
  process: string[];
  addons?: ServiceAddon[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  priceCents: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  verified: boolean;
  createdAt: Date;
  user?: User;
}

// File: packages/types/order.ts
export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  
  status: OrderStatus;
  serviceStatus?: ServiceStatus;
  
  amountCents: number;
  currency: string;
  taxCents: number;
  shippingCents: number;
  discountCents: number;
  
  paymentId?: string;
  stripeSession?: string;
  paymentMethod?: string;
  
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  
  billingAddress?: Address;
  shippingAddress?: Address;
  
  brief?: Record<string, any>;
  requirements?: Record<string, any>;
  
  paidAt?: Date;
  fulfilledAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  
  items: OrderItem[];
  invoices: Invoice[];
  deliverables: Deliverable[];
  
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED';

export type ServiceStatus =
  | 'AWAITING_BRIEF'
  | 'BRIEF_SUBMITTED'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'REVISION_REQUESTED'
  | 'DELIVERED'
  | 'ACCEPTED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: Record<string, any>;
  product: Product;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  pdfUrl?: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
}

export type InvoiceStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface Deliverable {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  expiresAt?: Date;
  downloaded: boolean;
  downloadCount: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// File: packages/types/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  
  bio?: string;
  company?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  orders?: Order[];
  reviews?: Review[];
}

export type UserRole = 
  | 'ADMIN'
  | 'CLIENT'
  | 'VENDOR'
  | 'MODERATOR';

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

// File: packages/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  type?: Product['type'];
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  published?: boolean;
  search?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  options?: Record<string, any>;
}

export interface CheckoutSessionRequest {
  items: CartItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  created: number;
}

// File: packages/types/cart.ts
export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  options?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}