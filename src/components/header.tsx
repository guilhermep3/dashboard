"use client"
import { supabase } from "@/lib/supabase"
import { ThemeToggle } from "./theme-toggle"
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const Header = () => {
   const router = useRouter();
   const pathname = usePathname();
   const [username, setUsername] = useState<string | null>(null);
   const [headerTitle, setHeaderTitle] = useState('');

   useEffect(() => {
      getUsername();
      setHeaderTitle(checkPathname());
   }, []);

   function checkPathname(){
      switch(pathname){
         case'/products':
            return 'Produtos';
         case '/perfil':
            return 'Perfil';
         case '/employees':
            return 'Empregados'
         default:
            return 'Vistats';
      }
   }

   async function getUsername() {
      try {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) {
            setUsername('Faça login');
            return;
         };
         const userId = session.user.id;

         const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();

         if (error) {
            console.error("Erro ao buscar usuário:", error);
            return;
         }
         // console.log('data da busca do usuário: ', data)

         setUsername(data?.name || "Usuário");
      } catch (error) {
         console.error("Erro ao buscar nome do usuário:", error);
      }
   }

   function handleGoPerfilPage() {
      router.push('/perfil')
   }

   return (
      <header className="bg-white dark:bg-black flex justify-between items-center px-6 py-3 min-h-24 w-full transition">
         <h1 className="text-3xl font-semibold">{headerTitle}</h1>
         <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 p-2 rounded-xl cursor-pointer dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 shadow-lg shadow-zinc-200 dark:shadow-black"
               onClick={handleGoPerfilPage}>
               <div className="border-2 bg-emerald-100 border-emerald-600 rounded-full size-10"></div>
               <p>{username ?? "Carregando..."}</p>
            </div>
         </div>
      </header>
   )
}