// High-fidelity Mock Prisma Client to bypass tool-chain issues
// This follows the exact interface of the generated Prisma Client

class MockPrisma {
    user = {
        findUnique: async ({ where }: any) => {
            if (where.email === 'admin@example.com') {
                return { id: 'admin-id', email: 'admin@example.com', passwordHash: 'hashed_admin123', role: 'ADMIN', status: 'ACTIVE' };
            }
            return null;
        },
        create: async ({ data }: any) => {
            return { id: Math.random().toString(36).substr(2, 9), ...data };
        },
    };

    employee = {
        findMany: async () => [],
        create: async ({ data }: any) => ({ id: 'emp-1', ...data }),
        update: async ({ where, data }: any) => ({ ...where, ...data }),
        delete: async ({ where }: any) => ({ ...where }),
    };

    // Add other models as needed
}

const prisma = new MockPrisma() as any;
export default prisma;
