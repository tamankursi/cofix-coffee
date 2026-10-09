// Core Types for COFIX

export interface Product {
  id: string;
  name: string;
  description: string; // Composition / ingredients
  price: number; // in IDR
  stock: number; // Available inventory
  imageUrl: string;
  version: number; // Incremented on any admin change (name, price, desc, stock, image)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productVersion: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = 'proses' | 'selesai';

export interface Order {
  id: string; // internal UUID
  orderNumber: number; // Public sequence number: #1, #2, #3, ...
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItemSnapshot[];
  totalAmount: number;
  deliveryMethod: string; // e.g. "Ambil langsung di tempat"
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string; // Midtrans method (e.g. "QRIS / GoPay / Bank Transfer")
  paymentTime: string; // Formatted date string in Asia/Jakarta (e.g. "2 Oktober 2026, 13.05")
  createdAt: string; // ISO
  archivedByAdmin?: boolean; // When admin deletes from dashboard, remains visible to customer
}

export interface CustomerNotification {
  id: string;
  userId: string;
  orderId: string;
  orderNumber: number;
  title: string;
  message: string;
  isRead: boolean;
  isClosed: boolean; // Controls whether the popup still shows
  createdAt: string;
}

export interface PromoEvent {
  id: string;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  phone: string; // WhatsApp number
  fullName: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string; // Phone number used for Fonnte WhatsApp alerts!
  createdAt: string;
}

export interface PaymentIntentResponse {
  token?: string;
  redirectUrl?: string;
  orderId: string;
  grossAmount: number;
}

export type StoreStatusMode = 'auto' | 'temporary_closed';

export interface StoreOperationalSettings {
  openTime: string; // e.g. "07:00"
  closeTime: string; // e.g. "21:00"
  storeStatus: StoreStatusMode; // 'auto' | 'temporary_closed'
  timezone: string; // "Asia/Jakarta"
  updatedAt?: string;
}

export interface WebsiteSettings {
  brandName: string;
  logoUrl?: string;
  heroTitle: string;
  heroAddress: string;
  instagramName: string;
  instagramUrl: string;
  tiktokName: string;
  tiktokUrl: string;
  googleMapsAddress: string;
  googleMapsUrl: string;
  updatedAt?: string;
}


