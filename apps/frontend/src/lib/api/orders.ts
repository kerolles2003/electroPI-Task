import type {
  CheckoutResponse,
  DashboardOverviewResponse,
  OrderListResponse,
  OrderResponse,
  OrderStatsResponse,
  OrderStatus,
  PaymentMethod,
  RecentOrdersResponse,
} from '@/types/api';
import { get, patch, post } from './client';

export const ordersApi = {
  checkout: (data: { deliveryAddress: string; paymentMethod: PaymentMethod; notes?: string }) =>
    post<CheckoutResponse>('/orders/checkout', data),

  list: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return get<OrderListResponse>(`/orders${qs ? `?${qs}` : ''}`);
  },

  byNumber: (orderNumber: string) => get<OrderResponse>(`/orders/${orderNumber}`),
};

export const adminOrdersApi = {
  list: (params?: { page?: number; limit?: number; status?: OrderStatus }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return get<OrderListResponse>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  byNumber: (orderNumber: string) => get<OrderResponse>(`/admin/orders/${orderNumber}`),

  updateStatus: (orderNumber: string, status: OrderStatus) =>
    patch<OrderResponse>(`/admin/orders/${orderNumber}/status`, { status }),
};

export const dashboardApi = {
  overview: () => get<DashboardOverviewResponse>('/admin/dashboard/overview'),

  orderStats: () => get<OrderStatsResponse>('/admin/dashboard/order-stats'),

  recentOrders: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return get<RecentOrdersResponse>(`/admin/dashboard/recent-orders${qs ? `?${qs}` : ''}`);
  },
};
