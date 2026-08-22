import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './db';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Auto-Healing / Resilient Wrapper ---
// This wrapper ensures all DB operations catch errors and standardize the API response
// so the frontend can properly "auto-heal" or retry.
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('[API Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Database operation failed',
      retrySuggested: true,
    });
  });
};

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dayflow-backend' });
});

// Get Command Center Dashboard Data
app.get('/api/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const [
    totalEmployees,
    pendingLeaves,
    anomalies,
    unresolvedAnomalies,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { employee: { include: { user: true } } },
    }),
    prisma.anomalyFlag.findMany({
      where: { resolvedBool: false },
      include: { employee: { include: { user: true } } },
    }),
    prisma.anomalyFlag.count({ where: { resolvedBool: false } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const workingToday = await prisma.attendance.count({
    where: {
      date: { gte: today },
      status: "PRESENT",
    },
  });

  const payrollChanges = await prisma.payrollHistory.findMany({
    orderBy: { changedAt: "desc" },
    take: 5,
    include: {
      payroll: { include: { employee: { include: { user: true } } } },
    },
  });

  res.json({
    success: true,
    data: {
      totalEmployees,
      workingToday,
      pendingLeaves,
      anomalies,
      unresolvedAnomalies,
      payrollChanges
    }
  });
}));

// Add more endpoints as needed...

app.listen(PORT, () => {
  console.log(`🚀 Backend API running at http://localhost:${PORT}`);
});
