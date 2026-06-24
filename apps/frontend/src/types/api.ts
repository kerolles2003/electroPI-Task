export type Role = 'CUSTOMER' | 'ADMIN';
export type Locale = 'EN' | 'AR';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'ONLINE' | 'CASH_ON_DELIVERY';
export type PaymentProvider = 'STRIPE' | 'CASH_ON_DELIVERY';

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  preferredLocale: Locale;
  emailVerified: boolean;
  createdAt: string;
}

export interface CategoryResponse {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
  category: CategoryResponse;
  createdAt: string;
  updatedAt: string;
}

export interface PageMetaResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  items: ProductResponse[];
  meta: PageMetaResponse;
}

export interface CartItemProductResponse {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: CartItemProductResponse;
}

export interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  totalItems: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string | null;
  productNameEn: string;
  productNameAr: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PaymentResponse {
  id: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionRef: string | null;
  paidAt: string | null;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  notes: string | null;
  deliveryAddress: string;
  items: OrderItemResponse[];
  payment: PaymentResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  items: OrderResponse[];
  meta: PageMetaResponse;
}

export interface CheckoutResponse {
  order: OrderResponse;
  checkoutUrl: string | null;
  paymentFailed: boolean;
}

export interface SessionResponse {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface DashboardOverviewResponse {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface OrderStatsResponse {
  revenue: {
    total: number;
    paid: number;
    cod: number;
  };
  distribution: {
    pending: number;
    confirmed: number;
    preparing: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
  };
}

export interface TopProductItem {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  unitsSold: number;
}

export interface TopCustomerItem {
  userId: string;
  userName: string;
  orderCount: number;
}

export interface RecentOrderResponse {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus | null;
  createdAt: string;
}

export interface RecentOrdersResponse {
  items: RecentOrderResponse[];
  meta: PageMetaResponse;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
