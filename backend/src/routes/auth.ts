import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: role || 'EMPLOYEE'
            }
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error });
    }
});

export default router;
