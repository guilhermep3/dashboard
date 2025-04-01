"use client"

import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { deleteCookie } from "cookies-next";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Perfil() {
   const [username, setUsername] = useState<string | null>(null);
   const [company, setCompany] = useState<string | null>(null);
   const [createdAt, setCreatedAt] = useState<any>(null);
   const [email, setEmail] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [profileImage, setProfileImage] = useState<any>(null);
   const router = useRouter();

   useEffect(() => {
      getUsername();
   }, []);

   useEffect(() => {
      console.log("Imagem de perfil atualizada:", profileImage);
   }, [profileImage]);

   async function getUsername() {
      try {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) return;
         const userId = session.user.id;

         const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();

         if (error) {
            console.error("Erro ao buscar usuário:", error);
            return;
         }

         setUsername(data?.name || "Usuário");
         setCompany(data?.company_name || "Nome da empresa");
         setCreatedAt(data?.created_at || "00/00/2025");
         setEmail(session.user.email || "empresa@email.com");
         setTimeout(() => {
            setIsLoading(false);
         }, 100);
      } catch (error) {
         console.log('Erro no getSession: ', error);
      };
   };

   if (isLoading) return <Loading />

   function handleGetImage(event: any) {
      const file = event.target.files[0];
      if (file) {
         uploadProfileImage(file)
      };
   };

   async function uploadProfileImage(file: File) {
      if (!file) return;
   
      try {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) return;
   
         const fileName = `${session.user.id}-${Date.now()}`;
         // Guarda a imagem no Supabase
         const { data, error } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, { cacheControl: "3600", upsert: true });
   
         if (error) throw error;
   
         // Obtém a URL pública
         const { data: urlData } = await supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
   
         const imageUrl = urlData.publicUrl;
   
         // Atualiza na tabela users
         const { error: updateError } = await supabase
            .from("users")
            .update({ profile_image: imageUrl })
            .eq("user_id", session.user.id);
   
         if (updateError) throw updateError;
   
         setProfileImage(imageUrl);
      } catch (error) {
         console.error("Erro ao fazer upload:", error);
      }
   }

   async function handleLogOut() {
      const { error } = await supabase.auth.signOut();
      router.push('/signin')
      await deleteCookie('token')
   }


   return (
      <div className="p-5 w-full max-w-[1200px] mx-auto">
         <h1 className="mb-5">Seu Perfil</h1>
         <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            <Card className="relative px-7 flex flex-col items-center">
               <Dialog>
                  <DialogTrigger className="absolute left-5 top-5 cursor-pointer" title="Sair da conta">
                     <LogOut className="rotate-180" />
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle className="text-center">
                           Tem certeza que deseja sair da sua conta?
                        </DialogTitle>
                     </DialogHeader>
                     <div className="flex justify-center gap-5 mt-3">
                        <Button onClick={handleLogOut}>Confirmar</Button>
                        <DialogClose>
                           <Button variant={"destructive"}>Cancelar</Button>
                        </DialogClose>
                     </div>
                  </DialogContent>
               </Dialog>
               <CardHeader className="flex flex-col justify-center items-center text-center w-full">
                  <label htmlFor="fileInput" className="cursor-pointer">
                     {profileImage ? (
                        <img
                           src={profileImage ?? 'avatar.jpg'}
                           alt="Foto de perfil"
                           className="w-28 h-28 rounded-full object-cover border p-2"
                        />
                     ) : (
                        <>
                           <img className="size-28 rounded-full " src="avatar.jpg" alt="Adicionar Foto" />
                           <span className="text-center text-sm">Adicionar foto</span>
                        </>
                        // <div className="bg-emerald-200 size-28 rounded-full flex items-center justify-center text-gray-500">
                        //    Adicionar Foto
                        // </div>
                     )}
                  </label>
                  <input
                     id="fileInput"
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleGetImage}
                  />
                  <CardTitle className="text-xl font-semibold mt-3">{username}</CardTitle>
                  <CardDescription>Empresa: {company}</CardDescription>
               </CardHeader>
               <CardContent className="w-full text-center">
                  <div>
                     <p className="font-semibold">Email:</p>
                     <p className="text-zinc-700 dark:text-zinc-300">{email}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="w-full min-w-56">
               <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Os cinco mais vendidos</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-col h-full">
                  <ul className="mb-5">
                     <li className="mb-2"><p>Celular</p></li>
                     <li className="mb-2"><p>Monitor</p></li>
                     <li className="mb-2"><p>Celular</p></li>
                     <li className="mb-2"><p>Monitor</p></li>
                     <li className="mb-2"><p>Celular</p></li>
                  </ul>
                  <Button className=" w-full mt-auto">
                     <Link href={'/products'}>Ver todos</Link>
                  </Button>
               </CardContent>
            </Card>
         </div>
      </div>
   )
}