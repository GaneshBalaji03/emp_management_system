import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed default Admin if not exists
const seedAdmin = async () => {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash('Admin@123', 10);

        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });
        console.log('Default Admin created: admin@example.com / Admin@123');
    }
};

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedAdmin().catch(console.error);
});

export default app;
