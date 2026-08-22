import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: 'file:dev.db',
})
const prisma = new PrismaClient({ adapter })

// Helper to generate dates
const daysAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

const generateTime = (date: Date, hours: number, minutes: number) => {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

async function main() {
  console.log('Seeding database...')

  // Clear existing
  await prisma.anomalyFlag.deleteMany()
  await prisma.pulseResponse.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payrollHistory.deleteMany()
  await prisma.payroll.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@dayflow.com',
      passwordHash: '$2b$10$xyz', // Mocked hash for 'password'
      role: 'ADMIN',
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      name: 'Sarah Manager',
      email: 'manager@dayflow.com',
      passwordHash: '$2b$10$xyz',
      role: 'MANAGER',
    },
  })

  // Target employee for anomalies (Rahul)
  const rahulUser = await prisma.user.create({
    data: {
      name: 'Rahul K',
      email: 'rahul@dayflow.com',
      passwordHash: '$2b$10$xyz',
      role: 'EMPLOYEE',
    },
  })

  // Employee for leave overlap (Priya)
  const priyaUser = await prisma.user.create({
    data: {
      name: 'Priya M',
      email: 'priya@dayflow.com',
      passwordHash: '$2b$10$xyz',
      role: 'EMPLOYEE',
    },
  })

  // Target for payroll change (Arjun)
  const arjunUser = await prisma.user.create({
    data: {
      name: 'Arjun S',
      email: 'arjun@dayflow.com',
      passwordHash: '$2b$10$xyz',
      role: 'EMPLOYEE',
    },
  })
  
  // Normal employee (Aruneshwaran)
  const arunUser = await prisma.user.create({
    data: {
      name: 'Aruneshwaran K',
      email: 'arun@dayflow.com',
      passwordHash: '$2b$10$xyz',
      role: 'EMPLOYEE',
    },
  })
  
  const additionalUsers = []
  for (let i = 1; i <= 6; i++) {
    additionalUsers.push(
      await prisma.user.create({
        data: {
          name: `Employee ${i}`,
          email: `emp${i}@dayflow.com`,
          passwordHash: '$2b$10$xyz',
          role: 'EMPLOYEE',
        },
      })
    )
  }

  // 2. Create Employees
  const adminEmp = await prisma.employee.create({
    data: {
      userId: adminUser.id,
      employeeCode: 'EMP-0001',
      designation: 'HR Director',
      department: 'HR',
      team: 'Core HR',
      joinDate: new Date('2020-01-15'),
    },
  })

  const managerEmp = await prisma.employee.create({
    data: {
      userId: managerUser.id,
      employeeCode: 'EMP-1001',
      designation: 'Engineering Manager',
      department: 'Engineering',
      team: 'Frontend',
      joinDate: new Date('2021-03-10'),
    },
  })

  const rahulEmp = await prisma.employee.create({
    data: {
      userId: rahulUser.id,
      employeeCode: 'EMP-2031',
      designation: 'Designer',
      department: 'Design',
      team: 'Product Design',
      joinDate: new Date('2022-05-20'),
      managerId: managerEmp.id,
    },
  })

  const priyaEmp = await prisma.employee.create({
    data: {
      userId: priyaUser.id,
      employeeCode: 'EMP-2032',
      designation: 'Frontend Engineer',
      department: 'Engineering',
      team: 'Frontend',
      joinDate: new Date('2022-06-11'),
      managerId: managerEmp.id,
    },
  })

  const arjunEmp = await prisma.employee.create({
    data: {
      userId: arjunUser.id,
      employeeCode: 'EMP-2033',
      designation: 'Backend Engineer',
      department: 'Engineering',
      team: 'Backend',
      joinDate: new Date('2023-01-05'),
      managerId: managerEmp.id,
    },
  })
  
  const arunEmp = await prisma.employee.create({
    data: {
      userId: arunUser.id,
      employeeCode: 'EMP-2048',
      designation: 'Software Engineer',
      department: 'Engineering',
      team: 'Backend',
      joinDate: new Date('2023-08-12'),
      managerId: managerEmp.id,
    },
  })

  const allEmployees = [adminEmp, managerEmp, rahulEmp, priyaEmp, arjunEmp, arunEmp]
  
  for (let i = 0; i < additionalUsers.length; i++) {
    const user = additionalUsers[i]
    allEmployees.push(
      await prisma.employee.create({
        data: {
          userId: user.id,
          employeeCode: `EMP-300${i}`,
          designation: i % 2 === 0 ? 'QA Engineer' : 'Frontend Engineer',
          department: 'Engineering',
          team: i % 2 === 0 ? 'Testing' : 'Frontend',
          joinDate: new Date('2023-09-01'),
          managerId: managerEmp.id,
        },
      })
    )
  }

  // 3. Create Attendance (2-4 weeks)
  // Injecting Monday anomaly for Rahul
  for (let d = 21; d >= 0; d--) {
    const currentDate = daysAgo(d)
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const isMonday = currentDate.getDay() === 1
    
    if (isWeekend) continue
    
    for (const emp of allEmployees) {
      let checkInH = 9
      let checkInM = Math.floor(Math.random() * 15) // 9:00 - 9:14
      let checkOutH = 17
      let checkOutM = 30 + Math.floor(Math.random() * 30) // 17:30 - 18:00
      let status = 'PRESENT'
      
      // Anomaly for Rahul on Mondays (late arrival)
      if (emp.id === rahulEmp.id && isMonday) {
        checkInH = 9
        checkInM = 40 + Math.floor(Math.random() * 15) // 9:40 - 9:55
        if (d <= 7) status = 'PRESENT' // Force it present but late
      }
      
      // Some random leaves (skip generating attendance if on leave, or mark as LEAVE)
      if (emp.id === priyaEmp.id && d >= 10 && d <= 12) {
        status = 'LEAVE'
      }

      if (status === 'LEAVE') {
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: currentDate,
            status: 'LEAVE'
          }
        })
      } else {
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: currentDate,
            checkIn: generateTime(currentDate, checkInH, checkInM),
            checkOut: generateTime(currentDate, checkOutH, checkOutM),
            status: 'PRESENT'
          }
        })
      }
    }
  }

  // Create Anomaly Flag for Rahul
  await prisma.anomalyFlag.create({
    data: {
      employeeId: rahulEmp.id,
      type: 'LATE_ARRIVAL',
      detectedAt: new Date(),
      expectedValue: '09:10 AM',
      actualValue: '09:47 AM',
      deviation: '4 late arrivals within the last 7 working days',
      confidence: 0.94
    }
  })

  // 4. Leave Requests (Mix of pending, approved, rejected, with overlaps)
  
  // Priya's future leave request (Pending) - creates overlap in Engineering
  await prisma.leaveRequest.create({
    data: {
      employeeId: priyaEmp.id,
      type: 'Paid Leave',
      startDate: daysAgo(-3), // 3 days in future
      endDate: daysAgo(-6),   // 6 days in future
      remarks: 'Family trip',
      status: 'PENDING',
    }
  })
  
  // Additional employee requesting leave on same dates (Overlap for simulation)
  await prisma.leaveRequest.create({
    data: {
      employeeId: allEmployees[6].id, // Frontend Engineer
      type: 'Sick Leave',
      startDate: daysAgo(-2),
      endDate: daysAgo(-4),
      remarks: 'Medical procedure',
      status: 'APPROVED',
      decidedById: adminUser.id,
      decidedAt: new Date(),
      decisionReason: 'Sufficient team capacity',
    }
  })

  // Past Approved Leave for Arun
  await prisma.leaveRequest.create({
    data: {
      employeeId: arunEmp.id,
      type: 'Casual Leave',
      startDate: daysAgo(5),
      endDate: daysAgo(4),
      remarks: 'Personal errands',
      status: 'APPROVED',
      decidedById: adminUser.id,
      decidedAt: daysAgo(6),
      decisionReason: 'Team capacity remains above 80% and no overlapping leave exists.',
    }
  })
  
  // Past Rejected Leave for someone
  await prisma.leaveRequest.create({
    data: {
      employeeId: allEmployees[7].id,
      type: 'Paid Leave',
      startDate: daysAgo(10),
      endDate: daysAgo(8),
      remarks: 'Vacation',
      status: 'REJECTED',
      decidedById: adminUser.id,
      decidedAt: daysAgo(12),
      decisionReason: '3 members from the same team are already on leave during this period.',
    }
  })

  // 5. Payroll (2 months, 1 changed field for Arjun)
  
  for (const emp of allEmployees) {
    const isArjun = emp.id === arjunEmp.id
    const baseSalary = 30000
    const hra = 10000
    const allowances = isArjun ? 5000 : 2000
    const pf = 3600
    const tax = 1200
    
    // Previous Month (July)
    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        month: '2026-07',
        basic: baseSalary,
        hra: hra,
        allowances: allowances, // For Arjun it was 2000 in July
        pfDeduction: pf,
        taxDeduction: tax,
        gross: baseSalary + hra + (isArjun ? 2000 : allowances),
        net: (baseSalary + hra + (isArjun ? 2000 : allowances)) - pf - tax,
        effectiveDate: new Date('2026-07-01')
      }
    })

    // Current Month (August)
    const currentPayroll = await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        month: '2026-08',
        basic: baseSalary,
        hra: hra,
        allowances: allowances, // For Arjun it's now 5000
        pfDeduction: pf,
        taxDeduction: tax + (isArjun ? 200 : 0), // Minor tax bump for Arjun
        gross: baseSalary + hra + allowances,
        net: (baseSalary + hra + allowances) - pf - (tax + (isArjun ? 200 : 0)),
        effectiveDate: new Date('2026-08-01')
      }
    })

    // If Arjun, create payroll history explaining the jump
    if (isArjun) {
      await prisma.payrollHistory.create({
        data: {
          payrollId: currentPayroll.id,
          fieldChanged: 'Allowances',
          oldValue: 2000,
          newValue: 5000,
          changedById: adminUser.id,
          reason: 'Performance Allowance'
        }
      })
      
      await prisma.payrollHistory.create({
        data: {
          payrollId: currentPayroll.id,
          fieldChanged: 'Tax',
          oldValue: 1200,
          newValue: 1400,
          changedById: adminUser.id,
          reason: 'Tax adjustment'
        }
      })
    }
  }

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
