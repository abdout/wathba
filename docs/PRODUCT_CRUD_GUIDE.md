# Product CRUD Operations Guide

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [CRUD Operations](#crud-operations)
5. [Testing Guide](#testing-guide)
6. [Code Examples](#code-examples)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Alwathba Coop e-commerce platform uses a PostgreSQL database with Prisma ORM for product management. Products are managed through RESTful APIs and can be operated by both vendors and admins.

### Tech Stack
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Prisma
- **API**: Next.js API Routes
- **State Management**: Redux Toolkit
- **Authentication**: Clerk

---

## Database Schema

### Product Model (from `prisma/schema.prisma`)

```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  mrp         Float       // Maximum Retail Price
  price       Float       // Selling Price
  images      String[]    // Array of image URLs
  category    String
  inStock     Boolean     @default(true)
  storeId     String
  store       Store       @relation(fields: [storeId], references: [id])
  orderItems  OrderItem[]
  rating      Rating[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([storeId])
  @@index([category])
}
```

---

## API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products with pagination |
| GET | `/api/products/[id]` | Get single product details |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/categories` | Get all categories |
| GET | `/api/products/featured` | Get featured products |

### Vendor Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendor/products` | List vendor's products |
| POST | `/api/vendor/products` | Create new product |
| GET | `/api/vendor/products/[id]` | Get vendor's product |
| PUT | `/api/vendor/products/[id]` | Update product |
| DELETE | `/api/vendor/products/[id]` | Delete product |

### Admin Endpoints (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | List all products (admin view) |
| PUT | `/api/admin/products/[id]` | Admin update any product |
| DELETE | `/api/admin/products/[id]` | Admin delete any product |

---

## CRUD Operations

### 1. CREATE - Add New Product

#### API Route: `/api/vendor/products` (POST)

```javascript
// Request Body
{
  "name": "Organic Honey",
  "description": "Pure natural honey from local farms",
  "mrp": 50.00,
  "price": 45.00,
  "category": "food",
  "images": [
    "https://ik.imagekit.io/osmanabdout/product/honey-1.jpg",
    "https://ik.imagekit.io/osmanabdout/product/honey-2.jpg"
  ],
  "inStock": true
}

// Response
{
  "success": true,
  "data": {
    "id": "cm123abc456",
    "name": "Organic Honey",
    "description": "Pure natural honey from local farms",
    "mrp": 50,
    "price": 45,
    "images": [...],
    "category": "food",
    "inStock": true,
    "storeId": "store_001",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. READ - Get Products

#### List All Products: `/api/products` (GET)

```javascript
// Query Parameters
?page=1&limit=12&category=electronics&minPrice=10&maxPrice=100&sortBy=price&sortOrder=asc

// Response
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalPages": 5,
      "totalCount": 60
    },
    "filters": {
      "categories": ["electronics", "food", "clothing", ...]
    }
  }
}
```

#### Get Single Product: `/api/products/[id]` (GET)

```javascript
// Response
{
  "success": true,
  "data": {
    "id": "cm123abc456",
    "name": "Product Name",
    "description": "Product description",
    "mrp": 50,
    "price": 45,
    "images": [...],
    "category": "electronics",
    "inStock": true,
    "store": {
      "id": "store_001",
      "name": "Store Name",
      "logo": "..."
    },
    "averageRating": 4.5,
    "totalRatings": 10,
    "reviews": [...]
  }
}
```

### 3. UPDATE - Modify Product

#### API Route: `/api/vendor/products/[id]` (PUT)

```javascript
// Request Body (partial update supported)
{
  "price": 40.00,
  "inStock": false,
  "description": "Updated description"
}

// Response
{
  "success": true,
  "data": {
    // Updated product object
  }
}
```

### 4. DELETE - Remove Product

#### API Route: `/api/vendor/products/[id]` (DELETE)

```javascript
// Response
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Testing Guide

### 1. Using cURL (Command Line)

#### Create Product
```bash
curl -X POST http://localhost:3002/api/vendor/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "mrp": 100,
    "price": 90,
    "category": "electronics",
    "images": ["image1.jpg"],
    "inStock": true
  }'
```

#### Get All Products
```bash
curl http://localhost:3002/api/products?page=1&limit=10
```

#### Get Single Product
```bash
curl http://localhost:3002/api/products/PRODUCT_ID
```

#### Update Product
```bash
curl -X PUT http://localhost:3002/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "price": 85,
    "inStock": true
  }'
```

#### Delete Product
```bash
curl -X DELETE http://localhost:3002/api/vendor/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### 2. Using Postman

1. **Import Collection**: Create a new collection named "Alwathba Products API"

2. **Set Environment Variables**:
   ```
   BASE_URL: http://localhost:3002
   AUTH_TOKEN: your_clerk_token_here
   ```

3. **Create Requests**:

   **GET Products**
   ```
   GET {{BASE_URL}}/api/products?page=1&limit=12
   ```

   **POST Create Product**
   ```
   POST {{BASE_URL}}/api/vendor/products
   Headers:
     Content-Type: application/json
     Authorization: Bearer {{AUTH_TOKEN}}
   Body (raw JSON):
     {
       "name": "New Product",
       "description": "Description",
       "mrp": 100,
       "price": 90,
       "category": "electronics",
       "images": ["url1", "url2"]
     }
   ```

### 3. Using the Test Page

Visit `http://localhost:3002/test-products` to use the built-in test page that shows:
- Direct API test results
- Redux state
- Product listing
- Debug information

### 4. Using Browser Console

```javascript
// Test GET request
fetch('/api/products?limit=5')
  .then(res => res.json())
  .then(data => console.log(data));

// Test POST request (requires authentication)
fetch('/api/vendor/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'Console Test Product',
    description: 'Created from console',
    mrp: 50,
    price: 45,
    category: 'test',
    images: ['test.jpg']
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 5. Database Testing with Prisma Studio

```bash
# Open Prisma Studio to view/edit database directly
npx prisma studio

# This opens a GUI at http://localhost:5555
# You can:
# - View all products
# - Create new products
# - Edit existing products
# - Delete products
# - View relationships
```

---

## Code Examples

### Frontend: Fetch Products with Redux

```javascript
// In your component
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

function ProductList() {
  const dispatch = useDispatch();
  const { list: products, loading, error } = useSelector(state => state.product);

  useEffect(() => {
    dispatch(fetchProducts({
      page: 1,
      limit: 12,
      category: 'electronics'
    }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Backend: Direct Database Operations

```javascript
// Using Prisma Client directly
import prisma from '@/lib/prisma';

// Create
const product = await prisma.product.create({
  data: {
    name: "New Product",
    price: 99.99,
    mrp: 120,
    category: "electronics",
    images: ["image.jpg"],
    storeId: "store_001"
  }
});

// Read
const products = await prisma.product.findMany({
  where: {
    category: "electronics",
    price: { gte: 50, lte: 100 }
  },
  include: {
    store: true,
    rating: true
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// Update
const updated = await prisma.product.update({
  where: { id: "product_id" },
  data: { price: 89.99, inStock: true }
});

// Delete
await prisma.product.delete({
  where: { id: "product_id" }
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Products Not Displaying
```bash
# Check if API is working
curl http://localhost:3002/api/products

# Check database connection
npx prisma db push

# Check if products exist in database
npx prisma studio
```

#### 2. Authentication Errors
```javascript
// Ensure Clerk is configured
// Check .env.local for:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 3. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database and seed
npx prisma db push --force-reset
npx prisma db seed
```

#### 4. Redux State Not Updating
```javascript
// Check Redux DevTools in browser
// Verify action is dispatched
// Check reducer logic in productSlice.js
```

### Debug Checklist

- [ ] Database is connected (check with `npx prisma studio`)
- [ ] API endpoints return data (test with cURL)
- [ ] Authentication tokens are valid
- [ ] Redux actions are dispatched
- [ ] Console shows no errors
- [ ] Network tab shows successful API calls

---

## Environment Variables

Required for product CRUD operations:

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ImageKit (for image uploads)
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/osmanabdout
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
```

---

## Best Practices

1. **Always validate input** before database operations
2. **Use transactions** for multiple related operations
3. **Implement proper error handling**
4. **Add pagination** for list endpoints
5. **Cache frequently accessed data**
6. **Optimize images** before storing URLs
7. **Use proper indexes** on frequently queried fields
8. **Implement soft deletes** for important data
9. **Add audit logs** for tracking changes
10. **Test edge cases** (empty data, invalid IDs, etc.)

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Database](https://neon.tech/docs)