/**
 * PWA Service Worker Registration and Management
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[PWA] Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve();
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission();
  }

  return Promise.reject('Notification permission denied');
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PWA] Push notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[PWA] Already subscribed to push notifications');
      return subscription;
    }

    // Get VAPID public key from environment
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('[PWA] VAPID public key not configured');
      return;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[PWA] Subscribed to push notifications');
    return newSubscription;
  } catch (error) {
    console.error('[PWA] Failed to subscribe to push notifications:', error);
  }
}

export function requestInstallPrompt() {
  if (!('beforeinstallprompt' in window)) {
    console.warn('[PWA] Install prompt not available');
    return;
  }

  return new Promise((resolve) => {
    (window as any).addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      resolve(event);
    });
  });
}

export async function showInstallPrompt(deferredPrompt: any) {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] User response to install prompt: ${outcome}`);
}

export function isAppInstalled() {
  if ((navigator as any).standalone === true) {
    return true; // iOS
  }

  if ((window as any).matchMedia('(display-mode: standalone)').matches) {
    return true; // Android
  }

  return false;
}

export async function requestBackgroundSync() {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('[PWA] Background sync not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-habits');
    console.log('[PWA] Background sync registered');
  } catch (error) {
    console.error('[PWA] Failed to register background sync:', error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
