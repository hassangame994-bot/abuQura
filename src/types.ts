/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number | { [key: string]: number }; // either flat price or mapped prices for sizes
  description?: string;
  sizes?: string[]; // e.g. ["ربع", "تلت", "نص", "كيلو"] or ["سادة", "مع رز"]
  image?: string;
  rawImage?: string;
  isAvailable?: boolean;
}

export interface CartItem {
  id: string; // unique cart item instance id (item id + size + additions string)
  menuItemId: string;
  name: string;
  selectedSize?: string;
  unitPrice: number;
  quantity: number;
  additions: { name: string; price: number }[];
  customInstructions?: string;
}

export interface OrderLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Order {
  _id?: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  location: OrderLocation | null;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  customNotes?: string;
  createdAt?: string;
}

export interface AdminUser {
  username: string;
  password?: string;
}

export interface Rating {
  _id?: string;
  menuItemId: string;
  rating: number;
  createdAt?: string;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

