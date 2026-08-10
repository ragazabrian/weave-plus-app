import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 sm:px-10 py-8 max-w-[1200px]">{children}</main>
    </div>
  );
}
