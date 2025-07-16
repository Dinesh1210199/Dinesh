# Storage Configuration Guide

## Current Setup: CSV Storage

The system currently uses CSV-based storage for all data persistence. This provides:

- **File-based data storage** in the `/data` directory
- **Automatic backup** (CSV files can be easily copied/versioned)
- **Easy data inspection** (files are human-readable)
- **No external dependencies** (no database server required)

## Storage Types Available

### 1. CSV Storage (Current Default)
```bash
# Set environment variable (optional, CSV is default)
export STORAGE_TYPE=csv
npm run dev
```

**Data Files:**
- `data/users.csv` - User accounts and authentication
- `data/categories.csv` - Product categories
- `data/products.csv` - Product catalog with pricing and inventory
- `data/customers.csv` - Customer information and GST details
- `data/orders.csv` - Sales orders and transactions
- `data/order_items.csv` - Individual items within orders
- `data/payments.csv` - Payment records and methods

### 2. Memory Storage (Development/Testing)
```bash
export STORAGE_TYPE=memory
npm run dev
```
- All data stored in memory
- Data resets on server restart
- Fast performance for testing

### 3. PostgreSQL Storage (Future Implementation)
```bash
export STORAGE_TYPE=postgres
export DATABASE_URL=postgresql://username:password@host:port/database
npm run dev
```

## Migration Path to SQL Database

When ready to migrate to PostgreSQL:

1. **Environment Setup:**
   ```bash
   # Set storage type
   export STORAGE_TYPE=postgres
   
   # Set database connection
   export DATABASE_URL=your_postgresql_connection_string
   ```

2. **Data Migration:**
   - CSV data can be imported into PostgreSQL tables
   - The storage interface remains identical
   - No application code changes required

3. **Backup Strategy:**
   - CSV files serve as automatic backups
   - Easy to restore data if needed

## Data Backup and Restore

### Backup CSV Data
```bash
# Create backup of all data
cp -r data/ backup-$(date +%Y%m%d)/
```

### Restore CSV Data
```bash
# Restore from backup
cp -r backup-20250716/ data/
```

### Export to SQL Format
The CSV data can be easily converted to SQL INSERT statements for database migration.

## Development Recommendations

1. **Use CSV storage** for development and small-scale deployments
2. **Switch to PostgreSQL** when you need:
   - Concurrent access from multiple instances
   - Advanced querying capabilities
   - Transaction guarantees
   - Large-scale data handling

## File Structure

```
data/
├── users.csv          # Authentication data
├── categories.csv     # Product categories
├── products.csv       # Product catalog
├── customers.csv      # Customer database
├── orders.csv         # Sales transactions
├── order_items.csv    # Order line items
└── payments.csv       # Payment records
```

Each file maintains referential integrity through ID-based relationships, identical to relational database design.