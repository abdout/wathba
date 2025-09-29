/**
 * Product API Testing Script
 * Run with: node scripts/test-products-api.js
 */

const API_BASE = 'http://localhost:3002/api';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

// Test functions
async function testGetAllProducts() {
  console.log(`\n${colors.cyan}=== Testing GET /api/products ===${colors.reset}`);

  const tests = [
    { endpoint: '/products', description: 'Get all products' },
    { endpoint: '/products?limit=5', description: 'Get 5 products' },
    { endpoint: '/products?category=electronics', description: 'Filter by category' },
    { endpoint: '/products?minPrice=10&maxPrice=50', description: 'Filter by price range' },
    { endpoint: '/products?sortBy=price&sortOrder=asc', description: 'Sort by price ascending' }
  ];

  for (const test of tests) {
    const result = await apiCall('GET', test.endpoint);

    if (result.data?.success) {
      const productCount = result.data.data?.products?.length || 0;
      console.log(`${colors.green}✓${colors.reset} ${test.description}: ${productCount} products found`);

      if (productCount > 0) {
        const firstProduct = result.data.data.products[0];
        console.log(`  Sample: ${firstProduct.name} - $${firstProduct.price}`);
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} ${test.description}: Failed`);
      console.log(`  Error: ${result.data?.error || 'Unknown error'}`);
    }
  }
}

async function testGetSingleProduct() {
  console.log(`\n${colors.cyan}=== Testing GET /api/products/[id] ===${colors.reset}`);

  // First get a product ID
  const result = await apiCall('GET', '/products?limit=1');

  if (result.data?.success && result.data.data?.products?.length > 0) {
    const productId = result.data.data.products[0].id;
    const productName = result.data.data.products[0].name;

    console.log(`Testing with product: ${productName} (${productId})`);

    const singleResult = await apiCall('GET', `/products/${productId}`);

    if (singleResult.data?.success) {
      const product = singleResult.data.data;
      console.log(`${colors.green}✓${colors.reset} Successfully fetched product details`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Price: $${product.price} (MRP: $${product.mrp})`);
      console.log(`  Category: ${product.category}`);
      console.log(`  In Stock: ${product.inStock}`);
      console.log(`  Store: ${product.store?.name || 'N/A'}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Failed to fetch product details`);
    }
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} No products available for testing`);
  }
}

async function testSearchProducts() {
  console.log(`\n${colors.cyan}=== Testing Product Search ===${colors.reset}`);

  const searchTerms = ['Tide', 'Organic', 'Fresh', 'Premium'];

  for (const term of searchTerms) {
    const result = await apiCall('GET', `/products/search?q=${encodeURIComponent(term)}`);

    if (result.data?.success) {
      const count = result.data.data?.products?.length || 0;
      console.log(`${colors.green}✓${colors.reset} Search "${term}": ${count} results`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Search "${term}": Failed`);
    }
  }
}

async function testCategories() {
  console.log(`\n${colors.cyan}=== Testing GET /api/products/categories ===${colors.reset}`);

  const result = await apiCall('GET', '/products/categories');

  if (result.data?.success) {
    const categories = result.data.data || [];
    console.log(`${colors.green}✓${colors.reset} Found ${categories.length} categories`);
    console.log(`  Categories: ${categories.join(', ')}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} Failed to fetch categories`);
  }
}

async function testFeaturedProducts() {
  console.log(`\n${colors.cyan}=== Testing GET /api/products/featured ===${colors.reset}`);

  const result = await apiCall('GET', '/products/featured?limit=8');

  if (result.data?.success) {
    const products = result.data.data || [];
    console.log(`${colors.green}✓${colors.reset} Found ${products.length} featured products`);

    if (products.length > 0) {
      console.log('  Top 3 featured:');
      products.slice(0, 3).forEach((p, i) => {
        console.log(`    ${i + 1}. ${p.name} - $${p.price}`);
      });
    }
  } else {
    console.log(`${colors.red}✗${colors.reset} Failed to fetch featured products`);
  }
}

async function testPagination() {
  console.log(`\n${colors.cyan}=== Testing Pagination ===${colors.reset}`);

  const pages = [1, 2, 3];
  const limit = 5;

  for (const page of pages) {
    const result = await apiCall('GET', `/products?page=${page}&limit=${limit}`);

    if (result.data?.success) {
      const pagination = result.data.data?.pagination;
      const products = result.data.data?.products || [];

      console.log(`${colors.green}✓${colors.reset} Page ${page}: ${products.length} products`);
      console.log(`  Total: ${pagination?.totalCount || 0} products`);
      console.log(`  Pages: ${pagination?.totalPages || 0}`);

      if (products.length > 0) {
        console.log(`  First item: ${products[0].name}`);
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Page ${page}: Failed`);
      break;
    }
  }
}

async function testDatabaseStats() {
  console.log(`\n${colors.cyan}=== Database Statistics ===${colors.reset}`);

  const result = await apiCall('GET', '/products?limit=100');

  if (result.data?.success) {
    const products = result.data.data?.products || [];
    const categories = [...new Set(products.map(p => p.category))];
    const stores = [...new Set(products.map(p => p.storeId))];
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    const inStock = products.filter(p => p.inStock).length;

    console.log(`${colors.blue}Database Summary:${colors.reset}`);
    console.log(`  Total Products: ${products.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Stores: ${stores.length}`);
    console.log(`  In Stock: ${inStock}/${products.length}`);
    console.log(`  Average Price: $${avgPrice.toFixed(2)}`);
    console.log(`  Price Range: $${Math.min(...products.map(p => p.price))} - $${Math.max(...products.map(p => p.price))}`);
  }
}

// Main execution
async function runAllTests() {
  console.log(`${colors.blue}${'='.repeat(50)}`);
  console.log('PRODUCT API TEST SUITE');
  console.log(`${'='.repeat(50)}${colors.reset}`);
  console.log(`Testing API at: ${API_BASE}`);
  console.log(`Time: ${new Date().toLocaleString()}`);

  try {
    await testGetAllProducts();
    await testGetSingleProduct();
    await testSearchProducts();
    await testCategories();
    await testFeaturedProducts();
    await testPagination();
    await testDatabaseStats();

    console.log(`\n${colors.green}${'='.repeat(50)}`);
    console.log('ALL TESTS COMPLETED');
    console.log(`${'='.repeat(50)}${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}Test suite failed: ${error.message}${colors.reset}`);
  }
}

// Run tests
runAllTests();