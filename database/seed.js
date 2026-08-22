const { PrismaClient } = require('../frontend/node_modules/.prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data for ALL tables...');
  
  // Clean up existing data for a fresh start
  await prisma.anomalyFlag.deleteMany({});
  await prisma.pulseResponse.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payrollHistory.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});

  const users = [
    { name: 'Alice Johnson', email: 'alice@dayflow.com', role: 'MANAGER', dept: 'Engineering', team: 'Frontend' },
    { name: 'Bob Smith', email: 'bob@dayflow.com', role: 'EMPLOYEE', dept: 'Engineering', team: 'Backend' },
    { name: 'Charlie Davis', email: 'charlie@dayflow.com', role: 'EMPLOYEE', dept: 'Design', team: 'UI/UX' },
    { name: 'Diana Prince', email: 'diana@dayflow.com', role: 'MANAGER', dept: 'HR', team: 'Talent' },
    { name: 'Ethan Hunt', email: 'ethan@dayflow.com', role: 'EMPLOYEE', dept: 'Operations', team: 'Logistics' },
  ];

  for (const [index, u] of users.entries()) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: 'dummy_hash',
        role: u.role,
        employee: {
          create: {
            employeeCode: `EMP00${index + 1}`,
            designation: u.role === 'MANAGER' ? 'Manager' : 'Software Engineer',
            department: u.dept,
            team: u.team,
            joinDate: new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(Math.random() * 5))),
            attendances: {
              create: [
                { date: new Date(), status: 'PRESENT', checkIn: new Date(), checkOut: new Date() },
                { date: new Date(Date.now() - 86400000), status: 'PRESENT', checkIn: new Date(Date.now() - 86400000) }
              ]
            },
            leaveRequests: {
              create: [
                { type: 'SICK', startDate: new Date(), endDate: new Date(Date.now() + 86400000), remarks: 'Feeling unwell', status: 'PENDING' }
              ]
            },
            payrolls: {
              create: [
                { 
                  month: '2026-08', basic: 50000, hra: 20000, allowances: 10000, pfDeduction: 5000, taxDeduction: 8000, gross: 80000, net: 67000, effectiveDate: new Date(),
                  history: {
                    create: [
                      { fieldChanged: 'basic', oldValue: 45000, newValue: 50000, changedBy: { connect: { email: 'alice@dayflow.com' } }, reason: 'Annual increment' }
                    ]
                  }
                }
              ]
            },
            pulseResponses: {
              create: [
                { date: new Date(), mood: 'GOOD' }
              ]
            },
            // Generate some anomalies for Bob and Ethan
            ...(u.name === 'Bob Smith' ? { anomalyFlags: { create: [{ type: 'LATE_ARRIVAL', expectedValue: '09:00', actualValue: '10:15', deviation: '75 mins', confidence: 0.95, resolvedBool: false }] } } : {}),
            ...(u.name === 'Ethan Hunt' ? { anomalyFlags: { create: [{ type: 'LOCATION_MISMATCH', expectedValue: 'Office HQ', actualValue: 'Unknown IP', deviation: 'IP Location', confidence: 0.88, resolvedBool: false }] } } : {}),
          }
        },
        notifications: {
          create: [
            { type: 'SYSTEM', message: 'Welcome to Dayflow!', readBool: false }
          ]
        },
        auditLogs: {
          create: [
            { action: 'LOGIN', targetType: 'AUTH', targetId: 'sys', reason: 'User logged in via UI' }
          ]
        }
      }
    });
    console.log(`Created user & related data: ${user.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
