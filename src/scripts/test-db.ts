import prisma from '../lib/prisma';

async function main() {
  try {
    console.log('Attempting to connect to the database...');
    // Simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Successfully connected to the database!');
    console.log('Query result:', result);
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
