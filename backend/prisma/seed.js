const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in reverse order of foreign keys
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing records.');

  // Pre-hash default passwords
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create System Administrator
  // Name length: 27 characters (satisfies 20-60 chars requirement)
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Master',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '100 Headquarters Boulevard, Suite 500, Tech City',
      role: 'ADMIN'
    }
  });
  console.log(`✅ Created Admin: ${admin.name} (${admin.email})`);

  // 2. Create 3 Store Owners and their Stores
  // Store Owner 1: 25 chars; Store 1: 29 chars
  const owner1 = await prisma.user.create({
    data: {
      name: 'Arthur Pendelton Kingsman',
      email: 'arthur.kingsman@stores.com',
      password: ownerPassword,
      address: '12 King George Way, Downtown District, Metropolis',
      role: 'STORE_OWNER'
    }
  });

  const store1 = await prisma.store.create({
    data: {
      name: 'The Grand Artisan Bakery Shop',
      email: 'contact@grandartisan.com',
      address: '102 High Street, Downtown District, Metropolis',
      ownerId: owner1.id
    }
  });
  console.log(`✅ Created Store 1: ${store1.name} (Owner: ${owner1.name})`);

  // Store Owner 2: 27 chars; Store 2: 30 chars
  const owner2 = await prisma.user.create({
    data: {
      name: 'Eleanor Beatrice Vancefield',
      email: 'eleanor.vance@stores.com',
      password: ownerPassword,
      address: '45 Meadow Lane, Green Valley Boulevard, Westside',
      role: 'STORE_OWNER'
    }
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Vancefield Organic Supermarket',
      email: 'support@vancefieldorganic.com',
      address: '404 Green Valley Boulevard, Westside District',
      ownerId: owner2.id
    }
  });
  console.log(`✅ Created Store 2: ${store2.name} (Owner: ${owner2.name})`);

  // Store Owner 3: 29 chars; Store 3: 29 chars
  const owner3 = await prisma.user.create({
    data: {
      name: 'Franklin Douglas Sterlingwood',
      email: 'franklin.sterling@stores.com',
      password: ownerPassword,
      address: '88 Silicon Crest, North Park, Cyber City',
      role: 'STORE_OWNER'
    }
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Sterlingwood Tech Electronics',
      email: 'sales@sterlingwoodtech.com',
      address: '789 Silicon Avenue, Cyber City Innovation Hub',
      ownerId: owner3.id
    }
  });
  console.log(`✅ Created Store 3: ${store3.name} (Owner: ${owner3.name})`);

  // 3. Create 4 Normal Users
  // User 1: 28 chars
  const user1 = await prisma.user.create({
    data: {
      name: 'Alexander Montgomery Bennett',
      email: 'alexander.bennett@user.com',
      password: userPassword,
      address: '123 Elm Street, Maplewood District, Metropolis',
      role: 'USER'
    }
  });

  // User 2: 28 chars
  const user2 = await prisma.user.create({
    data: {
      name: 'Charlotte Elizabeth Harrison',
      email: 'charlotte.harrison@user.com',
      password: userPassword,
      address: '456 Oak Avenue, Riverdale Heights, Metropolis',
      role: 'USER'
    }
  });

  // User 3: 28 chars
  const user3 = await prisma.user.create({
    data: {
      name: 'Benjamin Theodore Richardson',
      email: 'benjamin.richardson@user.com',
      password: userPassword,
      address: '789 Pine Road, Sunnyvale Ridge, Westside',
      role: 'USER'
    }
  });

  // User 4: 28 chars
  const user4 = await prisma.user.create({
    data: {
      name: 'Genevieve Katherine Campbell',
      email: 'genevieve.campbell@user.com',
      password: userPassword,
      address: '321 Cedar Lane, Lakeside Point, Cyber City',
      role: 'USER'
    }
  });
  console.log(`✅ Created 4 Normal Users.`);

  // 4. Create Sample Ratings
  // Store 1 ratings: user1 (5), user2 (4), user4 (5) -> Avg: 4.7
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user4.id, storeId: store1.id, rating: 5 }
    ]
  });

  // Store 2 ratings: user1 (4), user3 (3), user4 (5) -> Avg: 4.0
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user3.id, storeId: store2.id, rating: 3 },
      { userId: user4.id, storeId: store2.id, rating: 5 }
    ]
  });

  // Store 3 ratings: user2 (5), user3 (4), user4 (3) -> Avg: 4.0
  await prisma.rating.createMany({
    data: [
      { userId: user2.id, storeId: store3.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 4 },
      { userId: user4.id, storeId: store3.id, rating: 3 }
    ]
  });

  console.log('⭐ Seeded 9 initial ratings across stores.');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
