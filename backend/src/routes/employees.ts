import express from 'express';
import prisma from '../utils/prisma';
import { authorize } from '../middleware/auth';

const router = express.Router();

// GET all employees (HR/ADMIN only)
router.get('/', authorize(['ADMIN', 'HR']), async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees', error });
    }
});

// CREATE employee
router.post('/', authorize(['ADMIN', 'HR']), async (req, res) => {
    try {
        const employee = await prisma.employee.create({ data: req.body });
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create employee', error });
    }
});

export default router;
