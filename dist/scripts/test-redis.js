"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../lib/redis"));
async function testRedisConnection() {
    console.log('🔌 Testing Redis connection...');
    try {
        // Test connection 
        await redis_1.default.ping();
        console.log('✅ Redis PING successful');
        // Test set/get
        await redis_1.default.set('test_key', 'hello_from_autoecom');
        const value = await redis_1.default.get('test_key');
        console.log(`✅ Redis SET/GET successful: ${value}`);
        // Clean up
        await redis_1.default.del('test_key');
        console.log('✅ Redis connection test passed!');
        // Close connection
        await redis_1.default.quit();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Redis connection test failed:', error);
        process.exit(1);
    }
}
testRedisConnection();
