# Secure Cloud POS System

## Overview

This is a modern, cloud-based Point of Sale (POS) system designed for bakeries and retail businesses. The application provides comprehensive billing, inventory management, customer management, and payment processing capabilities with offline functionality for business continuity during power outages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state and local React state
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **API Design**: RESTful API endpoints with consistent error handling
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Validation**: Zod for runtime type validation and schema enforcement

### Database Strategy
- **Current Storage**: CSV-based file storage for data persistence
- **Storage Options**: Configurable storage backend (Memory, CSV, PostgreSQL)
- **CSV Implementation**: Structured CSV files with automatic file management
- **Future Migration**: Ready for PostgreSQL transition via storage factory pattern
- **Offline Storage**: Browser localStorage with automatic sync when online

## Key Components

### Core Modules
1. **POS Terminal**: Real-time product catalog, cart management, barcode scanning simulation
2. **Product Management**: CRUD operations, inventory tracking, multi-tier pricing
3. **Customer Management**: Customer profiles, GST number handling, transaction history
4. **Payment Processing**: Split payment support, multiple payment methods, cloud gateway integration
5. **Dashboard**: Sales metrics, popular items tracking, quick actions
6. **Offline Mode**: Local storage persistence with automatic cloud synchronization

### Pricing System
- **Counter Sale Rate**: Standard retail pricing
- **Wholesale Rate**: Bulk purchase pricing
- **Custom Rate**: Manually entered pricing for special customers
- **GST Management**: Product-specific GST rates with multi-GST number support

### Authentication & Authorization
- User roles: Cashier, Manager, Admin
- Session-based authentication with role-based access control

## Data Flow

### Order Processing Flow
1. Products added to cart via barcode scan or manual selection
2. Price calculated based on selected pricing tier (counter/wholesale/custom)
3. GST automatically calculated per product
4. Customer selection (optional) for billing
5. Payment processing with split payment support
6. Order completion with automatic inventory updates
7. Receipt generation and transaction logging

### Offline Synchronization Flow
1. All transactions stored locally during offline periods
2. Automatic detection of network connectivity
3. Background sync of pending transactions when online
4. Conflict resolution for inventory updates
5. Status indicators for sync state

### Data Storage Strategy
- **Primary Storage**: CSV files in `/data` directory with structured format
- **Storage Factory**: Configurable backend system supporting Memory, CSV, and future PostgreSQL
- **Cache Layer**: React Query for client-side caching
- **Offline Buffer**: Browser localStorage for offline operations
- **Sync Queue**: Queued operations for background synchronization

### CSV Storage Features
- **File-based Persistence**: All data stored in structured CSV files (users.csv, products.csv, orders.csv, etc.)
- **Automatic File Management**: Files created automatically with proper headers
- **CRUD Operations**: Full Create, Read, Update, Delete support with transactional integrity
- **Data Relationships**: Foreign key relationships maintained across CSV files
- **Search & Analytics**: Product search, customer filtering, and dashboard metrics
- **Migration Ready**: Identical interface to PostgreSQL implementation for seamless transition

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **drizzle-kit**: Database schema management
- **esbuild**: Server-side bundling

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **Development**: Local development with hot reload via Vite
- **Production**: Compiled assets served by Express with static file serving
- **Database**: Environment variable `DATABASE_URL` for PostgreSQL connection

### Offline Capability
- Service Worker implementation for caching (to be added)
- Local storage fallback for critical POS operations
- Automatic retry mechanism for failed network requests
- Background sync when connectivity restored

### Scalability Considerations
- Stateless server design for horizontal scaling
- Database connection pooling via serverless PostgreSQL
- Client-side caching reduces server load
- Modular component architecture for feature expansion

The system prioritizes reliability and user experience, ensuring that sales operations can continue even during network outages while maintaining data consistency through automatic synchronization.