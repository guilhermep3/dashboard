"use client"
import { Aside } from "@/components/aside";
import { Header } from "@/components/header";
import { HeaderSignInRegister } from "@/components/headerSigninRegister";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
   const hiddenRoutes = ["/signin", "/register"];
   const pathname = usePathname();
   const [showAside, setShowAside] = useState(false);

   return (
      <>
         {!hiddenRoutes.includes(pathname) && (
            <Aside showAside={showAside} setShowAside={() => setShowAside(false)} />
         )}
         <main className={`flex-1 bg-zinc-200 dark:bg-zinc-950 transition
            ${!hiddenRoutes.includes(pathname) ? 'sm:pl-60 lg:pl-72' : 'pl-0'}`}
         >
            {/* Fundo escuro para fechar o aside */}
            <div className={`fixed top-0 left-0 w-full h-full transition-opacity duration-300 bg-black/50 z-30 
               ${showAside ? "opacity-100 visible" : "opacity-0 invisible"}`}
               onClick={() => setShowAside(false)}
            ></div>
            {hiddenRoutes.includes(pathname)
               ? <HeaderSignInRegister />
               : <Header showAside={showAside} setShowAside={() => setShowAside(true)} />
            }
            {children}
         </main>

      </>
   )
}