const { PrismaClient } = require('@prisma/client');

// Cliente para BD local
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://secondwallet:secondwallet_secret_2024@localhost:5434/secondwallet"
    }
  }
});

// Cliente para Supabase (usa las variables de entorno)
const supabasePrisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Iniciando migración de datos a Supabase...\n');

  try {
    // 1. Migrar Categories (sin dependencias)
    console.log('📁 Migrando categorías...');
    const categories = await localPrisma.category.findMany();
    for (const cat of categories) {
      await supabasePrisma.category.upsert({
        where: { id: cat.id },
        update: cat,
        create: cat
      });
    }
    console.log(`   ✅ ${categories.length} categorías migradas`);

    // 2. Migrar Users
    console.log('👤 Migrando usuarios...');
    const users = await localPrisma.user.findMany();
    for (const user of users) {
      await supabasePrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`   ✅ ${users.length} usuarios migrados`);

    // 3. Migrar Products (depende de User y Category)
    console.log('📦 Migrando productos...');
    const products = await localPrisma.product.findMany();
    for (const product of products) {
      await supabasePrisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`   ✅ ${products.length} productos migrados`);

    // 4. Migrar Listings (depende de Product, User, Category)
    console.log('🏷️  Migrando listings...');
    const listings = await localPrisma.listing.findMany();
    for (const listing of listings) {
      await supabasePrisma.listing.upsert({
        where: { id: listing.id },
        update: listing,
        create: listing
      });
    }
    console.log(`   ✅ ${listings.length} listings migrados`);

    // 5. Migrar Conversations
    console.log('💬 Migrando conversaciones...');
    const conversations = await localPrisma.conversation.findMany();
    for (const conv of conversations) {
      await supabasePrisma.conversation.upsert({
        where: { id: conv.id },
        update: conv,
        create: conv
      });
    }
    console.log(`   ✅ ${conversations.length} conversaciones migradas`);

    // 6. Migrar Messages
    console.log('✉️  Migrando mensajes...');
    const messages = await localPrisma.message.findMany();
    for (const msg of messages) {
      await supabasePrisma.message.upsert({
        where: { id: msg.id },
        update: msg,
        create: msg
      });
    }
    console.log(`   ✅ ${messages.length} mensajes migrados`);

    // 7. Migrar Orders
    console.log('🛒 Migrando órdenes...');
    const orders = await localPrisma.order.findMany();
    for (const order of orders) {
      await supabasePrisma.order.upsert({
        where: { id: order.id },
        update: order,
        create: order
      });
    }
    console.log(`   ✅ ${orders.length} órdenes migradas`);

    // 8. Migrar Disputes
    console.log('⚠️  Migrando disputas...');
    const disputes = await localPrisma.dispute.findMany();
    for (const dispute of disputes) {
      await supabasePrisma.dispute.upsert({
        where: { id: dispute.id },
        update: dispute,
        create: dispute
      });
    }
    console.log(`   ✅ ${disputes.length} disputas migradas`);

    // 9. Migrar Notifications
    console.log('🔔 Migrando notificaciones...');
    const notifications = await localPrisma.notification.findMany();
    for (const notif of notifications) {
      await supabasePrisma.notification.upsert({
        where: { id: notif.id },
        update: notif,
        create: notif
      });
    }
    console.log(`   ✅ ${notifications.length} notificaciones migradas`);

    // 10. Migrar Follows
    console.log('👥 Migrando follows...');
    const follows = await localPrisma.follow.findMany();
    for (const follow of follows) {
      await supabasePrisma.follow.upsert({
        where: { id: follow.id },
        update: follow,
        create: follow
      });
    }
    console.log(`   ✅ ${follows.length} follows migrados`);

    // 11. Migrar Alerts
    console.log('🚨 Migrando alertas...');
    const alerts = await localPrisma.alert.findMany();
    for (const alert of alerts) {
      await supabasePrisma.alert.upsert({
        where: { id: alert.id },
        update: alert,
        create: alert
      });
    }
    console.log(`   ✅ ${alerts.length} alertas migradas`);

    // 12. Migrar PriceHistory
    console.log('📊 Migrando historial de precios...');
    const priceHistory = await localPrisma.priceHistory.findMany();
    for (const ph of priceHistory) {
      await supabasePrisma.priceHistory.upsert({
        where: { id: ph.id },
        update: ph,
        create: ph
      });
    }
    console.log(`   ✅ ${priceHistory.length} registros de precios migrados`);

    // 13. Migrar IdentityVerifications
    console.log('🪪 Migrando verificaciones de identidad...');
    const identityVerifications = await localPrisma.identityVerification.findMany();
    for (const iv of identityVerifications) {
      await supabasePrisma.identityVerification.upsert({
        where: { id: iv.id },
        update: iv,
        create: iv
      });
    }
    console.log(`   ✅ ${identityVerifications.length} verificaciones migradas`);

    console.log('\n✅ ¡Migración completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

migrateData();
