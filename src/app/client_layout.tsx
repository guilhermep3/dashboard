"use client"
import { Aside } from "@/components/aside";
import { Header } from "@/components/header";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
   const hiddenRoutes = ["/signin", "/register"];
   const pathname = usePathname();

   return (
      <>
         {!hiddenRoutes.includes(pathname) && (
            <Aside />
         )}
         <main className={`flex-1 bg-zinc-200 dark:bg-zinc-950
               ${!hiddenRoutes.includes(pathname) ? 'sm:pl-60 lg:pl-72' : 'pl-0'}`}>
            <Header />
            {children}
         </main>
      </>
   )
}