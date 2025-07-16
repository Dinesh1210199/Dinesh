import * as fs from 'fs';
import * as path from 'path';
import { 
  IStorage, 
  User, InsertUser,
  Category, InsertCategory,
  Product, InsertProduct,
  Customer, InsertCustomer,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Payment, InsertPayment,
  OrderWithItems,
  DashboardMetrics,
  PopularItem
} from './storage';

interface CSVRecord {
  [key: string]: string | number | boolean | null;
}

export class CSVStorage implements IStorage {
  private dataDir: string;
  private currentIds: Map<string, number>;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
    this.currentIds = new Map();
    this.initializeStorage();
  }

  private initializeStorage() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize CSV files with headers if they don't exist
    this.initializeCSVFile('users.csv', ['id', 'username', 'password', 'role']);
    this.initializeCSVFile('categories.csv', ['id', 'name', 'description']);
    this.initializeCSVFile('products.csv', [
      'id', 'name', 'sku', 'categoryId', 'category', 'counterPrice', 'wholesalePrice', 
      'customPrice', 'stock', 'unit', 'gstRate', 'imageUrl', 'barcode', 'status', 'createdAt'
    ]);
    this.initializeCSVFile('customers.csv', [
      'id', 'name', 'phone', 'email', 'address', 'gstNumber', 'priceType', 'createdAt'
    ]);
    this.initializeCSVFile('orders.csv', [
      'id', 'customerId', 'orderNumber', 'totalAmount', 'status', 'paymentStatus', 'createdAt'
    ]);
    this.initializeCSVFile('order_items.csv', [
      'id', 'orderId', 'productId', 'productName', 'quantity', 'unit', 'unitPrice', 'gstRate', 'total'
    ]);
    this.initializeCSVFile('payments.csv', [
      'id', 'orderId', 'method', 'amount', 'transactionId', 'status', 'createdAt'
    ]);

    // Load current IDs from existing data
    this.loadCurrentIds();
    
    // Initialize with default data if files are empty
    this.initializeDefaultData();
  }

  private initializeCSVFile(filename: string, headers: string[]) {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(filePath)) {
      const headerRow = headers.join(',') + '\n';
      fs.writeFileSync(filePath, headerRow, 'utf8');
    }
  }

  private loadCurrentIds() {
    const tables = ['users', 'categories', 'products', 'customers', 'orders', 'order_items', 'payments'];
    
    for (const table of tables) {
      const records = this.readCSV(`${table}.csv`);
      const maxId = records.length > 0 ? Math.max(...records.map(r => Number(r.id) || 0)) : 0;
      this.currentIds.set(table, maxId + 1);
    }
  }

  private initializeDefaultData() {
    // Check if users file has data beyond headers
    const users = this.readCSV('users.csv');
    if (users.length === 0) {
      // Add default users
      this.writeCSVRecord('users.csv', {
        id: this.getNextId('users'),
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      
      this.writeCSVRecord('users.csv', {
        id: this.getNextId('users'),
        username: 'cashier',
        password: 'cashier123',
        role: 'cashier'
      });

      // Add default categories
      const categories = ['Cakes', 'Pastries', 'Breads', 'Sweets', 'Beverages'];
      for (const categoryName of categories) {
        this.writeCSVRecord('categories.csv', {
          id: this.getNextId('categories'),
          name: categoryName,
          description: `Fresh ${categoryName.toLowerCase()}`
        });
      }

      // Add sample products
      this.addSampleProducts();
      
      // Add default customer
      this.writeCSVRecord('customers.csv', {
        id: this.getNextId('customers'),
        name: 'Walk-in Customer',
        phone: null,
        email: null,
        address: null,
        gstNumber: null,
        priceType: 'counter',
        createdAt: new Date().toISOString()
      });
    }
  }

  private addSampleProducts() {
    const sampleProducts = [
      { name: 'Chocolate Cake', category: 'Cakes', counterPrice: '450.00', wholesalePrice: '400.00', stock: 15 },
      { name: 'Vanilla Cupcake', category: 'Cakes', counterPrice: '35.00', wholesalePrice: '30.00', stock: 50 },
      { name: 'Croissant', category: 'Pastries', counterPrice: '45.00', wholesalePrice: '35.00', stock: 25 },
      { name: 'Danish Pastry', category: 'Pastries', counterPrice: '55.00', wholesalePrice: '45.00', stock: 20 },
      { name: 'White Bread', category: 'Breads', counterPrice: '25.00', wholesalePrice: '20.00', stock: 30 },
      { name: 'Whole Wheat Bread', category: 'Breads', counterPrice: '35.00', wholesalePrice: '30.00', stock: 25 },
      { name: 'Gulab Jamun', category: 'Sweets', counterPrice: '15.00', wholesalePrice: '12.00', stock: 100 },
      { name: 'Rasgulla', category: 'Sweets', counterPrice: '12.00', wholesalePrice: '10.00', stock: 80 }
    ];

    for (const product of sampleProducts) {
      this.writeCSVRecord('products.csv', {
        id: this.getNextId('products'),
        name: product.name,
        sku: `SKU${String(this.currentIds.get('products')! - 1).padStart(3, '0')}`,
        categoryId: 1, // Will be updated based on category
        category: product.category,
        counterPrice: product.counterPrice,
        wholesalePrice: product.wholesalePrice,
        customPrice: null,
        stock: product.stock,
        unit: 'piece',
        gstRate: '18.00',
        imageUrl: null,
        barcode: null,
        status: product.stock <= 10 ? 'low_stock' : 'active',
        createdAt: new Date().toISOString()
      });
    }
  }

  private getNextId(table: string): number {
    const current = this.currentIds.get(table) || 1;
    this.currentIds.set(table, current + 1);
    return current;
  }

  private readCSV(filename: string): CSVRecord[] {
    try {
      const filePath = path.join(this.dataDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      
      if (lines.length <= 1) return [];
      
      const headers = lines[0].split(',');
      const records: CSVRecord[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const record: CSVRecord = {};
          for (let j = 0; j < headers.length; j++) {
            const value = values[j];
            record[headers[j]] = value === 'null' || value === '' ? null : 
                                 !isNaN(Number(value)) && value !== '' ? Number(value) : value;
          }
          records.push(record);
        }
      }
      
      return records;
    } catch (error) {
      console.error(`Error reading CSV file ${filename}:`, error);
      return [];
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private writeCSVRecord(filename: string, record: CSVRecord) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const values = Object.values(record).map(value => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      });
      
      const line = values.join(',') + '\n';
      fs.appendFileSync(filePath, line, 'utf8');
    } catch (error) {
      console.error(`Error writing to CSV file ${filename}:`, error);
    }
  }

  private updateCSVRecord(filename: string, id: number, updates: Partial<CSVRecord>) {
    try {
      const records = this.readCSV(filename);
      const index = records.findIndex(r => Number(r.id) === id);
      
      if (index === -1) return false;
      
      records[index] = { ...records[index], ...updates };
      this.rewriteCSVFile(filename, records);
      return true;
    } catch (error) {
      console.error(`Error updating CSV record in ${filename}:`, error);
      return false;
    }
  }

  private deleteCSVRecord(filename: string, id: number): boolean {
    try {
      const records = this.readCSV(filename);
      const filteredRecords = records.filter(r => Number(r.id) !== id);
      
      if (filteredRecords.length === records.length) return false;
      
      this.rewriteCSVFile(filename, filteredRecords);
      return true;
    } catch (error) {
      console.error(`Error deleting CSV record from ${filename}:`, error);
      return false;
    }
  }

  private rewriteCSVFile(filename: string, records: CSVRecord[]) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const headers = content.split('\n')[0];
      
      let newContent = headers + '\n';
      
      for (const record of records) {
        const values = Object.values(record).map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return String(value);
        });
        newContent += values.join(',') + '\n';
      }
      
      fs.writeFileSync(filePath, newContent, 'utf8');
    } catch (error) {
      console.error(`Error rewriting CSV file ${filename}:`, error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = this.readCSV('users.csv');
    const user = users.find(u => Number(u.id) === id);
    return user as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.readCSV('users.csv');
    const user = users.find(u => u.username === username);
    return user as User | undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = {
      id: this.getNextId('users'),
      ...userData
    };
    
    this.writeCSVRecord('users.csv', user);
    return user as User;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const categories = this.readCSV('categories.csv');
    return categories as Category[];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category = {
      id: this.getNextId('categories'),
      ...categoryData
    };
    
    this.writeCSVRecord('categories.csv', category);
    return category as Category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    const products = this.readCSV('products.csv');
    return products as Product[];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const products = this.readCSV('products.csv');
    const product = products.find(p => Number(p.id) === id);
    return product as Product | undefined;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product = {
      id: this.getNextId('products'),
      ...productData,
      sku: productData.sku || `SKU${String(this.currentIds.get('products')! - 1).padStart(3, '0')}`,
      status: (productData.stock || 0) <= 10 ? 'low_stock' : 'active',
      createdAt: new Date().toISOString()
    };
    
    this.writeCSVRecord('products.csv', product);
    return product as Product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const success = this.updateCSVRecord('products.csv', id, updates);
    if (success) {
      return this.getProduct(id);
    }
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.deleteCSVRecord('products.csv', id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = this.readCSV('products.csv');
    return products.filter(p => p.category === category) as Product[];
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = this.readCSV('products.csv');
    const searchTerm = query.toLowerCase();
    return products.filter(p => 
      String(p.name).toLowerCase().includes(searchTerm) ||
      String(p.sku).toLowerCase().includes(searchTerm) ||
      String(p.category).toLowerCase().includes(searchTerm)
    ) as Product[];
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (product) {
      const newStock = Math.max(0, (Number(product.stock) || 0) + quantity);
      const status = newStock <= 10 ? 'low_stock' : 'active';
      return this.updateProduct(id, { stock: newStock, status });
    }
    return undefined;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    const customers = this.readCSV('customers.csv');
    return customers as Customer[];
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const customers = this.readCSV('customers.csv');
    const customer = customers.find(c => Number(c.id) === id);
    return customer as Customer | undefined;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const customer = {
      id: this.getNextId('customers'),
      ...customerData,
      createdAt: new Date().toISOString()
    };
    
    this.writeCSVRecord('customers.csv', customer);
    return customer as Customer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const success = this.updateCSVRecord('customers.csv', id, updates);
    if (success) {
      return this.getCustomer(id);
    }
    return undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.deleteCSVRecord('customers.csv', id);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const customers = this.readCSV('customers.csv');
    const searchTerm = query.toLowerCase();
    return customers.filter(c => 
      String(c.name).toLowerCase().includes(searchTerm) ||
      String(c.phone).toLowerCase().includes(searchTerm) ||
      String(c.email).toLowerCase().includes(searchTerm)
    ) as Customer[];
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    const orders = this.readCSV('orders.csv');
    return orders as Order[];
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const orders = this.readCSV('orders.csv');
    const order = orders.find(o => Number(o.id) === id);
    
    if (!order) return undefined;
    
    const items = await this.getOrderItems(id);
    const payments = await this.getPayments(id);
    
    return { ...order, items, payments } as OrderWithItems;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const order = {
      id: this.getNextId('orders'),
      ...orderData,
      orderNumber: `ORD${String(this.currentIds.get('orders')! - 1).padStart(6, '0')}`,
      createdAt: new Date().toISOString()
    };
    
    this.writeCSVRecord('orders.csv', order);
    return order as Order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const success = this.updateCSVRecord('orders.csv', id, { status });
    if (success) {
      const orders = this.readCSV('orders.csv');
      const order = orders.find(o => Number(o.id) === id);
      return order as Order | undefined;
    }
    return undefined;
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const orders = this.readCSV('orders.csv');
    return orders.filter(o => {
      const orderDate = new Date(String(o.createdAt));
      return orderDate >= startDate && orderDate <= endDate;
    }) as Order[];
  }

  async getTodaysOrders(): Promise<Order[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getOrdersByDateRange(today, tomorrow);
  }

  // Order Items methods
  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const orderItem = {
      id: this.getNextId('order_items'),
      ...orderItemData
    };
    
    this.writeCSVRecord('order_items.csv', orderItem);
    return orderItem as OrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const orderItems = this.readCSV('order_items.csv');
    return orderItems.filter(item => Number(item.orderId) === orderId) as OrderItem[];
  }

  // Payment methods
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payment = {
      id: this.getNextId('payments'),
      ...paymentData,
      status: paymentData.status || 'completed',
      createdAt: new Date().toISOString()
    };
    
    this.writeCSVRecord('payments.csv', payment);
    return payment as Payment;
  }

  async getPayments(orderId: number): Promise<Payment[]> {
    const payments = this.readCSV('payments.csv');
    return payments.filter(p => Number(p.orderId) === orderId) as Payment[];
  }

  // Analytics methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const todayOrders = await this.getTodaysOrders();
    const products = await this.getProducts();
    
    const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const averageOrder = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;
    const lowStockItems = products.filter(p => (p.stock || 0) <= 10).length;

    return {
      todaySales: `₹${todaySales.toFixed(2)}`,
      ordersToday: todayOrders.length,
      averageOrder: `₹${averageOrder.toFixed(2)}`,
      lowStockItems
    };
  }

  async getPopularItems(): Promise<PopularItem[]> {
    const orderItems = this.readCSV('order_items.csv');
    const products = await this.getProducts();
    
    const itemStats = new Map<number, { sold: number, revenue: number, product: Product }>();
    
    for (const item of orderItems) {
      const productId = Number(item.productId);
      const product = products.find(p => Number(p.id) === productId);
      
      if (product) {
        const existing = itemStats.get(productId) || { sold: 0, revenue: 0, product };
        existing.sold += Number(item.quantity || 0);
        existing.revenue += Number(item.total || 0);
        itemStats.set(productId, existing);
      }
    }
    
    return Array.from(itemStats.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)
      .map(stat => ({
        id: stat.product.id,
        name: stat.product.name,
        category: stat.product.category,
        sold: stat.sold,
        revenue: `₹${stat.revenue.toFixed(2)}`,
        imageUrl: stat.product.imageUrl
      }));
  }

  async getRecentOrders(limit: number = 10): Promise<OrderWithItems[]> {
    const orders = this.readCSV('orders.csv');
    const sortedOrders = orders
      .sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())
      .slice(0, limit);
    
    const ordersWithItems = [];
    for (const order of sortedOrders) {
      const items = await this.getOrderItems(Number(order.id));
      const payments = await this.getPayments(Number(order.id));
      ordersWithItems.push({ ...order, items, payments } as OrderWithItems);
    }
    
    return ordersWithItems;
  }
}