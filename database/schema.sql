-- Dayflow PostgreSQL Schema for Supabase
-- This schema matches the Prisma ORM definitions.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Table: Employee
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL UNIQUE,
    "employeeCode" TEXT NOT NULL UNIQUE,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "managerId" TEXT,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Attendance
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: LeaveRequest
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "status" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionReason" TEXT,
    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Payroll
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "employeeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL,
    "pfDeduction" DOUBLE PRECISION NOT NULL,
    "taxDeduction" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: PayrollHistory
CREATE TABLE "PayrollHistory" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "payrollId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" DOUBLE PRECISION NOT NULL,
    "newValue" DOUBLE PRECISION NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    CONSTRAINT "PayrollHistory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PayrollHistory_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PayrollHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readBool" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: PulseResponse
CREATE TABLE "PulseResponse" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mood" TEXT NOT NULL,
    CONSTRAINT "PulseResponse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PulseResponse_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: AnomalyFlag
CREATE TABLE "AnomalyFlag" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedValue" TEXT,
    "actualValue" TEXT,
    "deviation" TEXT,
    "confidence" DOUBLE PRECISION,
    "resolvedBool" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AnomalyFlag_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AnomalyFlag_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Employee_employeeCode_idx" ON "Employee"("employeeCode");

-- ==========================================
-- SUPABASE AUTH INTEGRATION
-- ==========================================
-- Automatically mirror new signups from auth.users to our public."User" table

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, "passwordHash", role)
  VALUES (
    new.id::text, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'supabase-auth-managed', -- Handled by Supabase Auth internally
    'EMPLOYEE'               -- Default role assigned to new signups
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
