// seed.js
import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Read the plain text password from the secure .env file
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL;
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD;

  // Hash it
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Insert into DB
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin Kominfo',
      role: 'ADMIN',
      password: hashedPassword, 
    },
  })
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })