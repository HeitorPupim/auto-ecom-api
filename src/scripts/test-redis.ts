import redisConnection from '../lib/redis';

async function testRedisConnection() {
  console.log('🔌 Testing Redis connection...');

  try {
    // Test connection 
    await redisConnection.ping();
    console.log('✅ Redis PING successful');

    // Test set/get
    await redisConnection.set('test_key', 'hello_from_autoecom');
    const value = await redisConnection.get('test_key');
    console.log(`✅ Redis SET/GET successful: ${value}`);

    // Clean up
    await redisConnection.del('test_key');
    console.log('✅ Redis connection test passed!');

    // Close connection
    await redisConnection.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    process.exit(1);
  }
}

testRedisConnection();
