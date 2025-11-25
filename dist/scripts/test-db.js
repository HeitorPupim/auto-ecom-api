"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
async function main() {
    try {
        console.log('Attempting to connect to the database...');
        // Simple query to verify connection
        const result = await prisma_1.default.$queryRaw `SELECT 1 as result`;
        console.log('✅ Successfully connected to the database!');
        console.log('Query result:', result);
    }
    catch (error) {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
