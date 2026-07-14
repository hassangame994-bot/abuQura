/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  ShoppingBag,
  ShoppingCart,
  MapPin,
  User,
  Plus,
  Minus,
  Search,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Phone,
  Settings,
  LogOut,
  Edit,
  BarChart2,
  DollarSign,
  ClipboardList,
  Navigation,
  Sparkles,
  ChevronDown,
  X,
  Map,
  Star,
  Utensils,
  Flame,
  Drumstick,
  Soup,
  Sandwich,
  Coffee,
  CookingPot,
  Beef,
  CakeSlice,
  Salad,
  Users,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

import { MENU_ITEMS, CATEGORIES, ITEM_SPECIFIC_IMAGES, CATEGORY_IMAGES } from './menuData';
import { MenuItem, CartItem, Order, OrderLocation, Rating } from './types';
import abugouraLogoImg from './assets/images/abugoura_legacy_masterpiece_logo_1783855599294.jpg';

// --- INTERACTIVE LEAFLET MAP COMPONENTS ---

// 1. Selector Map for Checkout Form
function LeafletSelectorMap({
  lat,
  lng,
  onChange
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, accuracy?: number) => void;
}) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstance = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);
  const onChangeRef = React.useRef(onChange);

  // Keep onChangeRef updated to avoid stale closures in event listeners
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (!(window as any).L || !mapRef.current) return;
    const L = (window as any).L;

    // Initialize map centered at current coordinates
    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Delivery location marker
    const pinIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true })
      .addTo(mapInstance.current)
      .bindPopup('اسحب الدبوس لتحديد منزلك بدقة متناهية للتوصيل 📍')
      .openPopup();

    // On dragend, update coordinates
    markerRef.current.on('dragend', () => {
      const position = markerRef.current.getLatLng();
      if (onChangeRef.current) {
        onChangeRef.current(position.lat, position.lng, 10);
      }
    });

    // On map click, move marker and update coordinates
    mapInstance.current.on('click', (e: any) => {
      markerRef.current.setLatLng(e.latlng);
      if (onChangeRef.current) {
        onChangeRef.current(e.latlng.lat, e.latlng.lng, 10);
      }
    });

    // Invalidate size inside a tiny timeout to fix grey-tile bugs in animated/flex containers
    const sizeTimeout = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(sizeTimeout);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map and marker if external lat/lng changes
  React.useEffect(() => {
    if (mapInstance.current && markerRef.current && (window as any).L) {
      const L = (window as any).L;
      const currentMarkerLatLng = markerRef.current.getLatLng();
      const targetLatLng = new L.LatLng(lat, lng);
      const distance = currentMarkerLatLng.distanceTo(targetLatLng);
      
      // Only set view/marker if the difference is substantial (e.g. > 1 meter)
      if (distance > 1) {
        markerRef.current.setLatLng(targetLatLng);
        mapInstance.current.setView(targetLatLng, 15);
      }
      
      // Keep sizing fresh
      mapInstance.current.invalidateSize();
    }
  }, [lat, lng]);

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-amber-200 shadow-md h-56 w-full bg-amber-50">
      <div className="absolute top-2 right-2 z-[400] bg-white/95 backdrop-blur-sm border border-amber-200 px-3 py-1 rounded-md text-[10px] font-bold text-amber-950 shadow-sm">
        🗺️ انقر على الخريطة أو اسحب الدبوس لتحديد موقعك
      </div>
      <div className="h-full w-full" ref={mapRef} />
    </div>
  );
}

// 2. Delivery Route Map for Order History
function LeafletDeliveryMap({ userLat, userLng }: { userLat: number; userLng: number }) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstance = React.useRef<any>(null);

  React.useEffect(() => {
    if (!(window as any).L || !mapRef.current) return;
    const L = (window as any).L;

    const REST_LAT = 29.9115778;
    const REST_LNG = 31.0589758;

    const centerLat = (REST_LAT + userLat) / 2;
    const centerLng = (REST_LNG + userLng) / 2;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Restaurant Marker
    const restaurantIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
    L.marker([REST_LAT, REST_LNG], { icon: restaurantIcon })
      .addTo(mapInstance.current)
      .bindPopup('<b>مطعم أبو قورة الرئيسي</b><br>يتم تحضير طعامك الساخن هنا')
      .openPopup();

    // Delivery Destination Marker
    const deliveryIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
    L.marker([userLat, userLng], { icon: deliveryIcon })
      .addTo(mapInstance.current)
      .bindPopup('<b>عنوان التوصيل الخاص بك</b>')
      .openPopup();

    // Draw route polyline
    const latlngs = [
      [REST_LAT, REST_LNG],
      [userLat, userLng]
    ];
    const polyline = L.polyline(latlngs, { color: '#DC2626', weight: 4, dashArray: '5, 10' }).addTo(mapInstance.current);
    
    mapInstance.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Invalidate size inside a tiny timeout to fix grey-tile bugs in animated/flex containers
    const sizeTimeout = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(sizeTimeout);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userLat, userLng]);

  return (
    <div className="rounded-xl overflow-hidden border border-amber-200 shadow-inner h-60 w-full bg-amber-50" ref={mapRef} />
  );
}

// Helper to convert Eastern Arabic and Persian numerals to Western/English digits
function convertArabicToEnglishNumerals(str: string): string {
  if (!str) return '';
  return str.replace(/[٠-٩]/g, (d) => {
    return '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
  }).replace(/[۰-۹]/g, (d) => {
    return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString();
  });
}

// Helper to normalize Arabic text to ignore diacritics, Alef shapes, Teh Marbouta vs Heh, and Alef Maksoura vs Yeh
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F]/g, '') // Remove Tashkeel (diacritics)
    .replace(/[أإآ]/g, 'ا')         // Normalize Alef
    .replace(/ة/g, 'ه')             // Normalize Teh Marbouta
    .replace(/ى/g, 'ي')             // Normalize Alef Maksoura to Yeh
    .trim()
    .toLowerCase();
}

// Helper to format any Egyptian or general WhatsApp phone number into international format for wa.me links
function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const converted = convertArabicToEnglishNumerals(phone);
  // Strip all non-digits
  let digits = converted.trim().replace(/\D/g, '');
  
  // If it starts with '00', strip it (e.g. '002010...' -> '2010...')
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }
  
  // If it starts with a single '0' (like local Egyptian mobile numbers '010...', '011...', etc.), convert to '2010...', '2011...'
  if (digits.startsWith('0')) {
    digits = '20' + digits.substring(1);
  }
  
  // If it's a 10-digit number not starting with '20' (e.g. '1012345678'), assume Egypt and prepend '20'
  if (digits.length === 10 && !digits.startsWith('20')) {
    digits = '20' + digits;
  }
  
  return digits;
}

// WhatsApp Invoice Generator Helper
function getWhatsAppMessageLink(order: any, adminWhatsapp: string) {
  const cleanPhone = formatWhatsAppNumber(adminWhatsapp);
  const orderId = order._id ? order._id.slice(-5).toUpperCase() : 'NEW';
  let message = `🍽️ *طلب جديد من مطعم أبو قورة*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *العميل:* ${order.customerName}\n`;
  message += `📞 *الهاتف:* ${order.phoneNumber}\n`;
  message += `📍 *العنوان:* ${order.address}\n`;
  
  if (order.location) {
    message += `🗺️ *الموقع الدقيق بالخريطة (لوكيشن):*\nhttps://maps.google.com/?q=${order.location.latitude},${order.location.longitude}\n`;
  }
  
  message += `\n📦 *الأكلات المطلوبة:*\n`;
  order.items.forEach((item: any) => {
    message += `- ${item.quantity}x ${item.name} ${item.selectedSize ? `(${item.selectedSize})` : ''} [${item.unitPrice * item.quantity} ج.م]\n`;
    if (item.additions && item.additions.length > 0) {
      message += `   🥗 إضافات: ${item.additions.map((a: any) => a.name).join('، ')}\n`;
    }
  });
  
  if (order.customNotes) {
    message += `\n💡 *ملاحظات خاصة:* ${order.customNotes}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *الحساب المطلوب:* ${order.totalPrice} ج.م (كاش عند التوصيل)\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `يرجى تأكيد استلام الطلب وبدء التحضير فوراً. شكراً لكم!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// WhatsApp Admin contacting Customer Helper with detailed items and additions
function getAdminWhatsAppLink(order: any) {
  const cleanPhone = formatWhatsAppNumber(order.phoneNumber);
  
  let msg = `السلام عليكم يا أستاذ ${order.customerName}، معك مطعم أبو قورة بخصوص طلبك رقم #${order._id?.slice(-5).toUpperCase()}.\n\n`;
  msg += `📦 *تفاصيل طلبك بالتفصيل:* \n`;
  order.items.forEach((item: any) => {
    msg += `- ${item.quantity}x ${item.name}`;
    if (item.selectedSize) {
      msg += ` (${item.selectedSize})`;
    }
    msg += ` [${item.unitPrice * item.quantity} ج.م]\n`;
    if (item.additions && item.additions.length > 0) {
      msg += `   🥗 الإضافات: ${item.additions.map((a: any) => a.name).join('، ')}\n`;
    }
  });
  
  if (order.customNotes) {
    msg += `\n💡 *الملاحظات الخاصة:* ${order.customNotes}\n`;
  }
  
  msg += `\n💰 *الحساب الإجمالي:* ${order.totalPrice} ج.م (كاش عند الاستلام)\n`;
  msg += `📍 *العنوان:* ${order.address}\n\n`;
  msg += `طلبك جاهز وقيد التجهيز/التوصيل حالياً. شكراً لتعاملك مع مطعم أبو قورة! ❤️`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

// Bulletproof LocalStorage helpers to prevent security, quota, or sandbox iframe crashes
const safeStorage = {
  getItem(key: string, defaultValue = ''): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key) || defaultValue;
      }
    } catch (e) {
      console.warn(`[safeStorage] Error getting key "${key}":`, e);
    }
    return defaultValue;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[safeStorage] Error setting key "${key}":`, e);
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Error removing key "${key}":`, e);
    }
  }
};

// Play gentle success chime using browser Web Audio API (network independent, error-free)
function playSuccessSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = ctx.currentTime;
    playTone(523.25, now, 0.3); // C5 Tone
    playTone(659.25, now + 0.12, 0.45); // E5 Tone
  } catch (err) {
    console.warn('Audio play restricted or failed:', err);
  }
}

// Play gentle bell sound using browser Web Audio API (network independent, error-free)
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(523.25, ctx.currentTime, 0.4); // C5
    playTone(659.25, ctx.currentTime + 0.15, 0.5); // E5
  } catch (e) {
    console.warn("Audio play failed", e);
  }
}

// Safe Browser Background Notification Sender
function sendBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const options: any = {
    body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png', // restaurant icon
    badge: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    tag: 'abugoura-order-update',
    renotify: true
  };

  // Try sending via Service Worker if registered (better background reliability on some mobile browsers)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options).catch((err) => {
        console.warn('ServiceWorker showNotification failed, using fallback:', err);
        const notification = new Notification(title, options);
        notification.onclick = () => { window.focus(); notification.close(); };
      });
    }).catch(() => {
      const notification = new Notification(title, options);
      notification.onclick = () => { window.focus(); notification.close(); };
    });
  } else {
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => { window.focus(); notification.close(); };
    } catch (err) {
      console.warn('Standard Notification fallback failed:', err);
    }
  }
}

export function AbuGouraLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-amber-50 shadow-md border-2 border-amber-900/10 hover:shadow-lg transition-all duration-300 ${className} flex items-center justify-center`}>
      <img
        src={abugouraLogoImg}
        alt="مطعم أبو قورة"
        className="w-full h-full object-cover rounded-full select-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function App() {
  // --- STABLE REFS FOR ASYNC WEB-SOCKET LISTENERS ---
  const ordersRef = React.useRef<Order[]>([]);
  const trackedOrdersRef = React.useRef<Order[]>([]);
  const isAdminLoggedInRef = React.useRef<boolean>(false);
  const showToastRef = React.useRef<any>(null);

  // --- STATE DECLARATIONS ---
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [menuLoading, setMenuLoading] = useState<boolean>(false);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        const apiCategories = data.categories || [];
        const hasAll = apiCategories.some((c: any) => c.id === 'all');
        const finalCats = hasAll ? apiCategories : [{ id: 'all', name: 'الكل' }, ...apiCategories];
        setCategories(finalCats);
        
        const rawMenuItems = data.menuItems || [];
        const enrichedMenuItems = rawMenuItems.map((item: MenuItem) => ({
          ...item,
          rawImage: item.image,
          image: item.image && item.image.trim() !== '' 
            ? item.image.trim() 
            : (ITEM_SPECIFIC_IMAGES[item.id] || CATEGORY_IMAGES[item.category] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80')
        }));
        setMenuItems(enrichedMenuItems);
      }
    } catch (err: any) {
      console.warn('⚠️ Transient network delay when fetching menu:', err.message || err);
    } finally {
      setMenuLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = safeStorage.getItem('abugoura_cart');
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'client' | 'track' | 'admin'>('client');

  // Browser Notification state & handlers
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Synchronize dynamic states into stable refs for the socket listener on every render
  React.useEffect(() => {
    ordersRef.current = orders;
    trackedOrdersRef.current = trackedOrders;
    isAdminLoggedInRef.current = isAdminLoggedIn;
    showToastRef.current = showToast;
  });

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      showToast('متصفحك لا يدعم إشعارات المتصفح المنبثقة.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showToast('تم تفعيل تنبيهات المتصفح الفورية بنجاح! 🎉', 'success');
        sendBrowserNotification(
          '🔔 مطعم أبو قورة يرحب بك!',
          'لقد قمت بتفعيل الإشعارات بنجاح. ستتلقى تنبيهات فورية عن حالة طلبك حتى لو كان التطبيق في الخلفية.'
        );
      } else if (permission === 'denied') {
        showToast('تم رفض الإذن. يمكنك تفعيله يدوياً من إعدادات القفل في شريط عنوان المتصفح.', 'error');
      }
    } catch (err) {
      console.error('Notification permission request error:', err);
    }
  };

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [location, setLocation] = useState<OrderLocation | null>({ latitude: 29.9115778, longitude: 31.0589758, accuracy: 100 });
  const [locatingState, setLocatingState] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');

  // Pagination for All category (Load More "المزيد")
  const [visibleItemsCount, setVisibleItemsCount] = useState(25);

  useEffect(() => {
    setVisibleItemsCount(25);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchMenu();
  }, []);

  // Order Tracking State
  const [trackPhoneNumber, setTrackPhoneNumber] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<Order[]>([]);
  const [isTrackSearched, setIsTrackSearched] = useState(false);

  // Cart Customization Dialog State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [imagePreviewItem, setImagePreviewItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState(1);
  const [selectedAdditions, setSelectedAdditions] = useState<{ name: string; price: number }[]>([]);

  // Admin Account & Auth States
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeStorage.getItem('abugoura_admin_logged_in') === 'true';
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    return safeStorage.getItem('abugoura_admin_user') || '';
  });
  const [adminToken, setAdminToken] = useState<string>(() => {
    return safeStorage.getItem('abugoura_admin_token') || '';
  });
  const [adminAuthModal, setAdminAuthModal] = useState<'login' | 'register' | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('201120751464');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'menu'>('orders');

  // Custom Reusable Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'نعم، متأكد', cancelText = 'إلغاء') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Menu Management States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    hasMultipleSizes: false,
    sizes: [] as string[],
    sizePrices: {} as { [key: string]: number },
    image: '',
    isAvailable: true
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [adminMenuSearch, setAdminMenuSearch] = useState('');
  const [adminMenuCategory, setAdminMenuCategory] = useState('all');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Admin Login/Register Inputs
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSecurityCode, setAuthSecurityCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Editing state
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [editNewUsername, setEditNewUsername] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editNewSecurityCode, setEditNewSecurityCode] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // --- CLIENT USER PROFILE & AUTH STATES ---
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(() => {
    return safeStorage.getItem('abugoura_user_logged_in') === 'true';
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    const stored = safeStorage.getItem('abugoura_user_profile');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [userToken, setUserToken] = useState<string>(() => {
    return safeStorage.getItem('abugoura_user_token') || '';
  });
  const [userAuthModal, setUserAuthModal] = useState<'login' | 'register' | 'profile' | null>(null);

  // Form Inputs for User Auth/Profile
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormAddress, setUserFormAddress] = useState('');
  const [userFormLocation, setUserFormLocation] = useState<OrderLocation | null>(null);
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userFormLoading, setUserFormLoading] = useState(false);

  // --- CLIENT USER ACTIONS ---
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userFormName.trim() || !userFormPhone.trim() || !userFormPassword || !userFormAddress.trim()) {
      setUserFormError('الرجاء ملء جميع الحقول الأساسية: الاسم، الهاتف، كلمة المرور، والعنوان.');
      return;
    }

    setUserFormLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userFormName.trim(),
          phoneNumber: userFormPhone.trim(),
          password: userFormPassword,
          address: userFormAddress.trim(),
          location: userFormLocation || location
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUserLoggedIn(true);
        setUserProfile(data.user);
        setUserToken(data.token);

        safeStorage.setItem('abugoura_user_logged_in', 'true');
        safeStorage.setItem('abugoura_user_profile', JSON.stringify(data.user));
        safeStorage.setItem('abugoura_user_token', data.token);

        showToast('مرحباً بك! تم إنشاء حسابك وتأمين بياناتك بنجاح 🎉', 'success');
        setUserAuthModal(null);
        clearUserForm();
      } else {
        setUserFormError(data.error || 'فشل تسجيل الحساب، يرجى المحاولة لاحقاً.');
      }
    } catch (err) {
      console.error(err);
      setUserFormError('فشل الاتصال بالخادم. يرجى التحقق من الإنترنت.');
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userFormPhone.trim() || !userFormPassword) {
      setUserFormError('الرجاء إدخال رقم الهاتف وكلمة المرور.');
      return;
    }

    setUserFormLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: userFormPhone.trim(),
          password: userFormPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUserLoggedIn(true);
        setUserProfile(data.user);
        setUserToken(data.token);

        safeStorage.setItem('abugoura_user_logged_in', 'true');
        safeStorage.setItem('abugoura_user_profile', JSON.stringify(data.user));
        safeStorage.setItem('abugoura_user_token', data.token);

        showToast(`أهلاً بك مجدداً يا أستاذ ${data.user.name}! ❤️`, 'success');
        setUserAuthModal(null);
        clearUserForm();
      } else {
        setUserFormError(data.error || 'رقم الهاتف أو كلمة المرور غير صحيحة.');
      }
    } catch (err) {
      console.error(err);
      setUserFormError('فشل الاتصال بالخادم.');
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleUserUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userFormName.trim() || !userFormAddress.trim()) {
      setUserFormError('الرجاء ملء الاسم والعنوان.');
      return;
    }

    setUserFormLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: userFormName.trim(),
          address: userFormAddress.trim(),
          location: userFormLocation || location,
          password: userFormPassword || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserProfile(data.user);
        safeStorage.setItem('abugoura_user_profile', JSON.stringify(data.user));
        setUserFormSuccess('تم تحديث بيانات ملفك الشخصي بنجاح!');
        showToast('تم تحديث ملفك الشخصي بنجاح 👤', 'success');
        setTimeout(() => {
          setUserAuthModal(null);
          clearUserForm();
        }, 1500);
      } else {
        setUserFormError(data.error || 'فشل تحديث البيانات.');
      }
    } catch (err) {
      console.error(err);
      setUserFormError('فشل الاتصال بالخادم لتعديل البيانات.');
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleUserLogout = () => {
    setIsUserLoggedIn(false);
    setUserProfile(null);
    setUserToken('');
    safeStorage.removeItem('abugoura_user_logged_in');
    safeStorage.removeItem('abugoura_user_profile');
    safeStorage.removeItem('abugoura_user_token');

    // Clear auto-filled checkout inputs too
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');

    showToast('تم تسجيل الخروج بنجاح. سنفتقدك! 👋', 'info');
    setUserAuthModal(null);
    clearUserForm();
  };

  const clearUserForm = () => {
    setUserFormPhone('');
    setUserFormPassword('');
    setUserFormName('');
    setUserFormAddress('');
    setUserFormLocation(null);
    setUserFormError('');
    setUserFormSuccess('');
  };

  const openUserProfile = () => {
    if (userProfile) {
      setUserFormName(userProfile.name);
      setUserFormPhone(userProfile.phoneNumber);
      setUserFormAddress(userProfile.address);
      setUserFormLocation(userProfile.location || null);
      setUserAuthModal('profile');
    } else {
      setUserAuthModal('login');
    }
  };

  // --- CUSTOM IN-APP TOAST SYSTEM ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimeoutRef = React.useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    // Auto Dismiss after 4.5 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderTimeFilter, setOrderTimeFilter] = useState<string>('all');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const lastTopOrderIdRef = React.useRef<string | null>(null);
  const isFirstFetchRef = React.useRef<boolean>(true);


  // Checkout Success State
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<Order | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Ratings & Reviews State
  const [dbRatings, setDbRatings] = useState<Rating[]>([]);
  const [selectedUserRating, setSelectedUserRating] = useState<number>(0);
  const [ratedItems, setRatedItems] = useState<{ [key: string]: boolean }>(() => {
    const storedRated = safeStorage.getItem('abugoura_rated_items');
    if (storedRated) {
      try {
        const parsed = JSON.parse(storedRated);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Helper to calculate a deterministic high-quality starting rating for social proof
  const getSeedRating = (menuItemId: string) => {
    let hash = 0;
    for (let i = 0; i < menuItemId.length; i++) {
      hash = menuItemId.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const countSeed = 10 + (hash % 20); // 10 to 29 reviews
    const avgSeed = 4.6 + ((hash % 8) / 20); // 4.6 to 4.95 stars
    return { average: parseFloat(avgSeed.toFixed(1)), count: countSeed };
  };

  // Memoized stats merging DB ratings with seeds
  const ratingsStats = useMemo(() => {
    const stats: { [key: string]: { average: number; count: number } } = {};
    
    // Group actual database ratings by menuItemId
    const dbGroups: { [key: string]: number[] } = {};
    dbRatings.forEach((r) => {
      if (!r || !r.menuItemId || typeof r.rating !== 'number') return;
      if (!dbGroups[r.menuItemId]) {
        dbGroups[r.menuItemId] = [];
      }
      dbGroups[r.menuItemId].push(r.rating);
    });

    // Compute stats for all menuItems
    menuItems.forEach((item) => {
      const seed = getSeedRating(item.id);
      const actualRatings = dbGroups[item.id] || [];
      if (actualRatings.length === 0) {
        stats[item.id] = seed;
      } else {
        const totalSum = (seed.average * seed.count) + actualRatings.reduce((sum, val) => sum + val, 0);
        const totalCount = seed.count + actualRatings.length;
        stats[item.id] = {
          average: parseFloat((totalSum / totalCount).toFixed(1)),
          count: totalCount
        };
      }
    });

    return stats;
  }, [dbRatings, menuItems]);

  // standard additions available for items
  const additionsList = [
    { name: 'باكت بطاطس مقرمشة', price: 15 },
    { name: 'صوص طحينة إضافي', price: 10 },
    { name: 'صوص ثومية إضافي', price: 10 },
    { name: 'صوص دقوس مندي', price: 10 },
    { name: 'مخلل مشكل بلدي', price: 10 },
    { name: 'عيش بلدي ساخن', price: 5 }
  ];

  // --- REQUISITE INITS ---
  useEffect(() => {
    const initApp = async () => {
      // Check if an admin exists on start
      const exists = await fetchAdminStatus();
      
      // Load system settings (whatsapp, etc)
      fetchSettings();

      // Check for /admin_user route
      const currentPath = window.location.pathname;
      if (currentPath === '/admin_user') {
        const storedAdminLoggedIn = safeStorage.getItem('abugoura_admin_logged_in') === 'true';
        if (storedAdminLoggedIn) {
          setActiveTab('admin');
        } else {
          if (exists === false) {
            setAdminAuthModal('register');
          } else {
            setAdminAuthModal('login');
          }
        }
        
        // Remove the /admin_user from URL to prevent staying on it if refreshed
        try {
          const cleanUrl = window.location.protocol + "//" + window.location.host + "/";
          window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        } catch (e) {}
      }

      // Fetch food ratings
      fetchRatings();
    };

    initApp();
  }, []);

  useEffect(() => {
    safeStorage.setItem('abugoura_cart', JSON.stringify(cart));
  }, [cart]);

  // Auto-fill checkout fields with logged in user profile details
  useEffect(() => {
    if (userProfile) {
      setCustomerName(userProfile.name || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setAddress(userProfile.address || '');
      if (userProfile.location) {
        setLocation(userProfile.location);
      }
    }
  }, [userProfile]);

  // If logged in, fetch orders periodically as a fallback
  useEffect(() => {
    let interval: any;
    if (isAdminLoggedIn) {
      fetchOrders();
      interval = setInterval(fetchOrders, 30000); // fallback polling every 30s
    }
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  // Real-time socket connections for immediate UI updates (admins and tracking customers)
  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('📡 Connected to Abu Qura real-time WebSockets');
    });

    socket.on('order-created', (newOrder) => {
      console.log('🔔 WebSocket: New order created:', newOrder);

      // 1. If admin is logged in, append immediately to top of orders list
      if (isAdminLoggedInRef.current) {
        const alreadyExists = ordersRef.current.some((o) => o._id === newOrder._id);
        if (!alreadyExists) {
          playNotificationSound();
          if (showToastRef.current) {
            showToastRef.current(`🎉 تم استقبال طلب جديد رقم #${newOrder._id.slice(-5).toUpperCase()} من العميل ${newOrder.customerName}!`, 'success');
          }
          setOrders((prev) => [newOrder, ...prev]);
        }
      }

      // 2. If customer is tracking their orders, append if it belongs to their searched phone number
      setTrackedOrders((prev) => {
        if (prev.length > 0) {
          const trackedPhone = prev[0].phoneNumber;
          if (newOrder.phoneNumber === trackedPhone) {
            if (prev.some((o) => o._id === newOrder._id)) return prev;
            return [newOrder, ...prev];
          }
        }
        return prev;
      });
    });

    socket.on('order-status-updated', ({ orderId, status }) => {
      console.log('🔔 WebSocket: Order status updated:', orderId, status);

      // Update in admin dashboard list
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );

      // Check if it's one of my orders (placed or searched in this browser)
      let isMyOrder = false;
      try {
        const stored = safeStorage.getItem('abugoura_my_order_ids');
        let myOrderIds = [];
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            myOrderIds = parsed;
          }
        }
        isMyOrder = myOrderIds.includes(orderId);
      } catch (e) {
        console.error('Failed to parse my_order_ids:', e);
      }

      // Get current tracked orders from the ref to avoid stale closures
      const currentTracked = trackedOrdersRef.current;
      const isTrackingThisOrder = currentTracked.some((o) => o._id === orderId);
      const existingOrder = currentTracked.find((o) => o._id === orderId);

      // Only trigger side effects if the status has actually changed!
      if ((isTrackingThisOrder || isMyOrder) && (!existingOrder || existingOrder.status !== status)) {
        const friendlyStatus = 
          status === 'preparing' ? 'جاري التحضير بالمطبخ 👨‍🍳' :
          status === 'delivered' ? 'تم التسليم بنجاح ✅' :
          status === 'cancelled' ? 'ملغي من الإدارة ❌' :
          'بانتظار الموافقة ⏳';
        
        const title = `🛵 تحديث حالة طلبك #${orderId.slice(-5).toUpperCase()}`;
        const body = `حالة طلبك الآن: ${friendlyStatus}`;

        // Trigger side-effects directly in the socket event handler, avoiding any side-effects in render/state cycles!
        if (showToastRef.current) {
          showToastRef.current(`${title}: ${friendlyStatus}`, 'info');
        }
        playNotificationSound();
        sendBrowserNotification(title, body);
      }

      // Update tracked orders state
      setTrackedOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    });

    socket.on('order-deleted', ({ orderId }) => {
      console.log('🔔 WebSocket: Order deleted:', orderId);

      // Remove from admin dashboard lists
      setOrders((prev) => prev.filter((o) => o._id !== orderId));

      // Remove from active client-side tracking lists
      setTrackedOrders((prev) => prev.filter((o) => o._id !== orderId));
    });

    socket.on('order-migrated', ({ oldId, newOrder }) => {
      console.log('📡 WebSocket: Order migrated from offline ID:', oldId, 'to cloud ID:', newOrder._id);

      // Update admin orders list
      setOrders((prev) =>
        prev.map((o) => (o._id === oldId ? newOrder : o))
      );

      // Update customer tracking list
      setTrackedOrders((prev) =>
        prev.map((o) => (o._id === oldId ? newOrder : o))
      );

      // Update client-side local storage mapped IDs
      try {
        const stored = safeStorage.getItem('abugoura_my_order_ids');
        if (stored) {
          const myOrderIds = JSON.parse(stored);
          if (Array.isArray(myOrderIds)) {
            const index = myOrderIds.indexOf(oldId);
            if (index !== -1) {
              myOrderIds[index] = newOrder._id;
              safeStorage.setItem('abugoura_my_order_ids', JSON.stringify(myOrderIds));
            }
          }
        }
      } catch (e) {
        console.error('Failed to update local storage my_order_ids on migration:', e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings');
      if (res.ok) {
        const data = await res.json();
        setDbRatings(data);
      }
    } catch (err: any) {
      console.warn('⚠️ Transient network delay when fetching ratings:', err.message || err);
    }
  };

  const submitRating = async (menuItemId: string, rating: number) => {
    if (rating < 1 || rating > 5) return;
    setIsSubmittingRating(true);
    setRatingFeedback('');
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId, rating })
      });
      if (res.ok) {
        const data = await res.json();
        const newRating = (data.rating && data.rating.menuItemId)
          ? data.rating
          : { menuItemId, rating, _id: data.rating?._id || String(Date.now()) };
        setDbRatings((prev) => [...prev, newRating]);
        
        const updatedRated = { ...ratedItems, [menuItemId]: true };
        setRatedItems(updatedRated);
        safeStorage.setItem('abugoura_rated_items', JSON.stringify(updatedRated));

        setRatingFeedback('شكرًا لتقييمك الرائع! تم حفظ رأيك بنجاح لدعم مستوى جودتنا.');
        setTimeout(() => setRatingFeedback(''), 4000);
      } else {
        setRatingFeedback('عذرًا، حدث خطأ أثناء حفظ تقييمك. الرجاء المحاولة مجددًا.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setRatingFeedback('فشل الاتصال بالخادم لإرسال التقييم.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const fetchAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      setAdminExists(data.exists);
      return data.exists;
    } catch (err: any) {
      console.warn('⚠️ Transient network delay when checking admin status:', err.message || err);
      return false;
    }
  };

  const handleOpenAdminPortal = async () => {
    const exists = await fetchAdminStatus();
    if (exists) {
      setAdminAuthModal('login');
    } else {
      setAdminAuthModal('register');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Transient network delay when fetching settings:', err.message || err);
    }
  };

  const handleSaveSettings = async (num: string) => {
    setIsSavingSettings(true);
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ whatsappNumber: num })
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
          showToast('تم حفظ رقم الواتساب بنجاح في الإعدادات! 📱', 'success');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'حدث خطأ أثناء حفظ الإعدادات.', 'error');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('فشل الاتصال بالخادم لحفظ الإعدادات.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchOrders = async () => {
    const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
    if (!token) {
      if (isAdminLoggedIn) {
        handleLogout(false);
      }
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        
        if (data.length > 0) {
          const topOrderId = data[0]._id;
          if (!isFirstFetchRef.current && lastTopOrderIdRef.current && topOrderId !== lastTopOrderIdRef.current) {
            playNotificationSound();
          }
          lastTopOrderIdRef.current = topOrderId;
        }
        
        if (isFirstFetchRef.current) {
          isFirstFetchRef.current = false;
        }

        setOrders(data);
      }
    } catch (err: any) {
      console.warn('⚠️ Transient network delay when fetching orders:', err.message || err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // --- ACTIONS ---

  // Trigger high accuracy Geolocation with robust fallbacks
  const handleLocateUser = () => {
    if (locatingState === 'locating') return;

    if (!navigator.geolocation) {
      fallbackToIpLocation('متصفحك لا يدعم تحديد الموقع الجغرافي تلقائياً.');
      return;
    }

    setLocatingState('locating');
    setGpsErrorMsg('');

    // Phase 1: Try high accuracy first (with short timeout to fail fast to Phase 2 if unsupported)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocatingState('success');
      },
      (error) => {
        console.warn('Phase 1 High Accuracy Geolocation failed. Code:', error.code, 'Msg:', error.message);
        
        // Phase 2: Try with high accuracy disabled (works better on devices without GPS chips and inside iframes)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
            setLocatingState('success');
          },
          (err) => {
            console.warn('Phase 2 Low Accuracy Geolocation failed. Code:', err.code, 'Msg:', err.message);
            
            // Phase 3: Try IP Geolocation lookup fallback (bulletproof inside restricted iframes!)
            let defaultErrorMsg = 'تعذر الحصول على موقعك بدقة عبر مستشعرات الجهاز.';
            if (err.code === err.PERMISSION_DENIED) {
              defaultErrorMsg = 'تم رفض إذن تحديد الموقع الجغرافي.';
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              defaultErrorMsg = 'الموقع الجغرافي غير متوفر عبر مستشعرات جهازك.';
            } else if (err.code === err.TIMEOUT) {
              defaultErrorMsg = 'انتهت مهلة جلب إحداثيات الموقع الجغرافي.';
            }
            
            fallbackToIpLocation(`${defaultErrorMsg} تم جلب موقعك التقريبي عبر الإنترنت لمساعدتك.`);
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 4000, // Wait 4s then try Phase 2
        maximumAge: 0
      }
    );
  };

  // Completely bulletproof fallback using public IP geolocation services
  const fallbackToIpLocation = async (userNotice: string) => {
    try {
      console.log('Attempting IP Geolocation fallback...');
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 5000 // 5km accuracy
          });
          setLocatingState('success');
          setGpsErrorMsg(userNotice);
          return;
        }
      }
    } catch (e) {
      console.warn('IP Geolocation fallback 1 failed:', e);
    }

    try {
      const response = await fetch('https://ip-api.com/json/');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.lat === 'number' && typeof data.lon === 'number') {
          setLocation({
            latitude: data.lat,
            longitude: data.lon,
            accuracy: 10000 // 10km accuracy
          });
          setLocatingState('success');
          setGpsErrorMsg(userNotice);
          return;
        }
      }
    } catch (e) {
      console.warn('IP Geolocation fallback 2 failed:', e);
    }

    // Ultimate fallback if everything failed: set to October Gardens default and let user choose manually
    setLocation({
      latitude: 29.9115778,
      longitude: 31.0589758,
      accuracy: 15000
    });
    setLocatingState('error');
    setGpsErrorMsg('عذراً، تعذر تحديد موقعك تلقائياً حتى عبر شبكة الإنترنت. تم وضع الدبوس بحدائق أكتوبر، يمكنك سحبه يدوياً للموقع الصحيح.');
  };

  // Open item customizer
  const openCustomizer = (item: MenuItem) => {
    if (item.isAvailable === false) {
      showToast('عذراً، هذا الصنف غير متوفر حالياً.', 'error');
      return;
    }
    setCustomizingItem(item);
    setCustomQuantity(1);
    setSelectedAdditions([]);
    setSelectedUserRating(0);
    setRatingFeedback('');
    if (item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0]);
    } else {
      setSelectedSize('');
    }
  };

  // Calculate customized item unit price
  const getCustomizedUnitPrice = () => {
    if (!customizingItem) return 0;
    if (typeof customizingItem.price === 'number') {
      return customizingItem.price;
    } else if (selectedSize) {
      return customizingItem.price[selectedSize] || 0;
    }
    return 0;
  };

  const getCustomizedTotalSinglePrice = () => {
    const base = getCustomizedUnitPrice();
    const additionsTotal = selectedAdditions.reduce((sum, add) => sum + add.price, 0);
    return base + additionsTotal;
  };

  // Add customized item to cart
  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;

    const unitPrice = getCustomizedUnitPrice();
    const additionsPrice = selectedAdditions.reduce((sum, add) => sum + add.price, 0);
    const itemTotalSingle = unitPrice + additionsPrice;

    // Unique key for matching identical configs
    const additionsKey = selectedAdditions
      .map((a) => a.name)
      .sort()
      .join(',');
    const cartInstanceId = `${customizingItem.id}-${selectedSize}-${additionsKey}`;

    const existingIndex = cart.findIndex((c) => c.id === cartInstanceId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += customQuantity;
      setCart(updated);
    } else {
      const newCartItem: CartItem = {
        id: cartInstanceId,
        menuItemId: customizingItem.id,
        name: customizingItem.name,
        selectedSize: selectedSize || undefined,
        unitPrice: itemTotalSingle,
        quantity: customQuantity,
        additions: selectedAdditions
      };
      setCart([...cart, newCartItem]);
    }

    setCustomizingItem(null);
    setIsCartOpen(true); // show the beautiful sidebar cart
  };

  const handleToggleAddition = (add: { name: string; price: number }) => {
    if (selectedAdditions.some((item) => item.name === add.name)) {
      setSelectedAdditions(selectedAdditions.filter((item) => item.name !== add.name));
    } else {
      setSelectedAdditions([...selectedAdditions, add]);
    }
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 0 : newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Submit order to API
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      showToast('يرجى ملء جميع البيانات الأساسية لتوصيل طلبك.', 'error');
      return;
    }

    if (isSubmittingOrder) return;

    // Check if any item in the cart is currently marked as unavailable
    const unavailableItemsInCart = cart.filter(cartItem => {
      const dbItem = menuItems.find(m => m.id === cartItem.menuItemId);
      return dbItem && dbItem.isAvailable === false;
    });

    if (unavailableItemsInCart.length > 0) {
      const names = unavailableItemsInCart.map(i => `"${i.name}"`).join('، ');
      showToast(`عذراً، الأصناف التالية غير متوفرة حالياً: ${names}. يرجى إزالتها من السلة لتتمكن من إرسال طلبك.`, 'error');
      return;
    }

    // Normalize phone number (convert Eastern Arabic digits and strip non-numeric characters)
    const convertedPhone = convertArabicToEnglishNumerals(phoneNumber);
    const cleanPhone = convertedPhone.trim().replace(/[^\d]/g, '');

    // Phone format validator (allows Egyptian mobile or international formats, from 8 to 15 digits)
    if (!/^\d{8,15}$/.test(cleanPhone)) {
      showToast('يرجى إدخال رقم هاتف صحيح ليتواصل معك الطيار (من 8 إلى 15 رقم)', 'error');
      return;
    }

    setIsSubmittingOrder(true);

    const orderPayload = {
      customerName: customerName.trim(),
      phoneNumber: cleanPhone,
      address: address.trim(),
      location: location, // coordinate location
      items: cart,
      totalPrice: cartTotal,
      customNotes: customNotes.trim()
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save order ID to our tracking registry
        try {
          const stored = safeStorage.getItem('abugoura_my_order_ids');
          let currentIds = [];
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              currentIds = parsed;
            }
          }
          if (!currentIds.includes(data.orderId)) {
            currentIds.push(data.orderId);
            safeStorage.setItem('abugoura_my_order_ids', JSON.stringify(currentIds));
          }
        } catch (e) {
          console.error('Failed to register order ID:', e);
        }

        // Proactively ask for notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            setNotificationPermission(perm);
            if (perm === 'granted') {
              sendBrowserNotification(
                '⏳ تم إرسال طلبك للمطبخ بنجاح!',
                'سنقوم بتنبيهك فور تغير حالة طلبك من قبل الشيف أو الموزع.'
              );
            }
          }).catch((err) => {
            console.error('Failed to request notification permission:', err);
          });
        }

        // Success
        setLastSubmittedOrder({
          ...orderPayload,
          _id: data.orderId,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        setCart([]);
        setCustomerName('');
        setPhoneNumber('');
        setAddress('');
        setCustomNotes('');
        setLocation(null);
        setLocatingState('idle');
        setIsCartOpen(false);
        setIsOrderSuccessOpen(true);

        // Try playing a gentle chime
        playSuccessSound();
      } else {
        showToast('حدث خطأ أثناء إرسال طلبك: ' + (data.error || 'خطأ غير معروف'), 'error');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      showToast('فشل الاتصال بخادم مطعم أبو قورة. يرجى التحقق من اتصالك بالإنترنت.', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Authentication handlers
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    const isRegistrationOrReset = isResetMode || !adminExists;
    if (isRegistrationOrReset && !authSecurityCode.trim()) {
      setAuthError('الرجاء إدخال رمز الأمان الاستردادي لإتمام العملية.');
      return;
    }

    const endpoint = isResetMode 
      ? '/api/admin/reset' 
      : (adminExists ? '/api/admin/login' : '/api/admin/register');

    const payload: any = { 
      username: authUsername.trim(), 
      password: authPassword 
    };

    if (isRegistrationOrReset) {
      payload.securityCode = authSecurityCode.trim();
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminLoggedIn(true);
        const resolvedUsername = data.username || authUsername;
        const token = data.token || '';
        setAdminUser(resolvedUsername);
        setAdminToken(token);
        
        // Save to safeStorage for persistent session
        safeStorage.setItem('abugoura_admin_logged_in', 'true');
        safeStorage.setItem('abugoura_admin_user', resolvedUsername);
        safeStorage.setItem('abugoura_admin_token', token);

        if (isResetMode) {
          setIsResetMode(false);
          showToast('تم إعادة تعيين حساب المسؤول بنجاح! تم تسجيل دخولك بالبيانات الجديدة. 🔑', 'success');
        } else if (!adminExists) {
          showToast('تم إنشاء وتأمين حساب المسؤول بنجاح! احتفظ برمز الأمان جيداً. 🔐', 'success');
        }

        setAdminAuthModal(null);
        setAuthUsername('');
        setAuthPassword('');
        setAuthSecurityCode('');
        fetchAdminStatus(); // refresh flag
        fetchOrders();
        setActiveTab('admin');
      } else {
        setAuthError(data.error || 'فشلت العملية. تحقق من البيانات المدخلة.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError('خطأ بالاتصال بالخادم.');
    }
  };

  // Update admin credentials
  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccessMsg('');
    setAuthError('');

    if (!editCurrentPassword) {
      setAuthError('يرجى إدخال كلمة المرور الحالية لتأكيد التعديلات.');
      return;
    }

    const payload = {
      oldUsername: adminUser,
      newUsername: editNewUsername || undefined,
      currentPassword: editCurrentPassword,
      newPassword: editNewPassword || undefined,
      newSecurityCode: editNewSecurityCode || undefined
    };

    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch('/api/admin/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setEditSuccessMsg('تم تحديث بيانات حساب الأدمن بنجاح!');
        setAdminUser(data.username);
        setEditNewUsername('');
        setEditCurrentPassword('');
        setEditNewPassword('');
        setEditNewSecurityCode('');
        setTimeout(() => {
          setIsEditingAdmin(false);
          setEditSuccessMsg('');
        }, 2000);
      } else {
        setAuthError(data.error || 'فشل تحديث البيانات.');
      }
    } catch (err) {
      setAuthError('حدث خطأ أثناء تحديث بيانات حساب الإدارة.');
    }
  };

  // Update order status on the server
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }

      if (res.ok) {
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
        showToast('تم تحديث حالة الطلب بنجاح! 📦', 'success');
      } else {
        const data = await res.json();
        showToast('فشل تحديث حالة الطلب: ' + data.error, 'error');
      }
    } catch (err) {
      console.error('Failed status update:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }

      if (res.ok) {
        setOrders((prevOrders) => prevOrders.filter((o) => o._id !== orderId));
        showToast('تم حذف الطلب بنجاح. 🗑️', 'success');
      } else {
        const data = await res.json();
        showToast('فشل حذف الطلب: ' + data.error, 'error');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  // --- MENU & CATEGORY ADMIN ACTIONS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsCategorySubmitting(true);
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        showToast('تم إضافة القسم الجديد بنجاح! 🎉', 'success');
        setNewCategoryName('');
        fetchMenu();
      } else {
        showToast(data.error || 'فشلت إضافة القسم.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ بالاتصال بالخادم.', 'error');
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    requestConfirm(
      'تأكيد حذف القسم',
      'هل أنت متأكد من حذف هذا القسم بالكامل؟ لن يتم حذف الأصناف المرتبطة به تلقائياً ولكن يفضل تعديل أقسامها.',
      async () => {
        try {
          const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
          const res = await fetch(`/api/menu/categories/${catId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.status === 401) {
            handleLogout(true);
            return;
          }
          const data = await res.json();
          if (res.ok) {
            showToast('تم حذف القسم بنجاح. 🗑️', 'success');
            fetchMenu();
          } else {
            showToast(data.error || 'فشل حذف القسم.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('خطأ بالاتصال بالخادم.', 'error');
        }
      }
    );
  };

  const handleUpdateCategory = async (catId: string, name: string) => {
    if (!name.trim()) return;
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch(`/api/menu/categories/${catId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        showToast('تم تعديل القسم بنجاح! ✏️', 'success');
        setEditingCategoryId(null);
        fetchMenu();
      } else {
        showToast(data.error || 'فشل تعديل القسم.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ بالاتصال بالخادم.', 'error');
    }
  };

  const handleToggleMenuItemAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const res = await fetch(`/api/menu/items/${itemId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentAvailable })
      });
      if (res.status === 401) {
        handleLogout(true);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        // Update local state instantly for extreme responsiveness
        setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, isAvailable: !currentAvailable } : item));
        showToast(`تم ${!currentAvailable ? 'تفعيل' : 'إلغاء تفعيل'} الصنف بنجاح.`, 'success');
      } else {
        showToast(data.error || 'فشل تعديل حالة الصنف.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ بالاتصال بالخادم.', 'error');
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    requestConfirm(
      'تأكيد حذف الصنف',
      'هل أنت متأكد من حذف هذا الصنف نهائياً من القائمة؟',
      async () => {
        try {
          const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
          const res = await fetch(`/api/menu/items/${itemId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.status === 401) {
            handleLogout(true);
            return;
          }
          const data = await res.json();
          if (res.ok) {
            showToast('تم حذف الصنف بنجاح. 🗑️', 'success');
            fetchMenu();
          } else {
            showToast(data.error || 'فشل حذف الصنف.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('خطأ بالاتصال بالخادم.', 'error');
        }
      }
    );
  };

  const openMenuItemModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingMenuItem(item);
      const isWeight = typeof item.price !== 'number';
      setMenuItemForm({
        name: item.name,
        category: item.category,
        description: item.description || '',
        price: isWeight ? 0 : (item.price as number),
        hasMultipleSizes: isWeight,
        sizes: item.sizes || [],
        sizePrices: isWeight ? { ...(item.price as { [key: string]: number }) } : {},
        image: item.rawImage || '',
        isAvailable: item.isAvailable !== false
      });
    } else {
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '',
        category: categories.find(c => c.id !== 'all')?.id || categories[0]?.id || '',
        description: '',
        price: 0,
        hasMultipleSizes: false,
        sizes: [],
        sizePrices: {},
        image: '',
        isAvailable: true
      });
    }
    setIsMenuItemModalOpen(true);
  };

  const handleSubmitMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemForm.name.trim() || !menuItemForm.category) {
      showToast('يرجى ملء الحقول الأساسية: الاسم والقسم.', 'error');
      return;
    }

    // Prepare price field based on size structure
    let finalPrice: any = menuItemForm.price;
    let finalSizes: string[] = [];

    if (menuItemForm.hasMultipleSizes) {
      if (Object.keys(menuItemForm.sizePrices).length === 0) {
        showToast('يرجى تحديد سعر واحد على الأقل للأحجام المتعددة.', 'error');
        return;
      }
      finalPrice = menuItemForm.sizePrices;
      finalSizes = menuItemForm.sizes;
    }

    const payload = {
      name: menuItemForm.name.trim(),
      category: menuItemForm.category,
      description: menuItemForm.description.trim(),
      price: finalPrice,
      sizes: finalSizes,
      image: menuItemForm.image.trim(),
      isAvailable: menuItemForm.isAvailable
    };

    try {
      const token = adminToken || safeStorage.getItem('abugoura_admin_token') || '';
      const url = editingMenuItem 
        ? `/api/menu/items/${editingMenuItem.id}`
        : '/api/menu/items';
      const method = editingMenuItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        handleLogout(true);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        showToast(editingMenuItem ? 'تم تعديل الصنف بنجاح! ✏️' : 'تم إضافة الصنف الجديد بنجاح! ➕', 'success');
        setIsMenuItemModalOpen(false);
        setEditingMenuItem(null);
        fetchMenu();
      } else {
        showToast(data.error || 'فشلت العملية.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ بالاتصال بالخادم.', 'error');
    }
  };

  // Log out admin
  const handleLogout = (isSessionExpired = false) => {
    setIsAdminLoggedIn(false);
    setAdminUser('');
    setAdminToken('');
    safeStorage.removeItem('abugoura_admin_logged_in');
    safeStorage.removeItem('abugoura_admin_user');
    safeStorage.removeItem('abugoura_admin_token');
    safeStorage.removeItem('abugoura_show_admin_entry');
    setActiveTab('client');
    if (isSessionExpired === true) {
      showToast('⚠️ انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى لتأمين حسابك.', 'error');
    } else {
      showToast('تم تسجيل الخروج بنجاح.', 'info');
    }
  };

  // Search Tracked Orders securely by phone number
  const handleSearchTrackOrders = async () => {
    if (!trackPhoneNumber.trim()) {
      showToast('الرجاء إدخال رقم الهاتف للبحث عن طلباتك.', 'error');
      return;
    }

    const cleanSearchPhone = convertArabicToEnglishNumerals(trackPhoneNumber).trim().replace(/[^\d]/g, '');

    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(cleanSearchPhone)}`);
      if (res.ok) {
        const userOrders: Order[] = await res.json();
        setTrackedOrders(userOrders);
        setIsTrackSearched(true);
        if (userOrders.length > 0) {
          showToast(`تم العثور على ${userOrders.length} طلبات لحسابك! 🔍`, 'success');

          // Register returned order IDs into tracking registry for background notifications
          try {
            const stored = safeStorage.getItem('abugoura_my_order_ids');
            let currentIds = [];
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) {
                currentIds = parsed;
              }
            }
            userOrders.forEach((o) => {
              if (o._id && !currentIds.includes(o._id)) {
                currentIds.push(o._id);
              }
            });
            safeStorage.setItem('abugoura_my_order_ids', JSON.stringify(currentIds));
          } catch (e) {
            console.error('Failed to register search order IDs:', e);
          }
        } else {
          showToast('لم يتم العثور على أي طلبات لهذا الرقم.', 'info');
        }

        // Proactively ask for notification permission on searching if default
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            setNotificationPermission(perm);
          }).catch((err) => {
            console.error('Failed to request notification permission:', err);
          });
        }
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'حدث خطأ أثناء جلب الطلبات من خادم مطعم أبو قورة.', 'error');
      }
    } catch (err) {
      console.error('Error searching track orders:', err);
      showToast('فشل الاتصال بخادم مطعم أبو قورة لجلب طلباتك.', 'error');
    }
  };

  // --- FILTERS & COMPUTATIONS ---
  const filteredMenuItems = useMemo(() => {
    const normalizedQuery = normalizeArabic(searchQuery);
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        normalizeArabic(item.name).includes(normalizedQuery) ||
        (item.description && normalizeArabic(item.description).includes(normalizedQuery));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, menuItems]);

  const itemsToDisplay = useMemo(() => {
    if (selectedCategory === 'all') {
      return filteredMenuItems.slice(0, visibleItemsCount);
    }
    return filteredMenuItems;
  }, [filteredMenuItems, selectedCategory, visibleItemsCount]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = normalizeArabic(orderSearchQuery);
    return orders.filter((order) => {
      const matchesSearch =
        normalizeArabic(order.customerName).includes(normalizedQuery) ||
        order.phoneNumber.includes(orderSearchQuery);
      const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus;
      
      let matchesTime = true;
      if (orderTimeFilter !== 'all' && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (orderTimeFilter) {
          case 'today':
            matchesTime = orderDate >= startOfToday;
            break;
          case 'yesterday': {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            matchesTime = orderDate >= startOfYesterday && orderDate < startOfToday;
            break;
          }
          case 'thisWeek': {
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            matchesTime = orderDate >= startOfWeek;
            break;
          }
          case 'thisMonth': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            matchesTime = orderDate >= startOfMonth;
            break;
          }
          case 'thisYear': {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            matchesTime = orderDate >= startOfYear;
            break;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [orders, orderSearchQuery, orderFilterStatus, orderTimeFilter]);

  // Admin dashboard metrics
  const adminMetrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const total = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const count = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const preparing = orders.filter((o) => o.status === 'preparing').length;
    const completed = orders.filter((o) => o.status === 'delivered').length;
    const average = activeOrders.length > 0 ? Math.round(total / activeOrders.length) : 0;
    return { total, count, pending, preparing, completed, average };
  }, [orders]);

  // Chart structures
  const ordersChartData = useMemo(() => {
    // Generate order history chart grouping actual database data chronologically by day
    const groups: { [key: string]: { date: string; amount: number; count: number; rawDate: Date } } = {};

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return;
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      if (!groups[dateStr]) {
        groups[dateStr] = { date: dateStr, amount: 0, count: 0, rawDate: startOfDay };
      }
      if (o.status !== 'cancelled') {
        groups[dateStr].amount += o.totalPrice;
      }
      groups[dateStr].count += 1;
    });

    const result = Object.values(groups).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    if (result.length === 0) {
      return [
        { date: 'اليوم', amount: 0, count: 0 }
      ];
    }
    return result;
  }, [orders]);

  const categoryPopularityData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      if (!Array.isArray(o.items)) return;
      o.items.forEach((item) => {
        // match menu item's category name
        const match = menuItems.find((m) => m.id === item.menuItemId);
        const catId = match?.category || 'أخرى';
        const friendlyName = categories.find((c) => c.id === catId)?.name || 'أخرى';
        counts[friendlyName] = (counts[friendlyName] || 0) + item.quantity;
      });
    });

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [orders, menuItems, categories]);

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-gray-900 font-sans antialiased flex flex-col dir-rtl relative pb-28" style={{ direction: 'rtl' }}>
      
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-[1001] bg-white/95 backdrop-blur-xl border-b border-stone-200/40 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] transition-all">
        {/* Dynamic golden modern accent line */}
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Abu Goura Smiling Chef Logo */}
            <div 
              onClick={() => setActiveTab('client')}
              title="مطعم أبو قورة"
              className="transform hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer select-none"
            >
              <AbuGouraLogo className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div>
              <h1 className="font-sans text-lg sm:text-xl font-black text-stone-950 tracking-tight flex items-center gap-1 leading-none">
                أبو قورة
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse-glow" />
              </h1>
              <p className="text-[9px] text-amber-800 font-extrabold tracking-wide mt-1">مطبخ المشويات والبلدي الأصيل • كرم وجود زمان</p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Row */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'client'
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-800 bg-stone-100 hover:bg-stone-150 border border-stone-200/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>قائمة الأكلات</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('track');
                setIsTrackSearched(false);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'track'
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-800 bg-stone-100 hover:bg-stone-150 border border-stone-200/20'
              }`}
            >
              <Navigation className="w-4 h-4 text-amber-500" />
              <span>تتبع طلبي 🛵</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer text-stone-800 bg-stone-100 hover:bg-stone-150 border border-stone-200/20 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4 text-amber-550" />
              <span>السلة</span>
              {cart.length > 0 && (
                <span className="bg-amber-650 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black animate-pulse">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Account / Profile Button */}
            <button
              onClick={openUserProfile}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isUserLoggedIn
                  ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-600/20'
                  : 'text-stone-800 bg-stone-100 hover:bg-stone-150 border border-stone-200/20'
              }`}
            >
              <User className="w-4 h-4 text-stone-900" />
              <span>{isUserLoggedIn && userProfile ? `أهلاً، ${userProfile.name.split(' ')[0]}` : 'حسابي 👤'}</span>
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5 border-r border-stone-200 mr-1.5 pr-1.5">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-stone-950 shadow-md border border-amber-600/20'
                      : 'text-stone-800 bg-stone-100 hover:bg-amber-50 border border-stone-200/50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  لوحة التحكم
                </button>
                <button
                  onClick={() => handleLogout()}
                  title="تسجيل الخروج"
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile Admin Entry Quick Button */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* User Account / Profile Button for Mobile */}
            <button
              onClick={openUserProfile}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isUserLoggedIn
                  ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-600/20'
                  : 'text-stone-800 bg-stone-100 hover:bg-stone-150 border border-stone-200/20'
              }`}
              title="حسابي"
            >
              <User className="w-4 h-4 text-stone-900" />
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('admin')}
                  className="p-2 text-amber-500 bg-stone-950 hover:bg-stone-900 rounded-full transition-all"
                  title="لوحة التحكم"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLogout()}
                  title="تسجيل الخروج"
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </header>

      {/* FLOATING BOTTOM NAVIGATION BAR (Figma Native Feel) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1002] bg-stone-950/95 text-white px-6 py-3 rounded-[32px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/10 backdrop-blur-md max-w-sm w-[90%] justify-around transition-all duration-300">
        <button
          onClick={() => setActiveTab('client')}
          className={`p-1.5 rounded-full transition-all flex flex-col items-center gap-1 ${
            activeTab === 'client' ? 'text-amber-400 scale-110' : 'text-stone-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] font-black">قائمة الأكلات</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('track');
            setIsTrackSearched(false);
          }}
          className={`p-1.5 rounded-full transition-all flex flex-col items-center gap-1 ${
            activeTab === 'track' ? 'text-amber-400 scale-110' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[9px] font-black">تتبع الطلبات</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-1.5 rounded-full transition-all flex flex-col items-center gap-1 text-stone-400 hover:text-white"
        >
          <ShoppingCart className="w-5 h-5 text-amber-400" />
          <span className="text-[9px] font-black">سلة مأكولاتك</span>
          {cart.length > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-red-650 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>

        {isAdminLoggedIn && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`p-1.5 rounded-full transition-all flex flex-col items-center gap-1 ${
              activeTab === 'admin' ? 'text-amber-400 scale-110' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-black">لوحة التحكم</span>
          </button>
        )}
      </div>

      {/* HERO PROMOTIONAL BANNER */}
      {activeTab === 'client' && (
        <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white overflow-hidden py-10 sm:py-16 border-b border-amber-500/10 shadow-xl">
          {/* Decorative geometric Arabic pattern corners */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,#d97706_0%,transparent_60%)] opacity-15 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_left,#d97706_0%,transparent_60%)] opacity-15 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Right Side: Bold Typography & Details */}
              <div className="lg:col-span-7 text-right space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-extrabold uppercase tracking-widest border border-amber-500/20 animate-pulse-glow">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    أصالة المذاق المصري والبلدي العريق
                  </span>
                  
                  <h2 className="font-sans text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                    أكل بلدي على أصوله
                  </h2>
                </motion.div>

                {/* Social Proof Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-start gap-2.5 bg-stone-900/65 border border-amber-500/10 p-2 rounded-xl w-max backdrop-blur-md text-[11px]"
                >
                  <div className="flex items-center text-amber-400 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
                    ))}
                  </div>
                  <span className="text-stone-200 font-extrabold">
                    <span className="text-amber-400 font-black">4.9 / 5.0</span> من أكثر من 15,000 عميل سعيد
                  </span>
                </motion.div>

                {/* Main Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2.5 pt-1"
                >
                  <a
                    href="#menu-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-950" />
                    اطلب وجبتك المفضلة الآن
                  </a>
                  <button
                    onClick={() => {
                      setActiveTab('track');
                      setIsTrackSearched(false);
                    }}
                    className="px-5 py-3 bg-stone-900/90 hover:bg-stone-850 text-amber-200 hover:text-white font-bold text-xs rounded-xl border border-amber-500/10 shadow-md transition-all flex items-center gap-1.5"
                  >
                    📍 تتبع طلبك بالـ GPS
                  </button>
                </motion.div>
              </div>

              {/* Left Side: Rotating Plate Graphic */}
              <div className="lg:col-span-5 flex justify-center relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 1.2 }}
                  className="relative w-48 h-48 sm:w-64 sm:h-64"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 rounded-full blur-xl opacity-20 animate-spin-slow pointer-events-none" />
                  <div className="absolute -inset-2 border-2 border-dashed border-amber-400/20 rounded-full animate-spin-slow pointer-events-none" />
                  <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-stone-950">
                    <img
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                      alt="طبلية أبو قورة"
                      className="w-full h-full object-cover animate-spin-slow hover:pause-animation"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main id="menu-section" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12 w-full">
        <AnimatePresence mode="wait">
          
          {/* CLIENT PORTAL VIEW */}
          {activeTab === 'client' && (
            <motion.div
              key="client-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              
              {/* TOP WELCOME AND GREETING ROW (Figma Style) */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-100/15 to-transparent p-4 rounded-3xl border border-amber-200/40">
                <div className="flex items-center gap-2.5">
                  <AbuGouraLogo className="w-10 h-10 shadow-sm" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold leading-none">مرحباً بك يا غالي في مطبخ</p>
                    <h3 className="text-sm font-black text-stone-900 mt-0.5">أبو قورة للمشويات والأكلات البلدية</h3>
                  </div>
                </div>

                {/* Location Picker pill */}
                <div className="bg-white/95 border border-stone-200 px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm text-xs font-black text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>الموقع: حدائق أكتوبر، الجيزة</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </div>
              </div>

              {/* BRAND BIG SLOGAN HEADLINE */}
              <div className="text-right space-y-1">
                <h2 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight leading-tight">
                  أكل بلدي يفتح النفس، <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-600 to-amber-950">توصيل دليفري سريع وبأعلى جودة</span>
                </h2>
                <p className="text-xs text-stone-500 font-bold">اختر من أقسامنا الفاخرة المجهزة بالسمن البلدي الطبيعي والبهارات الأصيلة</p>
              </div>



              {/* SEARCH BAR (Figma Style) */}
              <div id="categories-row" className="bg-white p-3 rounded-2xl border border-stone-150 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن كباب، كفتة، طاجن، أو حمام بلدي..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl text-xs sm:text-sm border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-stone-50/50 text-stone-900 font-bold placeholder-stone-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-650"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                <div className="text-left text-xs font-black text-amber-800 bg-amber-50 border border-amber-100/50 px-3 py-2 rounded-xl flex items-center justify-center gap-1">
                  <span>الخدمة 24 ساعة طوال الأسبوع d&apos;livre</span>
                </div>
              </div>

              {/* HORIZONTAL CATEGORY SLIDER (Figma Screenshot 2 Style) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-black text-stone-900">تصفح حسب فئات الطعام</h4>
                  <span className="text-xs text-amber-800 font-bold">اسحب أفقياً</span>
                </div>
                
                <div className="overflow-x-auto scrollbar-none py-2 flex space-x-3.5 space-x-reverse -mx-4 px-4 md:mx-0 md:px-0">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    const categoryIcons: { [key: string]: React.ReactNode } = {
                      all: (
                        <Utensils className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-amber-600'}`} />
                      ),
                      meat_grills: (
                        <Beef className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-rose-400' : 'text-rose-600'}`} />
                      ),
                      chicken_grills: (
                        <Drumstick className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-amber-500'}`} />
                      ),
                      meals: (
                        <User className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-blue-600'}`} />
                      ),
                      platters: (
                        <Users className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      ),
                      tajines: (
                        <CookingPot className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-orange-400' : 'text-orange-600'}`} />
                      ),
                      oriental_kitchen: (
                        <ChefHat className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      ),
                      sandwiches: (
                        <Sandwich className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      ),
                      sides: (
                        <Salad className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-lime-400' : 'text-lime-600'}`} />
                      ),
                      drinks_desserts: (
                        <CakeSlice className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-pink-400' : 'text-pink-500'}`} />
                      )
                    };
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-[24px] flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-300 cursor-pointer border select-none group ${
                          isActive
                            ? 'bg-stone-950 text-white border-stone-950 scale-105 shadow-md shadow-stone-950/20 font-black'
                            : 'bg-white text-stone-800 border-stone-200/50 hover:bg-amber-50/20 hover:border-amber-200 shadow-sm'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-stone-50'}`}>
                          {categoryIcons[cat.id] || <Utensils className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] sm:text-xs font-black tracking-tight leading-tight break-words px-1">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MENU ITEMS PORTION */}
              <div className="space-y-12">
                
                {filteredMenuItems.length === 0 ? (
                  <div className="bg-white border border-stone-150 rounded-2xl py-12 px-4 text-center max-w-sm mx-auto shadow-sm">
                    <Search className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h4 className="text-base font-black text-stone-900 mb-1">لم نجد أصناف تماثل بحثك</h4>
                    <p className="text-xs text-stone-500 mb-4">جرب البحث بكلمة أخرى أو تصفح الأقسام المتعددة</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-black text-amber-600 underline"
                    >
                      عرض القائمة بالكامل
                    </button>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: POPULAR ITEMS WITH OVERLAPPING PLATES (Figma Screenshot 1 & 2 Style) */}
                    {selectedCategory === 'all' && (
                      <div className="space-y-14 pt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg sm:text-xl font-black text-stone-950 flex items-center gap-1.5">
                            <span className="w-1.5 h-5 bg-amber-500 rounded-sm inline-block" />
                            الأكثر طلباً ومبيعاً 🔥
                          </h3>
                          <span className="text-xs text-stone-500 font-bold">خلطة أبو قورة السرية</span>
                        </div>

                        {/* Overlapping plate card grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
                          {filteredMenuItems.slice(0, 6).map((item) => {
                            const isWeightOrSize = typeof item.price !== 'number';
                            const displayPrice = isWeightOrSize
                              ? `يبدأ من ${Math.min(...Object.values(item.price as object))} ج.م`
                              : `${item.price} ج.م`;

                            return (
                              <motion.div
                                layout
                                key={`popular-${item.id}`}
                                onClick={() => openCustomizer(item)}
                                className="bg-white rounded-[28px] pt-16 pb-4 px-4.5 shadow-[0_12px_35px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(245,197,59,0.15)] border border-stone-200/40 flex flex-col justify-between text-center relative group transition-all duration-300 mt-10 cursor-pointer"
                              >
                                {/* Circular Overlapping Plate */}
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImagePreviewItem(item);
                                  }}
                                  className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-30 sm:h-30 rounded-full overflow-hidden border-4 border-white shadow-lg bg-stone-100 cursor-zoom-in transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6 z-10"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/95 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded shadow">تكبير</span>
                                  </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex-1 flex flex-col justify-between pt-1">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black text-amber-800 bg-amber-50 border border-amber-100/40 px-2 py-0.5 rounded-full mx-auto w-max block">
                                      {categories.find((c) => c.id === item.category)?.name}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-black text-stone-950 group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug">
                                      {item.name}
                                    </h4>
                                    
                                    {/* Ratings display */}
                                    <div className="flex items-center justify-center gap-1 select-none">
                                      <div className="flex items-center text-amber-400 gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                          const avg = ratingsStats[item.id]?.average || 5;
                                          return (
                                            <Star 
                                              key={i} 
                                              className={`w-3.5 h-3.5 ${i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                                            />
                                          );
                                        })}
                                      </div>
                                      <span className="text-[10px] font-black text-amber-800 font-mono">
                                        {(ratingsStats[item.id]?.average || 5.0).toFixed(1)}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-stone-500 font-medium line-clamp-2 leading-relaxed">
                                      {item.description || 'أشهى مأكولات مطعم أبو قورة المحضرة بأجود المكونات الطازجة والسمن البلدي والبهارات الأصيلة.'}
                                    </p>
                                  </div>

                                  <div className="pt-3 mt-3.5 border-t border-stone-100 flex items-center justify-between gap-1.5">
                                    <span className="text-xs sm:text-sm font-black text-amber-850 whitespace-nowrap font-mono">
                                      {displayPrice}
                                    </span>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCustomizer(item);
                                      }}
                                      className="px-3 py-2 bg-stone-950 hover:bg-stone-850 text-white font-black text-[10px] rounded-xl shadow transition-all flex items-center gap-1 hover:scale-[1.03] active:scale-95 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>طلب تخصيص</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: FULL COMPREHENSIVE MENU LIST (Figma Screenshot 3 style) */}
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-black text-stone-950 flex items-center gap-1.5">
                          <span className="w-1.5 h-5 bg-amber-500 rounded-sm inline-block" />
                          {categories.find((c) => c.id === selectedCategory)?.name}
                          <span className="text-[10px] text-amber-800 font-extrabold bg-amber-50 border border-amber-100/50 px-2.5 py-0.5 rounded-full">
                            {filteredMenuItems.length} صنف متاح
                          </span>
                        </h3>
                      </div>

                      {/* Horizontal list layout (Pizza screenshot style) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {itemsToDisplay.map((item) => {
                          const isWeightOrSize = typeof item.price !== 'number';
                          const displayPrice = isWeightOrSize
                            ? `يبدأ من ${Math.min(...Object.values(item.price as object))} ج.م`
                            : `${item.price} ج.م`;

                          const isAvailable = item.isAvailable !== false;

                          return (
                            <motion.div
                              layout
                              key={`list-${item.id}`}
                              onClick={() => isAvailable && openCustomizer(item)}
                              className={`border rounded-2xl p-3.5 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.05)] transition-all flex flex-row gap-4 relative group ${
                                isAvailable 
                                  ? 'bg-white border-stone-200/50 cursor-pointer' 
                                  : 'bg-stone-50 border-stone-200/40 opacity-70 cursor-not-allowed select-none'
                              }`}
                            >
                              {/* Right: Circular dish plate (RTL) */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isAvailable) {
                                    setImagePreviewItem(item);
                                  }
                                }}
                                className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full overflow-hidden shadow-md border border-stone-100 self-center ${
                                  isAvailable ? 'cursor-zoom-in' : 'grayscale'
                                }`}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                                  }}
                                />
                                {isAvailable && (
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[9px] font-black">تكبير</span>
                                  </div>
                                )}
                              </div>

                              {/* Center & Left Content (RTL) */}
                              <div className="flex-1 flex flex-col justify-between min-w-0 pr-1 text-right">
                                <div>
                                  <div className="flex justify-between items-start gap-1.5 mb-1">
                                    <h4 className={`text-xs sm:text-sm font-black text-stone-900 leading-snug line-clamp-1 ${
                                      isAvailable ? 'group-hover:text-amber-600 transition-colors' : 'text-stone-400 line-through'
                                    }`}>
                                      {item.name}
                                    </h4>
                                    
                                    <span className={`text-xs font-black whitespace-nowrap font-mono ${
                                      isAvailable ? 'text-amber-850' : 'text-stone-400'
                                    }`}>
                                      {displayPrice}
                                    </span>
                                  </div>

                                  {/* Star Rating row */}
                                  <div className="flex items-center gap-1 mt-0.5 select-none">
                                    <div className="flex items-center text-amber-400 gap-0.5">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    </div>
                                    <span className="text-[11px] font-black text-amber-800 font-mono">
                                      {(ratingsStats[item.id]?.average || 5.0).toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-bold">
                                      ({ratingsStats[item.id]?.count || 12} تقييم • 25 دقيقة)
                                    </span>
                                  </div>

                                  <p className="text-[10px] sm:text-[11px] text-stone-500 font-semibold leading-relaxed line-clamp-2 mt-1">
                                    {item.description || 'أشهى مأكولات مطعم أبو قورة المحضرة بأجود المكونات الطازجة والسمن البلدي والبهارات الأصيلة.'}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${
                                    isAvailable 
                                      ? 'text-amber-800 bg-amber-50 border-amber-100/50' 
                                      : 'text-stone-450 bg-stone-100 border-stone-200/50'
                                  }`}>
                                    {categories.find((c) => c.id === item.category)?.name}
                                  </span>
                                  
                                  {isAvailable ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCustomizer(item);
                                      }}
                                      className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-850 text-white font-black text-[10px] rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                                      <span>تخصيص وإضافة</span>
                                    </button>
                                  ) : (
                                    <span className="px-3.5 py-1.5 bg-red-100 text-red-750 font-black text-[10px] rounded-xl border border-red-200 flex items-center gap-1">
                                      <span>غير متوفر حالياً 🚫</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Load More Button */}
                      {selectedCategory === 'all' && filteredMenuItems.length > visibleItemsCount && (
                        <div className="flex justify-center pt-6">
                          <button
                            onClick={() => setVisibleItemsCount((prev) => prev + 25)}
                            className="bg-stone-950 hover:bg-stone-850 active:scale-95 text-white font-black text-sm px-8 py-3.5 rounded-full transition-all shadow-md shadow-stone-950/15 cursor-pointer"
                          >
                            المزيد من الأصناف
                          </button>
                        </div>
                      )}
                    </div>

                  </>
                )}
              </div>

            </motion.div>
          )}

          {/* TRACK ORDER VIEW */}
          {activeTab === 'track' && (
            <motion.div
              key="track-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm text-center space-y-4">
                <div className="bg-amber-50 p-3.5 rounded-full w-max mx-auto border border-amber-100">
                  <ShoppingBag className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-stone-950">تتبع حالة طلباتك مباشرةً 🛵</h3>
                <p className="text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
                  أدخل رقم موبايلك أدناه للاستعلام عن حالة طلباتك الحالية وتتبع خط سير طيار التوصيل من المطبخ إلى باب بيتك بدقة GPS فائقة.
                </p>

                {/* Search Input and button */}
                <div className="flex max-w-md mx-auto gap-2">
                  <input
                    type="tel"
                    placeholder="اكتب رقم موبايلك المستخدم للطلب..."
                    value={trackPhoneNumber}
                    onChange={(e) => setTrackPhoneNumber(e.target.value)}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-stone-250 focus:outline-none focus:border-amber-500 font-bold text-sm text-center bg-stone-50/50"
                  />
                  <button
                    onClick={handleSearchTrackOrders}
                    className="px-6 py-2.5 bg-stone-950 hover:bg-stone-850 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    بحث وتحديث
                  </button>
                </div>

                {/* Browser Notification Banner/Toggle */}
                {('Notification' in window) && (
                  <div className="max-w-md mx-auto p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-right mt-4">
                    <div className="space-y-0.5 flex-grow">
                      <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5 justify-start">
                        <span>🔔 إشعارات المتصفح المنبثقة:</span>
                        {notificationPermission === 'granted' ? (
                          <span className="text-[9px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-250 rounded-full font-black">مفعلة ✅</span>
                        ) : notificationPermission === 'denied' ? (
                          <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-750 border border-red-200 rounded-full font-black">مرفوضة ❌</span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 bg-amber-100/50 text-amber-850 border border-amber-200 rounded-full font-black">بانتظار التفعيل ⏳</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed text-right font-medium">
                        احصل على تنبيه منبثق فوري على شاشتك حتى لو كان الموقع في الخلفية عند تغير حالة طهي أو توصيل طلبك.
                      </p>
                    </div>
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={handleEnableNotifications}
                        className="w-full sm:w-auto px-4 py-2 bg-stone-950 hover:bg-stone-850 active:scale-95 text-white font-black text-xs rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        تفعيل التنبيهات
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search results */}
              {isTrackSearched && (
                <div className="space-y-6">
                  {trackedOrders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-sm space-y-3">
                      <p className="text-stone-900 font-black text-base">لم نجد أي طلبات مسجلة برقم الهاتف هذا!</p>
                      <p className="text-xs text-stone-500">تأكد من إدخال رقم الهاتف الذي استخدمته في تأكيد الطلب من السلة.</p>
                    </div>
                  ) : (
                    trackedOrders.map((order) => (
                      <div key={order._id} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
                        {/* Order info header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
                          <div>
                            <span className="text-xs text-amber-900 font-bold bg-amber-50 border border-amber-250 px-2.5 py-1 rounded-full font-mono">
                              رقم الطلب: #{order._id?.slice(-6).toUpperCase()}
                            </span>
                            <p className="text-xs text-stone-500 mt-2 font-medium">
                              تاريخ الطلب: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'مؤخراً'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-550 font-semibold">حالة الطلب الحالية:</span>
                            {order.status === 'pending' && (
                              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/30 rounded-full font-black text-xs animate-pulse">⏳ في انتظار مراجعة المطبخ</span>
                            )}
                            {order.status === 'preparing' && (
                              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full font-black text-xs animate-pulse">👨‍🍳 جاري تحضيره في المطبخ الآن</span>
                            )}
                            {order.status === 'delivered' && (
                              <span className="px-3 py-1 bg-green-50 text-green-800 border border-green-150 rounded-full font-black text-xs">✅ تم التوصيل بالهنا والشفا!</span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="px-3 py-1 bg-red-50 text-red-850 border border-red-150 rounded-full font-black text-xs">❌ تم إلغاء الطلب</span>
                            )}
                          </div>
                        </div>

                        {/* Order status visual stepper */}
                        <div className="grid grid-cols-3 gap-2 relative max-w-xl mx-auto pt-4 pb-2">
                          {/* Stepper lines */}
                          <div className="absolute top-8 left-[16.6%] right-[16.6%] h-1 bg-stone-100 -z-10" />
                          <div
                            className="absolute top-8 left-[16.6%] h-1 bg-amber-500 transition-all -z-10"
                            style={{
                              width:
                                order.status === 'pending'
                                  ? '0%'
                                  : order.status === 'preparing'
                                  ? '50%'
                                  : order.status === 'delivered'
                                  ? '100%'
                                  : '0%',
                              right: 'auto',
                            }}
                          />

                          {/* Step 1: Pending */}
                          <div className="text-center space-y-1.5">
                            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs border-2 ${
                              order.status === 'pending' || order.status === 'preparing' || order.status === 'delivered'
                                ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-sm'
                                : 'bg-white border-stone-200 text-stone-400'
                            }`}>
                              ⏳
                            </div>
                            <p className="text-xs font-black text-stone-950">تلقينا الطلب</p>
                            <p className="text-[10px] text-stone-500">تحت المراجعة</p>
                          </div>

                          {/* Step 2: Preparing */}
                          <div className="text-center space-y-1.5">
                            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs border-2 ${
                              order.status === 'preparing' || order.status === 'delivered'
                                ? 'bg-amber-500 border-amber-600 text-stone-950 animate-pulse'
                                : 'bg-white border-stone-200 text-stone-400'
                            }`}>
                              👨‍🍳
                            </div>
                            <p className="text-xs font-black text-stone-950">في المطبخ</p>
                            <p className="text-[10px] text-stone-500">طهي وتعبئة</p>
                          </div>

                          {/* Step 3: Delivered */}
                          <div className="text-center space-y-1.5">
                            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs border-2 ${
                              order.status === 'delivered'
                                ? 'bg-green-600 border-green-700 text-white animate-bounce'
                                : 'bg-white border-stone-200 text-stone-400'
                            }`}>
                              🛵
                            </div>
                            <p className="text-xs font-black text-stone-950">وصلك بالسلامة</p>
                            <p className="text-[10px] text-stone-500">بالهنا والشفا</p>
                          </div>
                        </div>

                        {/* Interactive map if location is set and order is not cancelled */}
                        {order.location && order.status !== 'cancelled' && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                              🛵 تتبع مسار طيار التوصيل بالـ GPS المباشر:
                            </h4>
                            <LeafletDeliveryMap userLat={order.location.latitude} userLng={order.location.longitude} />
                          </div>
                        )}

                        {/* Summary of items */}
                        <div className="bg-stone-50/50 border border-stone-200/60 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-bold text-stone-900">الأكلات المطلوبة بالتفصيل:</h4>
                          <div className="space-y-2 text-xs">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center text-stone-800 font-bold">
                                  <span>
                                    <span className="text-amber-600 font-extrabold">{item.quantity}x</span> {item.name}
                                    {item.selectedSize && (
                                      <span className="mr-1.5 px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-800 rounded font-medium border border-amber-100/50">
                                        حجم: {item.selectedSize}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-extrabold text-stone-900 font-mono">{item.unitPrice * item.quantity} ج.م</span>
                                </div>
                                {item.additions && item.additions.length > 0 && (
                                  <div className="mt-1 mr-4 flex flex-wrap gap-1.5">
                                    <span className="text-[10px] text-stone-400 font-semibold">🥗 الإضافات:</span>
                                    {item.additions.map((add, addIdx) => (
                                      <span key={addIdx} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-medium">
                                        {add.name} (+{add.price} ج.م)
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between items-center text-sm font-black text-stone-900">
                            <span>إجمالي الحساب (عند التوصيل كاش):</span>
                            <span className="text-amber-850 text-base font-mono">{order.totalPrice} ج.م</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ADMIN PORTAL PANEL */}
          {activeTab === 'admin' && isAdminLoggedIn && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              
              {/* Admin Panel Header */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
                
                <div className="space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black tracking-wide uppercase px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      لوحة المراقبة الفورية
                    </span>
                    <span className="text-[10px] font-black tracking-wide uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full flex items-center gap-1" title="نظام المزامنة الثنائية ذاتي الشفاء">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      مزامنة ثنائية نشطة (MongoDB Cloud + Backup Local)
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-amber-950 tracking-tight">
                    لوحة الإدارة والمحاسبة الذكية
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    مرحباً بك، <span className="text-amber-950 font-black">{adminUser}</span>. يمكنك تتبع مبيعات المطعم، وإدارة الطلبات، وتعديل إعدادات الاستقبال بكل سهولة.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                  <button
                    onClick={() => {
                      setEditNewUsername(adminUser);
                      setIsEditingAdmin(!isEditingAdmin);
                      setEditSuccessMsg('');
                      setAuthError('');
                    }}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all border border-amber-200/60 shadow-xs cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-amber-700" />
                    تعديل حساب الإدارة
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-amber-900/40"
                  >
                    <span>🔄 تحديث كشف الطلبات</span>
                  </button>
                </div>

              </div>

              {/* Edit Admin Account Sub-view */}
              <AnimatePresence>
                {isEditingAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50/40 border border-amber-200/80 p-6 rounded-3xl shadow-inner space-y-4">
                      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3">
                        <Settings className="w-5 h-5 text-amber-800" />
                        <h4 className="text-sm font-black text-amber-950">
                          تعديل حساب الإدارة وتغيير كلمة المرور
                        </h4>
                      </div>
                      <form onSubmit={handleUpdateAdminProfile} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم مستخدم الإدارة الجديد</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: admin"
                            value={editNewUsername}
                            onChange={(e) => setEditNewUsername(e.target.value)}
                            className="w-full px-4 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white text-right font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة المرور الجديدة (اختياري)</label>
                          <input
                            type="password"
                            placeholder="اتركه فارغاً للاحتفاظ بالحالية"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            className="w-full px-4 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white text-right"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">كود الأمان الثاني الجديد (اختياري)</label>
                          <input
                            type="password"
                            placeholder="••••••"
                            value={editNewSecurityCode}
                            onChange={(e) => setEditNewSecurityCode(e.target.value)}
                            className="w-full px-4 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white text-right"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-red-700 mb-1.5">تأكيد بكلمة المرور الحالية *</label>
                          <input
                            type="password"
                            required
                            placeholder="اكتب كلمة المرور لتأكيد الهوية"
                            value={editCurrentPassword}
                            onChange={(e) => setEditCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 text-xs rounded-xl border-2 border-red-200 focus:outline-none focus:border-red-600 bg-white text-right font-bold placeholder-red-300"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-amber-950 hover:bg-amber-900 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer"
                          >
                            حفظ البيانات
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingAdmin(false)}
                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-xs rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>

                      </form>

                      {editSuccessMsg && (
                        <p className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1">
                          ✅ {editSuccessMsg}
                        </p>
                      )}
                      {authError && (
                        <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                          ❌ {authError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WHATSAPP SETTINGS CONFIGURATION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-200/80 shadow-lg relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-green-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-2xl">
                    <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                      <span className="p-1.5 bg-green-100 text-green-800 rounded-lg text-lg">💬</span>
                      إعدادات استقبال فواتير وجي بي إس الواتساب للعملاء
                    </h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      حدد رقم الواتساب النشط لمطعم أبو قورة لاستلام فواتير العملاء التفصيلية. عندما يطلب العميل، سيقوم النظام بتوجيهه تلقائياً إلى هذا الرقم مع الفاتورة المنسقة ورابط خرائط جوجل الدقيق لموقعه لتوصيل الطعام بأقصى سرعة وبدون أخطاء!
                      <br />
                      <span className="text-[10px] text-green-700 font-extrabold block mt-2">💡 يتم صيانة وتنسيق الأرقام محلياً ودولياً تلقائياً لتوافق روابط الواتساب العالمية بدون أي تدخل منك.</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="مثال: 201012345678"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full sm:w-60 px-4 py-3 text-xs font-black rounded-xl border border-amber-200 focus:outline-none focus:border-green-600 bg-white text-right tracking-wider"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">رقم هاتف</span>
                    </div>
                    <button
                      onClick={() => handleSaveSettings(whatsappNumber)}
                      disabled={isSavingSettings}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer border border-green-700/30"
                    >
                      {isSavingSettings ? 'جاري الحفظ...' : 'حفظ الرقم الجديد 💾'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SUB-TAB SWITCHER */}
              <div className="flex border-b border-stone-200 gap-1 overflow-x-auto scrollbar-none pb-0.5">
                <button
                  onClick={() => setAdminSubTab('orders')}
                  className={`pb-3.5 px-6 text-xs sm:text-sm font-black border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    adminSubTab === 'orders'
                      ? 'border-amber-600 text-amber-950 font-black'
                      : 'border-transparent text-stone-400 hover:text-stone-600 font-bold'
                  }`}
                >
                  <span>📊</span> المبيعات والطلبات الواردة
                </button>
                <button
                  onClick={() => setAdminSubTab('menu')}
                  className={`pb-3.5 px-6 text-xs sm:text-sm font-black border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    adminSubTab === 'menu'
                      ? 'border-amber-600 text-amber-950 font-black'
                      : 'border-transparent text-stone-400 hover:text-stone-600 font-bold'
                  }`}
                >
                  <span>🍽️</span> إدارة المنيو وقائمة الطعام
                </button>
              </div>

              {adminSubTab === 'orders' ? (
                <>
                  {/* ANALYTICS VISUALIZATIONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue/Orders Area Chart */}
                <div className="bg-white p-6 rounded-3xl border border-amber-100/70 shadow-lg lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-red-600" />
                      مخطط المبيعات وحركة الفواتير الزمنية (ج.م)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold">تحديث فوري</span>
                  </div>
                  <div className="h-64 text-right" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ordersChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#854d0e" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#854d0e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', textAlign: 'right', direction: 'rtl', fontSize: '11px' }}
                          labelFormatter={(label) => `التاريخ: ${label}`}
                        />
                        <Area type="monotone" dataKey="amount" name="المبيعات (ج.م)" stroke="#854d0e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Popular categories bento box */}
                <div className="bg-white p-6 rounded-3xl border border-amber-100/70 shadow-lg flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5 border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                      <span className="text-base">🔥</span>
                      الأكلات الأكثر مبيعاً وتقسيماً
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold">مجموع حصص أوردرات المطبخ</p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    {categoryPopularityData.length === 0 ? (
                      <p className="text-xs text-gray-400 font-bold text-center">لا توجد بيانات كافية حالياً</p>
                    ) : (
                      categoryPopularityData.slice(0, 5).map((cat, idx) => {
                        const maxVal = Math.max(...categoryPopularityData.map(c => c.value), 1);
                        const percentage = Math.round((cat.value / maxVal) * 100);
                        return (
                          <div key={idx} className="space-y-1 text-right">
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="text-amber-950 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </span>
                              <span className="text-gray-500 font-bold">{cat.value} قطعة مبيعة</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: cat.color }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-black text-gray-500 pt-3 border-t border-gray-100">
                    {categoryPopularityData.map((cat, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="truncate">{cat.name}: {cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* LIST OF ORDERS MANAGEMENT */}
              <div className="bg-white rounded-3xl border border-amber-100/80 shadow-xl overflow-hidden">
                
                {/* Search & filters bar */}
                <div className="p-5 sm:p-6 border-b border-amber-100/60 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 bg-amber-50/15">
                  
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                      <span className="p-1 bg-amber-100 text-amber-950 rounded-lg text-sm">📑</span>
                      كشف وسجل الفواتير المستلمة
                    </h4>
                    <p className="text-[11px] text-gray-400 font-bold">يمكنك مراجعة كافة الطلبات وتصفيتها وتتبع مواقع العملاء</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
                    {/* Status filter tabs */}
                    <div className="flex bg-amber-100/50 border border-amber-200/50 rounded-xl p-0.5 text-xs font-bold overflow-x-auto max-w-full">
                      {[
                        { id: 'all', name: 'الكل' },
                        { id: 'pending', name: 'قيد المراجعة ⏳' },
                        { id: 'preparing', name: 'بالمطبخ 👨‍🍳' },
                        { id: 'delivered', name: 'تم التسليم ✅' },
                        { id: 'cancelled', name: 'الملغية ❌' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setOrderFilterStatus(tab.id)}
                          className={`px-3.5 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                            orderFilterStatus === tab.id
                              ? 'bg-amber-950 text-white font-black shadow-md'
                              : 'text-gray-500 hover:text-amber-950 hover:bg-white/50'
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {/* Time filter tabs */}
                    <div className="flex bg-amber-100/50 border border-amber-200/50 rounded-xl p-0.5 text-xs font-bold overflow-x-auto max-w-full">
                      {[
                        { id: 'all', name: 'كل الفترات' },
                        { id: 'today', name: 'اليوم' },
                        { id: 'yesterday', name: 'الأمس' },
                        { id: 'thisWeek', name: 'الأسبوع' },
                        { id: 'thisMonth', name: 'الشهر' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setOrderTimeFilter(tab.id)}
                          className={`px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                            orderTimeFilter === tab.id
                              ? 'bg-amber-950 text-white font-black shadow-md'
                              : 'text-gray-500 hover:text-amber-950 hover:bg-white/50'
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {/* Search input */}
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="البحث باسم العميل أو رقم هاتفه..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-amber-200 bg-white text-xs font-bold focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                  </div>

                </div>

                {/* Orders table / list */}
                {ordersLoading && orders.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-amber-950">جاري تحميل سجل الطلبات والمزامنة السحابية...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 space-y-2">
                    <ClipboardList className="w-14 h-14 mx-auto mb-2 opacity-30 text-amber-900" />
                    <p className="text-sm font-black text-amber-950">لا توجد أي فواتير تتطابق مع البحث الحالي</p>
                    <p className="text-xs text-gray-400 font-bold">جرب تغيير حالة التصفية أو التوقيت للحصول على نتائج.</p>
                  </div>
                ) : (
                  <div className="space-y-6 p-6 bg-stone-50/50">
                    {filteredOrders.map((order) => {
                      const rawId = order._id || '';
                      const shortId = rawId.length > 5 ? rawId.slice(-5).toUpperCase() : rawId.toUpperCase();
                      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '';
                      
                      // Status styling configuration
                      const getStatusBadgeConfig = (status: string) => {
                        switch (status) {
                          case 'pending':
                            return {
                              label: '⏳ بانتظار الموافقة',
                              bg: 'bg-amber-50 border-amber-200 text-amber-800',
                              accent: 'border-amber-500'
                            };
                          case 'preparing':
                            return {
                              label: '👨‍🍳 جاري التحضير بالمطبخ',
                              bg: 'bg-blue-50 border-blue-200 text-blue-800',
                              accent: 'border-blue-500'
                            };
                          case 'delivered':
                            return {
                              label: '✅ تم تسليم الطلب للعميل',
                              bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                              accent: 'border-emerald-500'
                            };
                          case 'cancelled':
                          default:
                            return {
                              label: '❌ ملغي من الإدارة',
                              bg: 'bg-red-50 border-red-200 text-red-800',
                              accent: 'border-red-500'
                            };
                        }
                      };
                      
                      const statusCfg = getStatusBadgeConfig(order.status || 'pending');

                      return (
                        <div 
                          key={order._id} 
                          className="bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                        >
                          {/* Card Header: Universal Control & Meta Bar */}
                          <div className="bg-stone-50 border-b border-stone-200/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-black px-3 py-1.5 bg-amber-950 text-white rounded-lg shadow-sm">
                                فاتورة #{shortId}
                              </span>
                              <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                {orderDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-400 font-extrabold uppercase">الحالة الحالية:</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-lg border ${statusCfg.bg}`}>
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>

                          {/* Card Body: Multi-column inner division */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-stone-100">
                            
                            {/* Column 1: Client Metadata & Delivery coordinates (40%) */}
                            <div className="lg:col-span-5 p-5 sm:p-6 space-y-4">
                              <div className="border-b border-stone-100 pb-3">
                                <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-2">👤 بيانات العميل الأساسية:</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-black text-sm shrink-0">
                                    {order.customerName ? order.customerName[0] : 'ع'}
                                  </div>
                                  <div>
                                    <h4 className="text-base font-black text-stone-900 leading-tight">
                                      {order.customerName || 'عميل أبو قورة'}
                                    </h4>
                                    <p className="text-[10px] text-stone-400 font-bold mt-0.5">رقم التعريف: {order._id}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Contacts */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase block">📞 الاتصال والمراسلة:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <a 
                                    href={`tel:${order.phoneNumber}`}
                                    className="text-xs font-black text-red-700 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-150 py-2.5 px-3 rounded-xl transition-all"
                                    title="اضغط للاتصال الهاتفي السريع"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-red-600" />
                                    <span>{order.phoneNumber}</span>
                                  </a>
                                  
                                  <a
                                    href={getAdminWhatsAppLink(order)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                                    title="إرسال الفاتورة جاهزة ومنسقة لواتساب العميل"
                                  >
                                    <span>💬 سند واتساب</span>
                                  </a>
                                </div>
                              </div>

                              {/* Address */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase block">📍 عنوان التوصيل المحدد:</span>
                                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-start justify-between gap-3">
                                  <p className="text-xs text-stone-800 font-bold leading-relaxed">
                                    {order.address || 'لم يتم كتابة عنوان واضح.'}
                                  </p>
                                  {order.address && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.address || '');
                                        showToast('تم نسخ عنوان التوصيل بنجاح! 📋', 'success');
                                      }}
                                      className="p-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-all cursor-pointer shadow-3xs shrink-0"
                                      title="نسخ العنوان لإعطائه للديليفري"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Map coordinate GPS locator */}
                              {order.location && (
                                <div className="pt-2">
                                  <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1.5">🗺️ تحديد الموقع على الخريطة:</span>
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100/60 px-2.5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 flex-grow">
                                      <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                      إحداثيات الـ GPS ملتقطة بدقة
                                    </span>
                                    <a
                                      href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs bg-red-600 text-white hover:bg-red-700 py-2.5 px-4 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border border-red-700/20 shrink-0"
                                    >
                                      <Map className="w-3.5 h-3.5" />
                                      عرض بخرائط جوجل
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Column 2: Items & Food Receipt Details (40%) */}
                            <div className="lg:col-span-4 p-5 sm:p-6 bg-stone-50/20 flex flex-col justify-between">
                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-stone-900 pb-2 border-b border-stone-200/60 flex items-center gap-1.5">
                                  <Utensils className="w-3.5 h-3.5 text-amber-800" />
                                  قائمة الوجبات المطلوبة:
                                </h5>
                                <ul className="space-y-3.5">
                                  {(order.items || []).map((item, idx) => (
                                    <li key={idx} className="text-xs text-stone-800 border-b border-dashed border-stone-200/80 pb-3 last:border-0 last:pb-0">
                                      <div className="flex items-start justify-between gap-4 font-bold">
                                        <div>
                                          <span className="text-red-700 font-black text-xs bg-red-50 border border-red-150 px-2 py-0.5 rounded-lg ml-1.5 inline-block">{item.quantity}x</span>
                                          <span className="text-stone-900 font-extrabold">{item.name}</span>
                                          {item.selectedSize && (
                                            <span className="text-[9px] text-amber-800 bg-amber-50 border border-amber-200/40 px-2 py-0.5 rounded-md mr-1.5 font-black">
                                              حجم: {item.selectedSize}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-stone-950 font-black whitespace-nowrap">{(item.unitPrice * item.quantity).toLocaleString()} ج.م</span>
                                      </div>
                                      {item.additions && item.additions.length > 0 && (
                                        <div className="mt-2 mr-7 flex flex-wrap gap-1.5 items-center">
                                          <span className="text-[9px] text-stone-400 font-bold">الإضافات:</span>
                                          {item.additions.map((a, addIdx) => (
                                            <span key={addIdx} className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2 py-0.5 rounded-lg font-black">
                                              {a.name} (+{a.price} ج.م)
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>

                                {order.customNotes && (
                                  <div className="mt-3 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/30 text-xs text-amber-950 leading-relaxed font-bold">
                                    <span className="text-amber-700 font-black block mb-1">💡 ملاحظات العميل:</span> 
                                    <p className="text-stone-700 font-medium">{order.customNotes}</p>
                                  </div>
                                )}
                              </div>

                              <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs sm:text-sm font-black bg-stone-100/40 -mx-5 -mb-5 p-5 rounded-b-none lg:rounded-b-none">
                                <span className="text-stone-500 font-bold">إجمالي الفاتورة:</span>
                                <span className="text-red-700 text-base sm:text-lg font-black bg-red-50 border border-red-150 px-3 py-1 rounded-xl">{(order.totalPrice || 0).toLocaleString()} ج.م</span>
                              </div>
                            </div>

                            {/* Column 3: Update Order State Controls (20%) */}
                            <div className="lg:col-span-3 p-5 sm:p-6 bg-amber-50/5 flex flex-col justify-between gap-6">
                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-amber-800" />
                                  لوحة التحكم بالطلب:
                                </h5>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-black tracking-wider text-stone-400 uppercase block">تحديث حالة الفاتورة:</label>
                                  <div className="relative">
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order._id!, e.target.value)}
                                      className={`w-full text-xs font-black py-2.5 pl-8 pr-3.5 rounded-xl border appearance-none focus:outline-none focus:ring-2 cursor-pointer transition-all shadow-3xs ${
                                        order.status === 'pending'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-400'
                                          : order.status === 'preparing'
                                          ? 'bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-400'
                                          : order.status === 'delivered'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-400'
                                          : 'bg-red-50 text-red-800 border-red-200 focus:ring-red-400'
                                      }`}
                                    >
                                      <option value="pending">⏳ بانتظار الموافقة</option>
                                      <option value="preparing">👨‍🍳 جاري التحضير بالمطبخ</option>
                                      <option value="delivered">✅ تم تسليم الطلب للعميل</option>
                                      <option value="cancelled">❌ ملغي من الإدارة</option>
                                    </select>
                                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                  </div>
                                </div>

                                <div className="py-2.5 px-3 rounded-xl border border-dashed border-stone-200 text-center bg-white shadow-3xs">
                                  {order.status === 'pending' && (
                                    <p className="text-[10px] text-amber-700 font-extrabold animate-pulse">⏳ طلب جديد يحتاج اهتمامك الفوري</p>
                                  )}
                                  {order.status === 'preparing' && (
                                    <p className="text-[10px] text-blue-700 font-extrabold">👨‍🍳 الطلب في المطبخ قيد الطهي</p>
                                  )}
                                  {order.status === 'delivered' && (
                                    <p className="text-[10px] text-emerald-700 font-extrabold">✅ تم إيصاله والتحصيل بنجاح</p>
                                  )}
                                  {order.status === 'cancelled' && (
                                    <p className="text-[10px] text-red-600 font-extrabold">❌ طلب ملغي من الإدارة</p>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-stone-100/80">
                                {deletingOrderId === order._id ? (
                                  <div className="space-y-2 p-2 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-[10px] text-red-700 font-black text-center">تأكيد حذف الفاتورة نهائياً؟</p>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => {
                                          handleDeleteOrder(order._id!);
                                          setDeletingOrderId(null);
                                        }}
                                        className="flex-1 px-2.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                                      >
                                        تأكيد
                                      </button>
                                      <button
                                        onClick={() => setDeletingOrderId(null)}
                                        className="flex-1 px-2.5 py-2 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        تراجع
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingOrderId(order._id!)}
                                    className="w-full px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 hover:border-red-200 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    حذف الفاتورة من السجل
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </>
            ) : (
                <div className="space-y-8">
                  
                  {/* TWO-COLUMN CONTROL BOARD */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* RIGHT COLUMN: CATEGORY MANAGEMENT (4 Columns) */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-amber-100/70 shadow-lg space-y-6">
                      <div className="border-b border-stone-100 pb-3">
                        <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                          <span className="text-base">📋</span>
                          إدارة أقسام وفئات الطعام
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">أضف أو احذف الأقسام الرئيسية للمطعم</p>
                      </div>

                      {/* Add Category Form */}
                      <form onSubmit={handleAddCategory} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">اسم القسم الجديد *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="مثال: طواجن فخار"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white text-right"
                            />
                            <button
                              type="submit"
                              disabled={isCategorySubmitting}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-black text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
                            >
                              {isCategorySubmitting ? 'جاري...' : 'إضافة ➕'}
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Categories List */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase block">جميع الأقسام الحالية:</span>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                          {categories.filter(c => c.id !== 'all').map((cat) => (
                            <div 
                              key={cat.id} 
                              className="flex items-center justify-between p-2.5 bg-amber-50/30 hover:bg-amber-50/60 border border-amber-100/50 rounded-xl transition-all"
                            >
                              {editingCategoryId === cat.id ? (
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="text"
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs font-bold rounded-lg border border-amber-300 focus:outline-none focus:border-amber-650 bg-white text-right"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateCategory(cat.id, editingCategoryName);
                                      } else if (e.key === 'Escape') {
                                        setEditingCategoryId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleUpdateCategory(cat.id, editingCategoryName)}
                                    className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-lg transition-all"
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => setEditingCategoryId(null)}
                                    className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold rounded-lg transition-all"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                                    {cat.name}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingCategoryId(cat.id);
                                        setEditingCategoryName(cat.name);
                                      }}
                                      className="text-[10px] font-bold text-amber-750 hover:bg-amber-50 px-2 py-1 rounded-lg border border-transparent hover:border-amber-100 transition-all cursor-pointer"
                                    >
                                      ✏️ تعديل
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(cat.id)}
                                      className="text-[10px] font-bold text-red-650 hover:bg-red-50 px-2 py-1 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                    >
                                      🗑️ حذف
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* LEFT COLUMN: MENU ITEMS MANAGEMENT (8 Columns) */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-amber-100/70 shadow-lg space-y-6">
                      
                      {/* Section Header with Quick Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                            <span className="text-base">🍔</span>
                            قائمة أصناف ومأكولات أبو قورة
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold">تعديل الأسعار، الصور وتوافر الأكلات بالمطبخ فورا</p>
                        </div>
                        <button
                          onClick={() => openMenuItemModal(null)}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <span>➕</span> إضافة صنف طعام جديد
                        </button>
                      </div>

                      {/* SEARCH AND FILTER BAR */}
                      <div className="flex flex-col sm:flex-row gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="ابحث باسم الأكلة أو المكونات..."
                            value={adminMenuSearch}
                            onChange={(e) => setAdminMenuSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 text-xs font-black rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white text-right"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                        </div>
                        <div className="sm:w-48 relative">
                          <select
                            value={adminMenuCategory}
                            onChange={(e) => setAdminMenuCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-black rounded-xl border border-amber-200 bg-white text-right cursor-pointer appearance-none focus:outline-none focus:border-amber-600"
                          >
                            <option value="all">كل الأقسام والمجموعات</option>
                            {categories.filter(c => c.id !== 'all').map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">▼</span>
                        </div>
                      </div>

                      {/* ITEMS LIST GRID */}
                      <div className="space-y-3.5 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
                        {menuItems
                          .filter(item => {
                            const matchesSearch = item.name.toLowerCase().includes(adminMenuSearch.toLowerCase()) || 
                                                  (item.description && item.description.toLowerCase().includes(adminMenuSearch.toLowerCase()));
                            const matchesCategory = adminMenuCategory === 'all' || item.category === adminMenuCategory;
                            return matchesSearch && matchesCategory;
                          })
                          .map((item) => {
                            const isWeight = typeof item.price !== 'number';
                            const categoryName = categories.find(c => c.id === item.category)?.name || item.category;

                            return (
                              <div 
                                key={item.id} 
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                  item.isAvailable !== false 
                                    ? 'bg-white border-stone-200/80 hover:border-amber-300' 
                                    : 'bg-stone-50/80 border-dashed border-stone-200 opacity-75'
                                }`}
                              >
                                {/* Left Side: Thumbnail & Text Info */}
                                <div className="flex items-center gap-3.5">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center relative">
                                    {item.image ? (
                                      <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120";
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xl">🍲</span>
                                    )}
                                    {item.isAvailable === false && (
                                      <div className="absolute inset-0 bg-red-950/75 flex items-center justify-center">
                                        <span className="text-[8px] font-black text-white px-1 py-0.5 rounded bg-red-650">غير متوفر</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-1 text-right">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="text-xs sm:text-sm font-black text-stone-900">{item.name}</h5>
                                      <span className="px-2 py-0.5 text-[8px] font-black bg-amber-50 border border-amber-200 text-amber-800 rounded">
                                        {categoryName}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[10px] text-gray-400 font-medium max-w-sm line-clamp-1">{item.description}</p>
                                    )}
                                    <div className="text-xs font-bold text-stone-750">
                                      {isWeight ? (
                                        <span className="flex items-center gap-1 font-mono text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded w-max">
                                          🏷️ {Object.entries(item.price as { [key: string]: number }).map(([sz, pr]) => `${sz}: ${pr}ج.م`).join(' | ')}
                                        </span>
                                      ) : (
                                        <span className="text-amber-950 font-black font-mono">{item.price as number} ج.م</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side: Availability Switch & Actions */}
                                <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-0 pt-3 sm:pt-0 border-stone-100">
                                  
                                  {/* AVAILABILITY TOGGLE BUTTON */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-stone-500">متاح للطلب بالمطبخ:</span>
                                    <button
                                      onClick={() => handleToggleMenuItemAvailability(item.id, item.isAvailable !== false)}
                                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        item.isAvailable !== false ? 'bg-green-600' : 'bg-stone-300'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          item.isAvailable !== false ? '-translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>

                                  {/* Actions: Edit & Delete */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => openMenuItemModal(item)}
                                      className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-50 rounded-lg border border-transparent hover:border-stone-200 transition-all cursor-pointer"
                                      title="تعديل الصنف"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMenuItem(item.id)}
                                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                      title="حذف الصنف"
                                    >
                                      🗑️
                                    </button>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-amber-950 text-amber-100 border-t-4 border-amber-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <AbuGouraLogo className="w-16 h-16" />
            <span className="font-serif text-2xl font-black text-white">مطعم أبو قورة</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/70 max-w-lg mx-auto leading-relaxed">
            تأصيل الطعم البلدي والمأكولات الشعبية المصرية بلمسات كرم وجود زمان. صواني العائلة وطواجن فخار اللحم المسبكة، نوصلها ساخنة إلى باب بيتك.
          </p>
          <div className="flex justify-center gap-6 text-xs text-amber-200/50">
            <span>الخط الساخن: 19XXX</span>
            <span>الفروع: حدائق أكتوبر، الجيزة</span>
            <span>الخدمة: 24 ساعة طوال الأسبوع</span>
          </div>
          <div className="text-[10px] text-amber-200/30 border-t border-amber-900/50 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>جميع الحقوق محفوظة لمطعم أبو قورة © {new Date().getFullYear()} - تم التطوير باحترافية كاملة وبأعلى كفاءة.</span>
            <button 
              onClick={handleOpenAdminPortal} 
              className="hover:text-amber-400 transition-colors cursor-pointer underline decoration-amber-200/10 text-[10px] font-bold"
            >
              بوابة الإدارة 🔒
            </button>
          </div>
        </div>
      </footer>

      {/* --- CART AND CHECKOUT SIDE DRAWER --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-[5000] cursor-pointer"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white z-[5000] shadow-2xl flex flex-col justify-between border-l border-amber-100"
            >
              
              {/* Drawer Header */}
              <div className="p-4 bg-stone-50 border-b border-stone-200/55 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  <span>سلة مأكولاتك (السلعة)</span>
                  <span className="bg-amber-500 text-stone-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                    {cart.reduce((s, i) => s + i.quantity, 0)} صنف
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-stone-100 hover:text-stone-900 rounded-lg text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-24 text-gray-400 space-y-3">
                    <ShoppingBag className="w-16 h-16 mx-auto opacity-30 animate-pulse" />
                    <p className="text-sm font-bold">سلعتك فارغة تماماً يا فندم!</p>
                    <p className="text-xs text-gray-500">اذهب لقائمة الطعام واضف ألذ الأصناف الساخنة</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-4 py-2 bg-stone-950 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-stone-850 transition-colors"
                    >
                      تصفح الأكلات الشهية
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">الأصناف المحددة</h4>
                      
                      {cart.map((item) => {
                        const dbItem = menuItems.find((m) => m.id === item.menuItemId);
                        const isAvailable = dbItem ? dbItem.isAvailable !== false : true;
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl flex items-start justify-between gap-4 relative border transition-all ${
                              isAvailable
                                ? 'bg-stone-50/60 border-stone-200/60'
                                : 'bg-red-50/50 border-red-200/60'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className={`text-xs sm:text-sm font-bold pr-1 ${isAvailable ? 'text-stone-950' : 'text-red-950 line-through'}`}>{item.name}</h5>
                                {!isAvailable && (
                                  <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md animate-pulse">
                                    غير متوفر ⚠️
                                  </span>
                                )}
                              </div>
                            {item.selectedSize && (
                              <span className="text-[10px] font-bold text-amber-850 bg-amber-50/50 border border-amber-100 px-2 py-0.5 rounded-md">
                                حجم: {item.selectedSize}
                              </span>
                            )}
                            
                            {item.additions && item.additions.length > 0 && (
                              <div className="text-[10px] text-stone-500 font-medium">
                                🥗 إضافات: {item.additions.map((a) => a.name).join('، ')}
                              </div>
                            )}

                            <p className="text-xs font-black text-amber-850 pt-1">
                              {item.unitPrice * item.quantity} ج.م <span className="text-stone-450 font-normal">({item.unitPrice} ج.م / للقطعة)</span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end justify-between h-full min-h-[64px]">
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="إزالة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Quantity controls */}
                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => handleUpdateCartQty(item.id, -1)}
                                className="p-1 text-gray-500 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-black text-stone-800">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQty(item.id, 1)}
                                className="p-1 text-gray-500 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}

                      <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-sm font-bold text-stone-900">
                        <span>إجمالي ثمن المأكولات:</span>
                        <span className="text-lg text-amber-850 font-black font-mono">{cartTotal} ج.م</span>
                      </div>
                    </div>

                    {/* CHECKOUT DELIVERY FORM */}
                    <form onSubmit={handlePlaceOrder} className="space-y-4 pt-6 border-t border-stone-200">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        🚚 بيانات التوصيل المباشر والـ GPS
                      </h4>

                      {/* User Account / Auto-fill integration */}
                      {!isUserLoggedIn ? (
                        <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 rounded-2xl space-y-2 text-right">
                          <p className="text-xs font-black text-amber-950 flex items-center gap-1">
                            <span>👤</span>
                            هل تريد حفظ بياناتك لسهولة الطلب مستقبلاً؟
                          </p>
                          <p className="text-[10px] text-amber-800 leading-normal font-bold">
                            سجل حسابك الآن برقم تليفونك لحفظ الاسم، العنوان، وإحداثيات الموقع وتعبئتها تلقائياً في ثوانٍ معدودة!
                          </p>
                          <div className="flex gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                clearUserForm();
                                setUserAuthModal('login');
                              }}
                              className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-850 text-white text-[11px] font-black rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              تسجيل الدخول
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                clearUserForm();
                                setUserFormName(customerName);
                                setUserFormPhone(phoneNumber);
                                setUserFormAddress(address);
                                setUserAuthModal('register');
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 text-[11px] font-black rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              إنشاء حساب جديد
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/60 border border-emerald-200/50 p-3.5 rounded-2xl flex items-center justify-between text-right gap-3">
                          <div>
                            <p className="text-xs font-black text-emerald-950">
                              👋 مرحباً بك يا غالي، {userProfile?.name}
                            </p>
                            <p className="text-[10px] text-emerald-850 font-bold mt-0.5">
                              تم ملء بيانات الاتصال والتوصيل تلقائياً من ملفك الشخصي الآمن (MongoDB + Local).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={openUserProfile}
                            className="text-[10px] font-black text-emerald-950 bg-white border border-emerald-300 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer shrink-0"
                          >
                            الملف الشخصي 👤
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">اسمك الكريم *</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="اكتب اسمك الثلاثي"
                          className="w-full px-3.5 py-2 rounded-lg border-2 border-stone-100 focus:outline-none focus:border-amber-500 bg-stone-50/50 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">رقم تليفونك للتنسيق مع الطيار *</label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="رقم الموبايل (مثال: 01012345678)"
                          className="w-full px-3.5 py-2 rounded-lg border-2 border-stone-100 focus:outline-none focus:border-amber-500 bg-stone-50/50 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">العنوان بالتفصيل الممل *</label>
                        <textarea
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={2}
                          placeholder="المنطقة، الشارع، رقم العمارة، رقم الشقة أو الدور وعلامة مميزة"
                          className="w-full px-3.5 py-2 rounded-lg border-2 border-stone-100 focus:outline-none focus:border-amber-500 bg-stone-50/50 text-xs font-medium"
                        />
                      </div>

                      {/* GPS GEOLOCATION PANEL */}
                      <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-stone-900 flex items-center gap-1">
                            تحديد موقعك الجغرافي بدقة متناهية
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">مطلوب لتحديد خط السير</span>
                        </div>

                        {/* Leaflet selector map component */}
                        <LeafletSelectorMap
                          lat={location ? location.latitude : 29.9115778}
                          lng={location ? location.longitude : 31.0589758}
                          onChange={(lat, lng, accuracy) => {
                            setLocation({ latitude: lat, longitude: lng, accuracy });
                          }}
                        />

                        <p className="text-[10px] text-stone-500 leading-normal font-medium text-right">
                          اسحب الدبوس الأحمر أعلاه لوضعه على منزلك بدقة متناهية، أو اضغط الزر بالأسفل لجلب موقعك تلقائياً عبر المستشعر.
                        </p>

                        <button
                          type="button"
                          onClick={handleLocateUser}
                          className={`w-full py-2.5 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            locatingState === 'locating'
                              ? 'bg-amber-100 text-amber-900 cursor-not-allowed'
                              : locatingState === 'success'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-stone-900 hover:bg-stone-850 text-white shadow-sm'
                          }`}
                        >
                          <Navigation className={`w-3.5 h-3.5 ${locatingState === 'locating' ? 'animate-spin' : ''}`} />
                          {locatingState === 'idle' && 'تحديد موقعي التلقائي بالـ GPS 🛰️'}
                          {locatingState === 'locating' && 'جاري جلب إحداثيات الـ GPS حالياً...'}
                          {locatingState === 'success' && 'تم جلب موقعك بالـ GPS وتحديث الخريطة!'}
                          {locatingState === 'error' && 'إعادة تحديد الموقع بالـ GPS 🔄'}
                        </button>

                        {/* Location feedback display */}
                        {location && (
                          <div className="bg-white border border-stone-200 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                            <div className="text-stone-800 font-bold">
                              <span>خط العرض: {location.latitude.toFixed(5)}</span>
                              <span className="mx-2">|</span>
                              <span>خط الطول: {location.longitude.toFixed(5)}</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">مؤمن GPS</span>
                          </div>
                        )}

                        {gpsErrorMsg && (
                          <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2 rounded">
                            ⚠️ {gpsErrorMsg} (يمكنك سحب الدبوس يدوياً بدلاً من ذلك)
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظات إضافية أو طلبات خاصة (اختياري)</label>
                        <input
                          type="text"
                          value={customNotes}
                          onChange={(e) => setCustomNotes(e.target.value)}
                          placeholder="مثلاً: يرجى إرسال عيش زيادة، الصلصة حارة، أو غيره"
                          className="w-full px-3.5 py-2 rounded-lg border-2 border-stone-100 focus:outline-none focus:border-amber-500 bg-stone-50/50 text-xs font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingOrder}
                        className={`w-full py-3.5 ${isSubmittingOrder ? 'bg-stone-500 cursor-not-allowed' : 'bg-stone-950 hover:bg-stone-850 cursor-pointer'} text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {isSubmittingOrder ? 'جاري الإرسال...' : `إرسال الطلب للمطبخ فوراً (${cartTotal} ج.م)`}
                      </button>
                    </form>
                  </>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- CART ITEM CUSTOMIZATION DIALOG MODAL --- */}
      <AnimatePresence>
        {customizingItem && (
          <div className="fixed inset-0 z-[5000] overflow-y-auto flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-[32px] overflow-hidden w-full max-w-lg z-10 border border-stone-200/40 shadow-2xl relative flex flex-col max-h-[88vh] sm:max-h-[85dvh]"
            >
              {/* Banner Image for food customization */}
              {customizingItem.image && (
                <div className="hidden sm:block h-44 w-full relative overflow-hidden flex-shrink-0">
                  <img
                    src={customizingItem.image}
                    alt={customizingItem.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 right-4">
                    <span className="text-[10px] tracking-wider font-extrabold bg-stone-950 text-white px-3 py-1 rounded-full shadow-md border border-white/10">
                      {categories.find((c) => c.id === customizingItem.category)?.name}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Modal Header */}
              <div className="p-5 bg-stone-50 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h4 className="text-base sm:text-lg font-serif font-black text-stone-950">{customizingItem.name}</h4>
                  <p className="text-[11px] text-stone-500 font-bold mt-0.5">خصص طلبك وسجل تفضيلاتك قبل الإضافة للسلّة</p>
                </div>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 text-stone-400 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Scroll */}
              <div className="p-5 space-y-6 overflow-y-auto flex-1 min-h-0 max-h-[44vh] sm:max-h-[55vh] scrollbar-thin">
                
                {/* 1. Size / Weight Selection */}
                {customizingItem.sizes && customizingItem.sizes.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
                      1. حدد الحجم / الوزن المطلق:
                    </h5>
                    <div className="grid grid-cols-4 gap-2.5">
                      {customizingItem.sizes.map((size) => {
                        const priceForSize = (customizingItem.price as { [key: string]: number })[size] || 0;
                        const isSizeActive = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`p-2.5 rounded-2xl text-center border-2 transition-all cursor-pointer ${
                              isSizeActive
                                ? 'border-rose-900 bg-rose-50/40 text-rose-950 font-extrabold shadow-sm'
                                : 'border-stone-100 hover:border-stone-200 text-stone-700 bg-stone-50/50'
                            }`}
                          >
                            <p className="text-xs font-black">{size}</p>
                            <p className="text-[10px] text-stone-500 font-bold font-mono mt-0.5">{priceForSize} ج.م</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Additions Tickboxes */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-rose-600 rounded-full" />
                    2. الإضافات الرائعة المتاحة (حسب اختيارك):
                  </h5>
                  <div className="grid grid-cols-2 gap-2.5">
                    {additionsList.map((add) => {
                      const isSelected = selectedAdditions.some((item) => item.name === add.name);
                      return (
                        <button
                          key={add.name}
                          type="button"
                          onClick={() => handleToggleAddition(add)}
                          className={`p-3 rounded-2xl border text-right text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold shadow-sm'
                              : 'border-stone-100 hover:border-stone-200 text-stone-700 bg-stone-50/50'
                          }`}
                        >
                          <span className="font-bold">{add.name}</span>
                          <span className="text-[10px] font-black text-emerald-700 font-mono bg-emerald-100/60 px-2 py-0.5 rounded-md">+{add.price} ج.م</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quantity selection */}
                <div className="flex items-center justify-between pt-5 border-t border-stone-100">
                  <h5 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
                    3. الكمية المطلوبة للطلب:
                  </h5>
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50 scale-105">
                    <button
                      onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                      className="p-2 text-stone-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-xs font-black text-stone-950 font-mono">{customQuantity}</span>
                    <button
                      onClick={() => setCustomQuantity(customQuantity + 1)}
                      className="p-2 text-stone-500 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4. Interactive Rating Component */}
                <div className="pt-5 border-t border-stone-100">
                  <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-4 border border-stone-100/80 flex flex-col items-center text-center space-y-3.5 select-none shadow-[0_2px_15px_-4px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse-glow" />
                      <h5 className="text-xs font-black text-stone-900">ما هو تقييمك لطعم وجودة هذا الصنف؟</h5>
                    </div>
                    
                    {ratedItems[customizingItem.id] ? (
                      <p className="text-[11px] text-emerald-850 font-black flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl w-full">
                        <span>✅ شكرًا جزيلًا! تم تسجيل تقييمك بنجاح.</span>
                      </p>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 w-full">
                        <div className="flex items-center gap-2.5 justify-center py-1">
                          {[1, 2, 3, 4, 5].map((starValue) => {
                            const isHoveredOrSelected = selectedUserRating >= starValue;
                            return (
                              <button
                                key={starValue}
                                type="button"
                                onClick={() => setSelectedUserRating(starValue)}
                                className="transform hover:scale-125 active:scale-95 transition-all duration-200 p-0.5 focus:outline-none cursor-pointer"
                              >
                                <Star
                                  className={`w-7 h-7 cursor-pointer transition-colors ${
                                    isHoveredOrSelected
                                      ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                                      : 'text-stone-300 hover:text-amber-400'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        {selectedUserRating > 0 && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            type="button"
                            disabled={isSubmittingRating}
                            onClick={() => submitRating(customizingItem.id, selectedUserRating)}
                            className="w-full max-w-xs py-2 bg-stone-950 hover:bg-stone-850 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isSubmittingRating ? 'جاري تسجيل التقييم...' : 'تأكيد إرسال تقييمي 🌟'}
                          </motion.button>
                        )}
                      </div>
                    )}

                    {ratingFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-amber-950 font-bold bg-amber-50 border border-amber-150 px-3 py-2 rounded-lg leading-relaxed text-center w-full"
                      >
                        {ratingFeedback}
                      </motion.div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-stone-500 font-bold">مجموع سعر الفردي: {getCustomizedTotalSinglePrice()} ج.م</p>
                  <p className="text-sm sm:text-base font-black text-rose-900 font-mono">الإجمالي: {getCustomizedTotalSinglePrice() * customQuantity} ج.م</p>
                </div>
                <button
                  onClick={handleConfirmAddToCart}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  إضافة الوجبة للسلّة
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM IMAGE PREVIEW MODAL --- */}
      <AnimatePresence>
        {imagePreviewItem && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setImagePreviewItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-2xl z-10 border border-stone-100 shadow-2xl relative flex flex-col"
            >
              <button
                onClick={() => setImagePreviewItem(null)}
                className="absolute top-4 left-4 z-20 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm cursor-pointer shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-[300px] sm:h-[420px] overflow-hidden bg-stone-950">
                <img
                  src={imagePreviewItem.image}
                  alt={imagePreviewItem.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-950 to-transparent" />
                <div className="absolute bottom-6 right-6 left-6 text-right text-white">
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-3 py-1 rounded-full mb-3 inline-block">
                    {categories.find((c) => c.id === imagePreviewItem.category)?.name}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black mb-2 drop-shadow-md">
                    {imagePreviewItem.name}
                  </h3>
                  <p className="text-stone-200 text-sm font-medium line-clamp-3 leading-relaxed max-w-xl drop-shadow-sm">
                    {imagePreviewItem.description || 'أشهى مأكولات مطعم أبو قورة المحضرة بأجود المكونات الطازجة والسمن البلدي.'}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-stone-100 text-right">
                <div>
                  <span className="text-xs text-stone-500 font-bold block mb-1">سعر الصنف</span>
                  <span className="text-2xl font-black text-rose-900">
                    {typeof imagePreviewItem.price === 'number'
                      ? `${imagePreviewItem.price} ج.م`
                      : `يبدأ من ${Math.min(...(Object.values(imagePreviewItem.price) as number[]))} ج.م`}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setImagePreviewItem(null);
                      openCustomizer(imagePreviewItem);
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-rose-900 to-rose-950 hover:from-rose-850 hover:to-rose-900 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-rose-900/20 hover:scale-[1.02] active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    تخصيص وإضافة للطلب
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADMIN AUTH MODAL (LOGIN & INITIAL SIGNUP) --- */}
      <AnimatePresence>
        {adminAuthModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminAuthModal(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md z-10 border border-amber-100 shadow-2xl space-y-4"
            >
              <div className="text-center">
                <div className="bg-red-50 p-3 rounded-full w-max mx-auto mb-2.5">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="text-lg font-serif font-black text-amber-950">
                  {isResetMode 
                    ? '🔧 إعادة تعيين حساب الإدارة بالكامل' 
                    : (adminAuthModal === 'register' ? 'إنشاء حساب الأدمن لأول مرة فقط' : 'تسجيل دخول لوحة الإدارة')}
                </h4>
                <p className="text-xs text-gray-500 leading-normal">
                  {isResetMode 
                    ? 'هل نسيت أو ترغب بتغيير بياناتك؟ اكتب اسم المستخدم الجديد وكلمة المرور الجديدة الآن لتجاوز أي قفل سابق والدخول فوراً.'
                    : (adminAuthModal === 'register'
                      ? 'هذه الشاشة تظهر للمرة الأولى لتسجيل الحساب الإداري، ولن يتمكن أي شخص آخر من التسجيل لاحقاً.'
                      : 'الرجاء إدخال بيانات حساب الإدارة الموثقة لمتابعة كشف الطلبات.')}
                </p>
              </div>

              <form onSubmit={handleAdminAuthSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="اكتب اسم المستخدم الجديد أو الحالي"
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-amber-100 focus:outline-none focus:border-red-600 text-sm font-medium bg-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور السرية</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-amber-100 focus:outline-none focus:border-red-600 text-sm font-medium bg-white text-right"
                  />
                </div>

                {(isResetMode || adminAuthModal === 'register') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 text-red-700">
                      {isResetMode ? '🔒 رمز الأمان الاستردادي لتأكيد الهوية' : '🔐 رمز الأمان الاستردادي (لحماية الحساب من السرقة)'}
                    </label>
                    <input
                      type="password"
                      required
                      value={authSecurityCode}
                      onChange={(e) => setAuthSecurityCode(e.target.value)}
                      placeholder={isResetMode ? "اكتب رمز الأمان لإثبات ملكيتك" : "اختر رمزاً قوياً لتأمين حسابك مستقبلاً"}
                      className="w-full px-3.5 py-2 rounded-lg border-2 border-amber-200 focus:outline-none focus:border-red-600 text-sm font-bold bg-amber-50/55 text-right"
                    />
                  </div>
                )}

                {authError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded flex items-center gap-1 justify-center">
                    ❌ {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isResetMode 
                    ? 'تأكيد إعادة التعيين والدخول فوراً 🔑' 
                    : (adminAuthModal === 'register' ? 'تأكيد التسجيل وتفعيل الحساب' : 'تسجيل الدخول للإدارة')}
                </button>
              </form>

              {/* Reset/Toggle links */}
              <div className="text-center pt-1">
                {isResetMode ? (
                  <button
                    onClick={() => {
                      setIsResetMode(false);
                      setAuthError('');
                    }}
                    className="text-xs font-black text-red-600 hover:underline cursor-pointer"
                  >
                    العودة لصفحة الدخول العادي ↩️
                  </button>
                ) : (
                  adminAuthModal === 'login' && (
                    <button
                      onClick={() => {
                        setIsResetMode(true);
                        setAuthError('');
                        setAuthUsername('');
                        setAuthPassword('');
                      }}
                      className="text-xs font-black text-amber-700 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      نسيت كلمة المرور؟ اضغط هنا لإعادة تعيين الحساب بالكامل 🔄
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => {
                  setAdminAuthModal(null);
                  setIsResetMode(false);
                  setAuthError('');
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all"
              >
                العودة للمطعم
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CLIENT USER AUTH & PROFILE MODALS (LOGIN, REGISTER, PROFILE) --- */}
      <AnimatePresence>
        {userAuthModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!userFormLoading) {
                  setUserAuthModal(null);
                  clearUserForm();
                }
              }}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg z-10 border border-stone-200 shadow-2xl space-y-4 relative overflow-hidden text-right"
              style={{ direction: 'rtl' }}
            >
              
              {/* Header */}
              <div className="text-center pb-2 border-b border-stone-100">
                <div className="bg-amber-50 p-3 rounded-full w-max mx-auto mb-2">
                  <User className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="text-lg font-serif font-black text-amber-950">
                  {userAuthModal === 'login' && '🔐 تسجيل دخول العملاء'}
                  {userAuthModal === 'register' && '📝 إنشاء حساب عميل جديد'}
                  {userAuthModal === 'profile' && '👤 ملفك الشخصي الآمن'}
                </h4>
                <p className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
                  {userAuthModal === 'login' && 'سجل دخولك لتعبئة طلباتك وعناوينك تلقائياً وبأقصى سرعة.'}
                  {userAuthModal === 'register' && 'انضم إلينا واحفظ تفاصيل وموقع منزلك بدقة متناهية.'}
                  {userAuthModal === 'profile' && 'إدارة وتعديل بيانات الاتصال وموقع التوصيل الخاص بك.'}
                </p>
              </div>

              {/* Error & Success Messages */}
              {userFormError && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl flex items-center gap-1.5 justify-center border border-red-200">
                  <span>❌</span>
                  <span>{userFormError}</span>
                </div>
              )}
              {userFormSuccess && (
                <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl flex items-center gap-1.5 justify-center border border-emerald-200">
                  <span>✅</span>
                  <span>{userFormSuccess}</span>
                </div>
              )}

              {/* Login Form */}
              {userAuthModal === 'login' && (
                <form onSubmit={handleUserLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم موبايلك (المسجل) *</label>
                    <input
                      type="tel"
                      required
                      value={userFormPhone}
                      onChange={(e) => setUserFormPhone(e.target.value)}
                      placeholder="مثال: 01012345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-sm font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور السرية *</label>
                    <input
                      type="password"
                      required
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-sm font-bold bg-white text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={userFormLoading}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {userFormLoading ? 'جاري التحقق...' : 'دخول حسابي الآن 🔐'}
                  </button>

                  <div className="text-center pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-xs">
                    <span className="text-stone-500">ليس لديك حساب؟</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearUserForm();
                        setUserAuthModal('register');
                      }}
                      className="font-black text-amber-700 hover:underline cursor-pointer"
                    >
                      إنشاء حساب جديد 📝
                    </button>
                  </div>
                </form>
              )}

              {/* Register Form */}
              {userAuthModal === 'register' && (
                <form onSubmit={handleUserRegister} className="space-y-3 max-h-[60vh] overflow-y-auto px-1 scrollbar-thin">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={userFormName}
                      onChange={(e) => setUserFormName(e.target.value)}
                      placeholder="اكتب اسمك الثلاثي"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف المعتمد *</label>
                    <input
                      type="tel"
                      required
                      value={userFormPhone}
                      onChange={(e) => setUserFormPhone(e.target.value)}
                      placeholder="مثال: 01123456789"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اختر كلمة مرور آمنة لتأمين حسابك *</label>
                    <input
                      type="password"
                      required
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">العنوان بالتفصيل *</label>
                    <textarea
                      required
                      rows={2}
                      value={userFormAddress}
                      onChange={(e) => setUserFormAddress(e.target.value)}
                      placeholder="المنطقة، الشارع، العمارة واللوكيشن المكتوب"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  {/* GPS Locator */}
                  <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 space-y-2">
                    <span className="text-[10px] font-black text-stone-900 block">حدد موقعك الدقيق على الخريطة لتسهيل التوصيل:</span>
                    <LeafletSelectorMap
                      lat={userFormLocation ? userFormLocation.latitude : (location ? location.latitude : 29.9115778)}
                      lng={userFormLocation ? userFormLocation.longitude : (location ? location.longitude : 31.0589758)}
                      onChange={(lat, lng, accuracy) => {
                        setUserFormLocation({ latitude: lat, longitude: lng, accuracy });
                      }}
                    />
                    <p className="text-[9px] text-gray-400 font-bold leading-normal">
                      اسحب الدبوس الأحمر لوضعه على منزلك بدقة متناهية. سيتم حفظ هذا التموضع تلقائياً في حسابك.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={userFormLoading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {userFormLoading ? 'جاري حفظ البيانات...' : 'تأكيد إنشاء الحساب والموقع 📝'}
                  </button>

                  <div className="text-center pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-xs">
                    <span className="text-stone-500">لديك حساب بالفعل؟</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearUserForm();
                        setUserAuthModal('login');
                      }}
                      className="font-black text-amber-700 hover:underline cursor-pointer"
                    >
                      تسجيل الدخول فوراً 🔐
                    </button>
                  </div>
                </form>
              )}

              {/* Profile/Update Form */}
              {userAuthModal === 'profile' && (
                <form onSubmit={handleUserUpdateProfile} className="space-y-3 max-h-[60vh] overflow-y-auto px-1 scrollbar-thin">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">رقم الهاتف (غير قابل للتعديل)</label>
                    <input
                      type="text"
                      disabled
                      value={userFormPhone}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-100 text-xs font-bold text-stone-500 text-right cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكريم *</label>
                    <input
                      type="text"
                      required
                      value={userFormName}
                      onChange={(e) => setUserFormName(e.target.value)}
                      placeholder="اكتب اسمك الثلاثي"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تحديث كلمة المرور (اختياري)</label>
                    <input
                      type="password"
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      placeholder="اكتب كلمة مرور جديدة للتمكين أو اتركه فارغاً"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">العنوان بالتفصيل *</label>
                    <textarea
                      required
                      rows={2}
                      value={userFormAddress}
                      onChange={(e) => setUserFormAddress(e.target.value)}
                      placeholder="المنطقة، الشارع واللوكيشن"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-100 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white text-right"
                    />
                  </div>

                  {/* GPS Locator */}
                  <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 space-y-2">
                    <span className="text-[10px] font-black text-stone-900 block">تحديث موقع الـ GPS المفضل الخاص بك:</span>
                    <LeafletSelectorMap
                      lat={userFormLocation ? userFormLocation.latitude : (userProfile?.location?.latitude || 29.9115778)}
                      lng={userFormLocation ? userFormLocation.longitude : (userProfile?.location?.longitude || 31.0589758)}
                      onChange={(lat, lng, accuracy) => {
                        setUserFormLocation({ latitude: lat, longitude: lng, accuracy });
                      }}
                    />
                    <p className="text-[9px] text-gray-400 font-bold leading-normal">
                      قم بسحب الدبوس لوضع منزلك بدقة. سيتم استخدامه مباشرة عند تفعيل أي طلب توصيل!
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={userFormLoading}
                      className="flex-1 py-3 bg-stone-950 hover:bg-stone-850 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer text-center"
                    >
                      {userFormLoading ? 'جاري التعديل...' : 'حفظ التعديلات 💾'}
                    </button>
                    <button
                      type="button"
                      onClick={handleUserLogout}
                      className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-650 font-black text-xs rounded-xl border border-red-200 transition-all cursor-pointer text-center"
                    >
                      تسجيل خروج 👋
                    </button>
                  </div>
                </form>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setUserAuthModal(null);
                  clearUserForm();
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                العودة للمطعم
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD/EDIT MENU ITEM MODAL --- */}
      <AnimatePresence>
        {isMenuItemModalOpen && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuItemModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg z-10 border border-stone-250 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin text-right"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                  <span>{editingMenuItem ? '✏️ تعديل صنف طعام' : '➕ إضافة صنف جديد للمنيو'}</span>
                </h3>
                <button
                  onClick={() => setIsMenuItemModalOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitMenuItem} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-750 mb-1">اسم الصنف (الأكلة) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ممبار بلدي أبو قورة"
                    value={menuItemForm.name}
                    onChange={(e) => setMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-stone-750 mb-1">القسم / الفئة التابع لها *</label>
                  <select
                    required
                    value={menuItemForm.category}
                    onChange={(e) => setMenuItemForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs font-black rounded-xl border border-amber-200 bg-white cursor-pointer focus:outline-none focus:border-amber-600"
                  >
                    <option value="" disabled>اختر القسم المناسب</option>
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-stone-750 mb-1">وصف المكونات والخلطة (اختياري)</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: ممبار متبل بخلطة الأرز والنعناع والأعشاب الطازجة ومقلي بالزيت البلدي الساخن مقرمش شهي جداً"
                    value={menuItemForm.description}
                    onChange={(e) => setMenuItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white"
                  />
                </div>

                {/* Image Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-750 mb-1">صورة الأكلة (رفع من جهازك أو رابط مباشر) *</label>
                  
                  {/* Image Preview & Upload options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Drag and Drop Zone */}
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition relative group min-h-[120px] ${
                        isDraggingImage 
                          ? 'border-amber-600 bg-amber-100/40 scale-[1.02]' 
                          : 'border-amber-200 hover:border-amber-500 bg-amber-50/20'
                      }`}
                      onClick={() => document.getElementById('image-file-upload')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(true);
                      }}
                      onDragLeave={() => {
                        setIsDraggingImage(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(false);
                        const file = e.dataTransfer.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          showToast('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP).', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const MAX_DIM = 600;
                            if (width > MAX_DIM || height > MAX_DIM) {
                              if (width > height) {
                                height = Math.round((height * MAX_DIM) / width);
                                width = MAX_DIM;
                              } else {
                                width = Math.round((width * MAX_DIM) / height);
                                height = MAX_DIM;
                              }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              const base64 = canvas.toDataURL('image/jpeg', 0.85);
                              setMenuItemForm(prev => ({ ...prev, image: base64 }));
                              showToast('تم تحميل الصورة وضغطها بنجاح! 📸', 'success');
                            } else {
                              setMenuItemForm(prev => ({ ...prev, image: event.target?.result as string }));
                            }
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    >
                      <input 
                        type="file" 
                        id="image-file-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            showToast('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP).', 'error');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const MAX_DIM = 600;
                              if (width > MAX_DIM || height > MAX_DIM) {
                                if (width > height) {
                                  height = Math.round((height * MAX_DIM) / width);
                                  width = MAX_DIM;
                                } else {
                                  width = Math.round((width * MAX_DIM) / height);
                                  height = MAX_DIM;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const base64 = canvas.toDataURL('image/jpeg', 0.85);
                                setMenuItemForm(prev => ({ ...prev, image: base64 }));
                                showToast('تم تحميل الصورة وضغطها بنجاح! 📸', 'success');
                              } else {
                                setMenuItemForm(prev => ({ ...prev, image: event.target?.result as string }));
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <div className="text-center space-y-1">
                        <span className="text-2xl text-amber-600 block">📥</span>
                        <span className="text-[11px] font-black text-amber-950 block">اضغط أو اسحب لرفع صورة</span>
                        <span className="text-[9px] text-gray-400 font-bold block">يدعم PNG، JPG، WEBP (يتم ضغطها تلقائياً)</span>
                      </div>
                    </div>

                    {/* Preview or URL paste */}
                    <div className="bg-stone-50 rounded-2xl p-3 border border-amber-100 flex flex-col justify-between min-h-[120px]">
                      {menuItemForm.image ? (
                        <div className="flex items-center gap-3 h-full relative">
                          <img 
                            src={menuItemForm.image} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-xl object-cover border border-amber-200 bg-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] font-bold text-green-700 block bg-green-50 px-2 py-0.5 rounded-lg w-max">تم تعيين الصورة ✅</span>
                            <span className="text-[9px] text-gray-400 block truncate max-w-[140px]" dir="ltr">
                              {menuItemForm.image.startsWith('data:') ? 'صورة مرفوعة (Base64)' : menuItemForm.image.slice(0, 30) + '...'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMenuItemForm(prev => ({ ...prev, image: '' }))}
                              className="text-[10px] font-black text-red-600 hover:text-red-800 underline block"
                            >
                              حذف وإعادة تعيين الصورة
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 h-full relative">
                          <img 
                            src={ITEM_SPECIFIC_IMAGES[editingMenuItem?.id || ''] || CATEGORY_IMAGES[menuItemForm.category] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'} 
                            alt="Default Fallback" 
                            className="w-16 h-16 rounded-xl object-cover border border-dashed border-amber-300 opacity-65 bg-white"
                          />
                          <div className="flex-1 space-y-0.5">
                            <span className="text-[10px] font-black text-amber-900 block">صورة القسم الافتراضية 📁</span>
                            <span className="text-[9px] text-gray-500 font-bold block">سيتم استخدام صورة القسم التلقائية المعروضة في حال لم تقم برفع صورة مخصصة.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual URL input as a secondary fallback option */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">أو أدخل رابط الصورة المباشر يدوياً:</span>
                    <input
                      type="text"
                      placeholder="مثال: https://images.unsplash.com/... أو /assets/img.jpg"
                      value={menuItemForm.image.startsWith('data:image/') ? '' : menuItemForm.image}
                      onChange={(e) => setMenuItemForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 text-[10px] font-mono rounded-xl border border-amber-100 focus:outline-none focus:border-amber-500 bg-white text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Switch for pricing mode */}
                <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-100/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-amber-950 block">هل الصنف له أحجام متعددة؟</span>
                    <span className="text-[10px] text-gray-400 font-bold block">مثل: ربع، نص، كيلو، إلخ بأسعار مختلفة</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuItemForm(prev => ({ ...prev, hasMultipleSizes: !prev.hasMultipleSizes }))}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      menuItemForm.hasMultipleSizes ? 'bg-amber-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        menuItemForm.hasMultipleSizes ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Single Price Input */}
                {!menuItemForm.hasMultipleSizes ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-750 mb-1">سعر الوجبة الفردية (ج.م) *</label>
                    <input
                      type="number"
                      required={!menuItemForm.hasMultipleSizes}
                      min={0}
                      placeholder="مثال: 120"
                      value={menuItemForm.price || ''}
                      onChange={(e) => setMenuItemForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-200 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>
                ) : (
                  /* Multiple Sizes Configuration */
                  <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                    <span className="text-xs font-black text-stone-850 block">تكوين أحجام وأسعار الصنف:</span>
                    
                    {/* Presets */}
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuItemForm(prev => ({
                            ...prev,
                            sizes: ['ربع', 'نصف', 'كيلو'],
                            sizePrices: { 'ربع': 120, 'نصف': 240, 'كيلو': 480 }
                          }));
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-stone-150 border border-stone-200 text-stone-700 text-[10px] font-black rounded-lg transition-all"
                      >
                        🥩 أوزان (ربع/نص/كيلو)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuItemForm(prev => ({
                            ...prev,
                            sizes: ['صغير', 'وسط', 'كبير'],
                            sizePrices: { 'صغير': 80, 'وسط': 120, 'كبير': 160 }
                          }));
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-stone-150 border border-stone-200 text-stone-700 text-[10px] font-black rounded-lg transition-all"
                      >
                        🍕 أحجام (صغير/وسط/كبير)
                      </button>
                    </div>

                    {/* Added Sizes & Prices list */}
                    <div className="space-y-1.5">
                      {menuItemForm.sizes.map((sz) => (
                        <div key={sz} className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200 text-xs font-bold">
                          <span className="text-stone-800 font-black">{sz}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              required
                              min={0}
                              value={menuItemForm.sizePrices[sz] || ''}
                              onChange={(e) => {
                                const newPrices = { ...menuItemForm.sizePrices, [sz]: Number(e.target.value) };
                                setMenuItemForm(prev => ({ ...prev, sizePrices: newPrices }));
                              }}
                              className="w-20 px-2 py-1 text-xs font-bold border border-stone-200 rounded-lg text-center"
                              placeholder="السعر"
                            />
                            <span className="text-stone-400 text-[10px]">ج.م</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = menuItemForm.sizes.filter(s => s !== sz);
                                const newPrices = { ...menuItemForm.sizePrices };
                                delete newPrices[sz];
                                setMenuItemForm(prev => ({ ...prev, sizes: newSizes, sizePrices: newPrices }));
                              }}
                              className="text-red-650 hover:bg-red-50 p-1 rounded-lg"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Add Size Form */}
                    <div className="flex gap-1.5 pt-2 border-t border-stone-200/60">
                      <input
                        type="text"
                        id="new-size-name"
                        placeholder="حجم جديد (مثال: جامبو)"
                        className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-stone-200 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const sz = input.value.trim();
                            if (sz && !menuItemForm.sizes.includes(sz)) {
                              setMenuItemForm(prev => ({
                                ...prev,
                                sizes: [...prev.sizes, sz],
                                sizePrices: { ...prev.sizePrices, [sz]: 0 }
                              }));
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-size-name') as HTMLInputElement;
                          const sz = input?.value.trim();
                          if (sz && !menuItemForm.sizes.includes(sz)) {
                            setMenuItemForm(prev => ({
                              ...prev,
                              sizes: [...prev.sizes, sz],
                              sizePrices: { ...prev.sizePrices, [sz]: 0 }
                            }));
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-white font-black text-xs rounded-lg shrink-0"
                      >
                        إضافة حجم
                      </button>
                    </div>

                  </div>
                )}

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-1">
                  <span className="text-xs font-bold text-stone-750">تفعيل توافر هذا الصنف للطلب بالمطعم فوراً:</span>
                  <button
                    type="button"
                    onClick={() => setMenuItemForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      menuItemForm.isAvailable ? 'bg-green-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        menuItemForm.isAvailable ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-3 border-t border-stone-100">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer text-center"
                  >
                    حفظ التغييرات 💾
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMenuItemModalOpen(false)}
                    className="py-3 px-5 bg-stone-100 hover:bg-stone-250 text-stone-650 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    تراجع
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKOUT SUCCESS RECEIPT MODAL --- */}
      <AnimatePresence>
        {isOrderSuccessOpen && lastSubmittedOrder && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg z-10 border-2 border-green-200 shadow-2xl relative"
            >
              
              <div className="text-center space-y-2 mb-4">
                <div className="bg-emerald-50 p-3.5 rounded-full w-max mx-auto border-2 border-emerald-200 animate-bounce">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-serif font-black text-emerald-950">بالهنا والشفاء! تم إرسال طلبك بنجاح للمطبخ</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  يقوم المطبخ حالياً بتحضير أشهى المأكولات، وسيتم التواصل معك على رقم موبايلك من قبل طيار التوصيل لتأكيد تفاصيل خط السير.
                </p>
              </div>

              {/* Receipt Summary Sheet */}
              <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold">
                
                <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                  <span className="text-amber-900 font-bold">رقم الطلب الخاص بك:</span>
                  <span className="bg-red-100 text-red-800 font-black px-2.5 py-1 rounded text-sm uppercase">
                    #{lastSubmittedOrder._id?.slice(-5).toUpperCase() || 'NEW'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-gray-600">👤 الاسم: <span className="text-gray-950 font-bold">{lastSubmittedOrder.customerName}</span></p>
                  <p className="text-gray-600">📞 الهاتف: <span className="text-red-700 font-extrabold">{lastSubmittedOrder.phoneNumber}</span></p>
                  <p className="text-gray-600">📍 عنوان التوصيل: <span className="text-gray-950 font-bold">{lastSubmittedOrder.address}</span></p>
                  {lastSubmittedOrder.location && (
                    <p className="text-emerald-700 flex items-center gap-1 text-[10px]">
                      📍 تم تأمين الموقع الجغرافي بالـ GPS لطيار التوصيل.
                    </p>
                  )}
                </div>

                <div className="border-t border-amber-100/60 pt-2.5">
                  <h5 className="font-bold text-amber-950 mb-1.5">الأكلات المحضرة لك بالتفصيل:</h5>
                  <ul className="space-y-2.5">
                    {lastSubmittedOrder.items.map((item, idx) => (
                      <li key={idx} className="border-b border-amber-50 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex justify-between text-gray-800 font-bold text-xs">
                          <span>
                            <span className="text-amber-600 font-black">{item.quantity}x</span> {item.name}
                            {item.selectedSize && (
                              <span className="mr-1.5 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-medium">
                                حجم: {item.selectedSize}
                              </span>
                            )}
                          </span>
                          <span className="font-black text-gray-950">{item.unitPrice * item.quantity} ج.م</span>
                        </div>
                        {item.additions && item.additions.length > 0 && (
                          <div className="mt-1 mr-4 flex flex-wrap gap-1">
                            <span className="text-[10px] text-gray-400">🥗 الإضافات:</span>
                            {item.additions.map((add, addIdx) => (
                              <span key={addIdx} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.2 rounded-md font-medium">
                                {add.name} (+{add.price} ج.م)
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t-2 border-dashed border-amber-200 pt-3 flex justify-between items-center text-sm font-black text-amber-950">
                  <span>المبلغ المطلوب عند التوصيل (كاش):</span>
                  <span className="text-lg text-amber-850 font-black font-mono">{lastSubmittedOrder.totalPrice} ج.م</span>
                </div>

              </div>

              <div className="mt-5 space-y-2">
                <a
                  href={getWhatsAppMessageLink(lastSubmittedOrder, whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span className="text-base">📱</span>
                  أرسل الفاتورة وتأكيد اللوكيشن عبر الواتساب للمطعم فوراً
                </a>

                <button
                  onClick={() => {
                    setIsOrderSuccessOpen(false);
                    setLastSubmittedOrder(null);
                  }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  العودة للرئيسية ومتابعة الطلب
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4" style={{ direction: 'rtl' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-white border border-stone-100 text-stone-900 rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              {/* Decorative top pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
                    {confirmModal.title}
                  </h3>
                  <p className="mt-2 text-stone-500 text-xs sm:text-sm leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {confirmModal.cancelText || 'إلغاء'}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-md hover:shadow-red-600/10 cursor-pointer"
                >
                  {confirmModal.confirmText || 'نعم، متأكد'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[calc(100%-3rem)] bg-stone-950/95 backdrop-blur border border-stone-800 shadow-2xl rounded-2xl p-4 flex items-start gap-3 pointer-events-auto text-right"
            id="toast-notification"
            style={{ direction: 'rtl' }}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' :
              toast.type === 'error' ? 'bg-rose-950/50 text-rose-400 border border-rose-500/20' :
              'bg-amber-950/50 text-amber-400 border border-amber-500/20'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : toast.type === 'error' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
