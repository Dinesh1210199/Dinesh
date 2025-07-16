import { 
  users, products, customers, orders, orderItems, payments, categories,
  type User, type InsertUser, type Product, type InsertProduct,
  type Customer, type InsertCustomer, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Payment, type InsertPayment,
  type Category, type InsertCategory, type OrderWithItems, type DashboardMetrics,
  type PopularItem
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
  getTodaysOrders(): Promise<Order[]>;

  // Order Items
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(orderId: number): Promise<Payment[]>;

  // Analytics
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getPopularItems(): Promise<PopularItem[]>;
  getRecentOrders(limit?: number): Promise<OrderWithItems[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private payments: Map<number, Payment>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCustomerId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.payments = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCustomerId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentPaymentId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize default admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // In production, this should be hashed
      role: "admin"
    };
    this.users.set(adminUser.id, adminUser);

    // Initialize cashier user
    const cashierUser: User = {
      id: this.currentUserId++,
      username: "cashier",
      password: "cashier123", // In production, this should be hashed
      role: "cashier"
    };
    this.users.set(cashierUser.id, cashierUser);

    // Initialize categories
    const bakeryCategories = [
      { name: "Cakes", description: "All types of cakes" },
      { name: "Pastries", description: "Fresh pastries and croissants" },
      { name: "Breads", description: "Freshly baked breads" },
      { name: "Sweets", description: "Traditional and modern sweets" }
    ];

    bakeryCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        ...cat
      };
      this.categories.set(category.id, category);
    });

    // Initialize products
    const bakeryProducts = [
      { name: "Chocolate Cake", sku: "CC001", category: "Cakes", counterPrice: "120.00", wholesalePrice: "100.00", stock: 25, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", barcode: "1234567890123" },
      { name: "Vanilla Cake", sku: "VC001", category: "Cakes", counterPrice: "110.00", wholesalePrice: "90.00", stock: 20, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d", barcode: "1234567890124" },
      { name: "Red Velvet Cake", sku: "RVC001", category: "Cakes", counterPrice: "150.00", wholesalePrice: "130.00", stock: 15, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1621303837174-89787a7d4729", barcode: "1234567890125" },
      { name: "Butter Croissant", sku: "BC001", category: "Pastries", counterPrice: "50.00", wholesalePrice: "40.00", stock: 12, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff", barcode: "1234567890126" },
      { name: "Almond Croissant", sku: "AC001", category: "Pastries", counterPrice: "60.00", wholesalePrice: "50.00", stock: 10, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1555507036-ab794f1ec35d", barcode: "1234567890127" },
      { name: "Glazed Donuts", sku: "GD001", category: "Sweets", counterPrice: "40.00", wholesalePrice: "35.00", stock: 30, unit: "piece", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307", barcode: "1234567890128" },
      { name: "Whole Wheat Bread", sku: "WWB001", category: "Breads", counterPrice: "40.00", wholesalePrice: "32.00", stock: 8, unit: "loaf", gstRate: "5.00", imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73", barcode: "1234567890129" },
      { name: "White Bread", sku: "WB001", category: "Breads", counterPrice: "35.00", wholesalePrice: "28.00", stock: 15, unit: "loaf", gstRate: "5.00", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff", barcode: "1234567890130" },
      { name: "Gulab Jamun", sku: "GJ001", category: "Sweets", counterPrice: "80.00", wholesalePrice: "70.00", stock: 5, unit: "kg", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950", barcode: "1234567890131" },
      { name: "Rasgulla", sku: "RG001", category: "Sweets", counterPrice: "90.00", wholesalePrice: "80.00", stock: 3, unit: "kg", gstRate: "18.00", imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f681d32f", barcode: "1234567890132" }
    ];

    bakeryProducts.forEach(prod => {
      const product: Product = {
        id: this.currentProductId++,
        categoryId: 1,
        status: prod.stock <= 10 ? "low_stock" : "active",
        createdAt: new Date(),
        customPrice: null,
        ...prod
      };
      this.products.set(product.id, product);
    });

    // Initialize default customer
    const defaultCustomer: Customer = {
      id: this.currentCustomerId++,
      name: "Walk-in Customer",
      phone: null,
      email: null,
      address: null,
      gstNumber: null,
      customerType: "walk_in",
      balance: "0.00",
      createdAt: new Date()
    };
    this.customers.set(defaultCustomer.id, defaultCustomer);

    // Initialize some sample customers
    const sampleCustomers = [
      { name: "Sarah Johnson", phone: "9876543210", email: "sarah@email.com", customerType: "regular" },
      { name: "Mike Chen", phone: "9876543211", email: "mike@email.com", customerType: "wholesale" },
      { name: "Emily Davis", phone: "9876543212", email: "emily@email.com", customerType: "regular" }
    ];

    sampleCustomers.forEach(cust => {
      const customer: Customer = {
        id: this.currentCustomerId++,
        address: null,
        gstNumber: null,
        balance: "0.00",
        createdAt: new Date(),
        ...cust
      };
      this.customers.set(customer.id, customer);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "cashier"
    };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null
    };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      categoryId: insertProduct.categoryId || null,
      customPrice: insertProduct.customPrice || null,
      stock: insertProduct.stock || 0,
      imageUrl: insertProduct.imageUrl || null,
      barcode: insertProduct.barcode || null,
      gstRate: insertProduct.gstRate || "18.00",
      createdAt: new Date(),
      status: (insertProduct.stock || 0) <= 10 ? "low_stock" : "active"
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    if (typeof updates.stock === 'number') {
      updatedProduct.status = updates.stock <= 10 ? "low_stock" : "active";
    }
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const newStock = Math.max(0, product.stock - quantity);
    return this.updateProduct(id, { stock: newStock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      address: insertCustomer.address || null,
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null,
      gstNumber: insertCustomer.gstNumber || null,
      customerType: insertCustomer.customerType || "walk_in",
      balance: insertCustomer.balance || "0.00",
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(lowerQuery))
    );
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values()).filter(item => item.orderId === id);
    const payments = Array.from(this.payments.values()).filter(payment => payment.orderId === id);
    
    return { ...order, items, payments };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      customerId: insertOrder.customerId || null,
      status: insertOrder.status || "processing",
      paymentStatus: insertOrder.paymentStatus || "pending",
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => 
      order.createdAt && order.createdAt >= startDate && order.createdAt <= endDate
    );
  }

  async getTodaysOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getOrdersByDateRange(today, tomorrow);
  }

  // Order Items
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { 
      ...insertOrderItem, 
      id,
      orderId: insertOrderItem.orderId || null,
      productId: insertOrderItem.productId || null
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Payments
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      orderId: insertPayment.orderId || null,
      transactionId: insertPayment.transactionId || null,
      status: insertPayment.status || "completed",
      createdAt: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayments(orderId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.orderId === orderId);
  }

  // Analytics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const todaysOrders = await this.getTodaysOrders();
    const completedOrders = todaysOrders.filter(order => order.status === 'completed');
    
    const todaySales = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageOrder = completedOrders.length > 0 ? todaySales / completedOrders.length : 0;
    const lowStockItems = Array.from(this.products.values()).filter(p => p.stock <= 10).length;

    return {
      todaySales: `₹${todaySales.toFixed(2)}`,
      ordersToday: completedOrders.length,
      averageOrder: `₹${averageOrder.toFixed(2)}`,
      lowStockItems
    };
  }

  async getPopularItems(): Promise<PopularItem[]> {
    const todaysOrders = await this.getTodaysOrders();
    const itemStats = new Map<number, { sold: number, revenue: number, product: Product }>();

    for (const order of todaysOrders) {
      const items = await this.getOrderItems(order.id);
      for (const item of items) {
        const product = this.products.get(item.productId!);
        if (!product) continue;

        const current = itemStats.get(item.productId!) || { sold: 0, revenue: 0, product };
        current.sold += item.quantity;
        current.revenue += parseFloat(item.total);
        itemStats.set(item.productId!, current);
      }
    }

    return Array.from(itemStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.product.name,
        category: stats.product.category,
        sold: stats.sold,
        revenue: `₹${stats.revenue.toFixed(2)}`,
        imageUrl: stats.product.imageUrl || undefined
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);
  }

  async getRecentOrders(limit: number = 10): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      const payments = await this.getPayments(order.id);
      ordersWithItems.push({ ...order, items, payments });
    }

    return ordersWithItems;
  }
}

export const storage = new MemStorage();
