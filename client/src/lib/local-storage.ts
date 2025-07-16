interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingOrders: number;
  syncInProgress: boolean;
}

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  private readonly keyPrefix = 'bakeryPOS_';
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingOrders: 0,
    syncInProgress: false
  };

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  constructor() {
    this.initializeNetworkListeners();
  }

  private initializeNetworkListeners() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });
  }

  save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      });
      localStorage.setItem(this.keyPrefix + key, serializedData);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.keyPrefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.keyPrefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.keyPrefix)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  saveCart(cart: any[]): void {
    this.save('cart', cart);
  }

  loadCart(): any[] {
    return this.load('cart') || [];
  }

  clearCart(): void {
    this.remove('cart');
  }

  saveOfflineOrder(order: any): void {
    const offlineOrders = this.loadOfflineOrders();
    offlineOrders.push({
      ...order,
      id: Date.now(),
      offline: true,
      createdAt: new Date().toISOString()
    });
    this.save('offlineOrders', offlineOrders);
  }

  loadOfflineOrders(): any[] {
    return this.load('offlineOrders') || [];
  }

  clearOfflineOrders(): void {
    this.remove('offlineOrders');
  }

  saveCustomerData(customers: any[]): void {
    this.save('customers', customers);
  }

  loadCustomerData(): any[] {
    return this.load('customers') || [];
  }

  saveProductData(products: any[]): void {
    this.save('products', products);
  }

  loadProductData(): any[] {
    return this.load('products') || [];
  }

  syncData(): void {
    // Simulate offline sync - in a real app this would sync with the server
    const syncTimestamp = Date.now();
    this.save('lastSync', syncTimestamp);
    console.log('Data synced to cloud at:', new Date(syncTimestamp));
  }

  getLastSyncTime(): Date | null {
    const timestamp = this.load<number>('lastSync');
    return timestamp ? new Date(timestamp) : null;
  }
}

export const localStorage = LocalStorageManager.getInstance();
