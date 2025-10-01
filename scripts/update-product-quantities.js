// Script to update existing products with default quantities
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProductQuantities() {
  try {
    console.log('Updating product quantities...');

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        inStock: true,
        quantity: true
      }
    });

    console.log(`Found ${products.length} products`);

    // Update products that have quantity = 0 but are marked as inStock
    const productsToUpdate = products.filter(p => p.quantity === 0 && p.inStock);
    console.log(`${productsToUpdate.length} products need quantity updates`);

    for (const product of productsToUpdate) {
      // Generate random quantity between 10 and 100 for demo purposes
      const randomQuantity = Math.floor(Math.random() * 91) + 10;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          quantity: randomQuantity,
          lowStockThreshold: 5
        }
      });

      console.log(`Updated ${product.name}: quantity = ${randomQuantity}`);
    }

    // Update products that are out of stock to have quantity = 0
    const outOfStockProducts = products.filter(p => !p.inStock && p.quantity > 0);
    for (const product of outOfStockProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          quantity: 0
        }
      });
      console.log(`Set ${product.name} quantity to 0 (out of stock)`);
    }

    console.log('Product quantities updated successfully!');
  } catch (error) {
    console.error('Error updating product quantities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductQuantities();