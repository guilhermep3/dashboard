"use client"
import Image from "next/image";
import Logo from "/public/logo-vistats.png"
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, CircleUserRound, House } from "lucide-react";

type props = {
   showAside: boolean;
   setShowAside: () => void;
}
export const Aside = ({ showAside, setShowAside }: props) => {
   const [activeAsideItem, setAcitveAsideItem] = useState(0);
   const router = useRouter();
   const pathname = usePathname();

   const routeToIdMap: Record<string, number> = {
      '/': 0,
      '/products': 1,
      '/perfil': 2,
   };

   useEffect(() => {
      const activeId = routeToIdMap[pathname] ?? 0;
      setAcitveAsideItem(activeId);
   }, [pathname]);

   const asideItems = [
      { id: 0, icon: <House size={20} />, title: 'Dashboard' },
      { id: 1, icon: <Box size={20} />, title: 'Produtos' },
      { id: 2, icon: <CircleUserRound size={20} />, title: 'Perfil' },
   ]
   function checkPathName(itemId: number) {
      switch (itemId) {
         case 0:
            return '/';
         case 1:
            return '/products'
         case 2:
            return '/perfil'
         default:
            return '/'
      }
   }

   function handleChangeMain(itemId: number) {
      setAcitveAsideItem(itemId);
      let pathname = checkPathName(itemId);
      router.push(pathname);
      setShowAside();
   }

   return (
      <aside className={`fixed left-0 top-0 bottom-0 flex flex-col gap-5 sm:w-60 lg:w-72 z-40
         bg-[#009966] text-white dark:text-black transition-transform duration-300
         ${showAside ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
         <div className="flex items-center gap-3 p-5 mx-auto">
            <Image src={Logo} alt="Logo da Vistats" className="bg-white dark:bg-black rounded-full p-1 w-12" />
            <p className="text-2xl font-bold uppercase">Vistats</p>
         </div>
         <div className="flex flex-col gap-3">
            <ul>
               {asideItems.map(item => (
                  <li key={item.id}
                     className={`flex items-center gap-3 py-3 border-l-8 pl-5 transition duration-200 cursor-pointer
                           ${activeAsideItem === item.id
                           ? ' border-white bg-emerald-500 dark:border-black'
                           : ' border-transparent bg-transparent hover:bg-emerald-500/30'
                        }
                        `}
                     onClick={() => handleChangeMain(item.id)}
                  >
                     {item.icon}
                     <p className="text-lg font-semibold">{item.title}</p>
                  </li>
               ))}
            </ul>
         </div>
      </aside>
   )
}