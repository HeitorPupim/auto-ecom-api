import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@admin.com';
  const password = 'admin123';
  const name = 'Admin User';

  // Delete old admin if exists (cleanup)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@admin', 'admin@admin.com']
      }
    }
  });
  console.log('🧹 Cleaned up old admin users');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  console.log(`✅ Admin user created: ${user.email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
