import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { authService } from './services/authService';
import { Product, PromoEvent, CartItem, Order, CustomerNotification, CustomerUser, AdminUser, StoreOperationalSettings, WebsiteSettings } from './types';
import { checkOperationalHours } from './utils/operationalHours';

// Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { EventSection } from './components/EventSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutPage } from './components/CheckoutPage';
import { MidtransPaymentModal } from './components/MidtransPaymentModal';
import { CustomerCompletedOrderPopup } from './components/CustomerCompletedOrderPopup';
import { NotificationModal } from './components/NotificationModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SocialMediaSection } from './components/SocialMediaSection';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { DevTestingToolbar } from './components/DevTestingToolbar';

export function App() {
  // Store reactive state
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [events, setEvents] = useState<PromoEvent[]>(store.getEvents());
  const [customer, setCustomer] = useState<CustomerUser | null>(store.getCurrentCustomer());
  const [adminUser, setAdminUser] = useState<AdminUser>(store.getAdminUser());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(store.isAdminLoggedIn());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [operationalSettings, setOperationalSettings] = useState<StoreOperationalSettings>(
    store.getOperationalSettings()
  );
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(
    store.getWebsiteSettings()
  );

  // Sync HTML title with Brand & Tagline
  useEffect(() => {
    if (websiteSettings) {
      document.title = `${websiteSettings.brandName || 'COFIX'} - ${websiteSettings.heroTitle || 'Ngopi nikmat, dompet selamat'}`;
    }
  }, [websiteSettings]);

  // Navigation view
  const [currentView, setCurrentView] = useState<'home' | 'checkout' | 'admin'>('home');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Pending intent: guest attempted to add product to cart
  const [pendingAddProduct, setPendingAddProduct] = useState<Product | null>(null);

  // Cart version invalidation warnings (Rule 22)
  const [invalidCartItems, setInvalidCartItems] = useState<CartItem[]>([]);

  // Subscribed Cart & Notifications for current user
  const cartItems: CartItem[] = customer ? store.getCart(customer.id) : [];
  const notifications: CustomerNotification[] = customer ? store.getNotifications(customer.id) : [];
  const unreadNotificationsCount: number = customer ? store.getUnreadCount(customer.id) : 0;
  const activePopupNotification: CustomerNotification | null =
    customer ? store.getActivePopupNotification(customer.id) || null : null;

  // Subscribe to store updates
  useEffect(() => {
    const syncState = () => {
      setProducts([...store.getProducts()]);
      setEvents([...store.getEvents()]);
      const currentCust = store.getCurrentCustomer();
      setCustomer(currentCust ? { ...currentCust } : null);
      setAdminUser({ ...store.getAdminUser() });
      setIsAdminLoggedIn(store.isAdminLoggedIn());
      setOrders([...store.getOrders()]);
      setOperationalSettings({ ...store.getOperationalSettings() });
      setWebsiteSettings({ ...store.getWebsiteSettings() });

      // Check version invalidation if logged in (Rule 22)
      if (currentCust) {
        const validation = store.validateCartVersions(currentCust.id);
        if (!validation.isValid) {
          setInvalidCartItems(validation.invalidItems);
        } else {
          setInvalidCartItems([]);
        }
      }
    };

    const unsubscribe = store.subscribe(syncState);
    const handleSimTimeChange = () => syncState();
    window.addEventListener('cofix_time_change', handleSimTimeChange);

    syncState();

    return () => {
      unsubscribe();
      window.removeEventListener('cofix_time_change', handleSimTimeChange);
    };
  }, []);

  // Handle Cart Quantity modification
  const handleUpdateCartQty = (product: Product, newQty: number) => {
    // Check if store is open
    const { isOpen, reason } = checkOperationalHours(operationalSettings);
    if (!isOpen) {
      alert(reason || 'Kedai sedang tutup. Pemesanan tidak dapat dilakukan.');
      return;
    }

    // Scenario 1: Guest must login first
    if (!customer) {
      setPendingAddProduct(product);
      setIsAuthModalOpen(true);
      return;
    }

    const res = store.setCartQuantity(customer.id, product.id, newQty);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  // Direct "Tambah ke keranjang" from catalog card
  const handleAddToCartDirectly = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if store is open
    const { isOpen, reason } = checkOperationalHours(operationalSettings);
    if (!isOpen) {
      alert(reason || 'Kedai sedang tutup. Pemesanan tidak dapat dilakukan.');
      return;
    }

    if (!customer) {
      setPendingAddProduct(product);
      setIsAuthModalOpen(true);
      return;
    }

    const currentCart = store.getCart(customer.id);
    const existing = currentCart.find((i) => i.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const res = store.setCartQuantity(customer.id, product.id, currentQty + 1);

    if (!res.success && res.message) {
      alert(res.message);
    } else {
      setIsCartOpen(true);
    }
  };

  // Auth Success -> Auto-resume pending action (Scenario 1 & 2)
  const handleLoginSuccess = (user: CustomerUser) => {
    setCustomer(user);
    if (pendingAddProduct) {
      const prod = pendingAddProduct;
      setPendingAddProduct(null);
      const res = store.setCartQuantity(user.id, prod.id, 1);
      if (res.success) {
        setIsCartOpen(true);
      }
    }
  };

  // Customer Logout
  const handleLogoutCustomer = () => {
    authService.logoutCustomer();
    setCustomer(null);
    setCurrentView('home');
  };

  // Admin Logout
  const handleLogoutAdmin = () => {
    authService.logoutAdmin();
    setIsAdminLoggedIn(false);
    setCurrentView('home');
  };

  // Scroll to menu section from Hero
  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate cart total count
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Dismiss invalid items warning and purge stale cart items (Rule 22)
  const handlePurgeInvalidItems = () => {
    if (customer) {
      store.purgeInvalidCartItems(customer.id);
      setInvalidCartItems([]);
    }
  };

  // ================= RENDER ADMIN VIEW =================
  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard
        adminUser={adminUser}
        products={products}
        events={events}
        orders={orders}
        operationalSettings={operationalSettings}
        websiteSettings={websiteSettings}
        onLogout={handleLogoutAdmin}
        onExitToCustomerView={() => setCurrentView('home')}
      />
    );
  }

  // ================= RENDER CHECKOUT PAGE =================
  if (currentView === 'checkout' && customer) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between">
        <Header
          customer={customer}
          cartItemCount={cartItemCount}
          unreadNotificationsCount={unreadNotificationsCount}
          websiteSettings={websiteSettings}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogoutCustomer={handleLogoutCustomer}
          onLogoClick={() => setCurrentView('home')}
        />

        <CheckoutPage
          customer={customer}
          cartItems={cartItems}
          onBack={() => setCurrentView('home')}
          onProceedToPay={() => {
            // Check operational hours
            const opCheck = checkOperationalHours(operationalSettings);
            if (!opCheck.isOpen) {
              alert(opCheck.reason || 'Kedai sedang tutup. Pemesanan tidak dapat diproses.');
              setCurrentView('home');
              return;
            }

            // Rule 22: Validate versions before launching payment
            const validation = store.validateCartVersions(customer.id);
            if (!validation.isValid) {
              setInvalidCartItems(validation.invalidItems);
              alert(
                'Terdapat perubahan menu oleh admin pada pesanan Anda. Keranjang harus diperbarui terlebih dahulu.'
              );
              setCurrentView('home');
              setIsCartOpen(true);
              return;
            }
            setIsPaymentModalOpen(true);
          }}
        />

        {/* Midtrans Payment Gateway Modal */}
        <MidtransPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          cartItems={cartItems}
          customerName={customer.fullName}
          customerPhone={customer.phone}
          deliveryMethod="Ambil langsung di tempat"
          onPaymentSuccess={(details) => {
            setIsPaymentModalOpen(false);
            // Create paid order with snapshot
            store.createPaidOrder({
              userId: customer.id,
              customerName: customer.fullName,
              customerPhone: customer.phone,
              items: cartItems,
              deliveryMethod: 'Ambil langsung di tempat',
              paymentMethod: details.paymentMethod,
            });

            // Redirect to home and open notification/orders modal
            setCurrentView('home');
            setIsNotificationModalOpen(true);
          }}
        />

        <Footer
          websiteSettings={websiteSettings}
          onOpenAdmin={() => (isAdminLoggedIn ? setCurrentView('admin') : setIsAdminLoginOpen(true))}
        />
      </div>
    );
  }

  // ================= RENDER MAIN STOREFRONT =================
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between selection:bg-[#6F4E37] selection:text-white">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Offline Connectivity Notification */}
      <OfflineBanner />

      {/* 1. Header (Rule 12) */}
      <Header
        customer={customer}
        cartItemCount={cartItemCount}
        unreadNotificationsCount={unreadNotificationsCount}
        websiteSettings={websiteSettings}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogoutCustomer={handleLogoutCustomer}
        onLogoClick={() => setCurrentView('home')}
      />

      <main className="flex-1">
        {/* 2. Hero Section (Rule 13) */}
        <Hero
          websiteSettings={websiteSettings}
          onScrollToMenu={handleScrollToMenu}
        />

        {/* 3. Event / Promosi Section (Rule 14: Hidden if 0 events, carousel if >1) */}
        <EventSection events={events} />

        {/* 4. Product Catalog (Rule 16, 17, 19, No truncated names, Dynamic hours) */}
        <ProductCatalog
          products={products}
          operationalSettings={operationalSettings}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onAddToCartDirectly={handleAddToCartDirectly}
        />

        {/* 5. Social Media & Google Maps Section (Rule 44) */}
        <SocialMediaSection websiteSettings={websiteSettings} />
      </main>

      {/* 6. Footer (Rule 45) */}
      <Footer
        websiteSettings={websiteSettings}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setCurrentView('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* ================= MODALS & POPUPS ================= */}

      {/* Product Detail Modal (Rule 18) */}
      <ProductDetailModal
        product={selectedProduct}
        currentCartQty={
          selectedProduct && customer
            ? cartItems.find((i) => i.productId === selectedProduct.id)?.quantity || 0
            : 0
        }
        operationalSettings={operationalSettings}
        onClose={() => setSelectedProduct(null)}
        onUpdateCartQty={(prod, qty) => {
          handleUpdateCartQty(prod, qty);
          setSelectedProduct(store.getProductById(prod.id) || null);
        }}
      />

      {/* Cart Modal (Rule 20) */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        operationalSettings={operationalSettings}
        onUpdateQty={(productId, newQty) => {
          if (customer) {
            store.setCartQuantity(customer.id, productId, newQty);
          }
        }}
        onRemoveItem={(productId) => {
          if (customer) {
            store.removeCartItem(customer.id, productId);
          }
        }}
        onClearCart={() => {
          if (customer) {
            store.clearCart(customer.id);
          }
        }}
        onGoToCheckout={() => {
          const opCheck = checkOperationalHours(operationalSettings);
          if (!opCheck.isOpen) {
            alert(opCheck.reason || 'Kedai sedang tutup. Pemesanan tidak dapat dilakukan.');
            return;
          }
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
        invalidItemsWarning={invalidCartItems}
        onDismissInvalidItems={handlePurgeInvalidItems}
      />

      {/* Customer Notification Popup upon Order Completion (Rule 34) */}
      <CustomerCompletedOrderPopup
        notification={activePopupNotification}
        onClose={() => {
          if (activePopupNotification) {
            store.closeNotificationPopup(activePopupNotification.id);
          }
        }}
      />

      {/* Notification & Order History Modal (Rule 33 & 35) */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        orders={customer ? store.getCustomerOrders(customer.id) : []}
        onMarkAllRead={() => {
          if (customer) {
            store.markAllNotificationsRead(customer.id);
          }
        }}
      />

      {/* Customer Auth Modal (Rule 8 & 9) */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAddProduct(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        pendingProductName={pendingAddProduct?.name}
      />

      {/* Customer Profile Modal (Rule 10 & 43) */}
      {customer && (
        <CustomerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          customer={customer}
          orders={store.getCustomerOrders(customer.id)}
          onLogout={handleLogoutCustomer}
        />
      )}

      {/* Admin Login Modal (Rule 42) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        }}
      />

      {/* Dev Skenario Testing Toolbar (WIB time simulator & scenario tester) */}
      <DevTestingToolbar />
    </div>
  );
}

export default App;
