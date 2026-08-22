import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import LeaveTable from "./LeaveTable";
import SearchBar from "@/components/SearchBar/SearchBar";

export default async function LeaveManagement({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params?.q || "";

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      employee: {
        user: {
          name: {
            contains: query,
            mode: "insensitive"
          }
        }
      }
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>LEAVE PIPELINE</h1>
          <p className={styles.subtitle}>Time off workflow and approvals.</p>
        </div>
        <SearchBar placeholder="Search pipeline..." />
      </header>

      <LeaveTable leaves={leaves} />
      
    </div>
  );
}
