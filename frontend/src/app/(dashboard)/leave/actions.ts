"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveLeave(leaveId: string) {
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "APPROVED", decidedAt: new Date() },
  });
  
  revalidatePath("/leave");
}

export async function rejectLeave(leaveId: string) {
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "REJECTED", decidedAt: new Date() },
  });
  
  revalidatePath("/leave");
}
