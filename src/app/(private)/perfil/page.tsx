"use client"

import { Footer } from "@/components/footer";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/store/zustand";
import { Product } from "@/types/product";
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
   const router = useRouter();
   const profileImage = useProfileStore((state) => state.profileImage);
   const fetchImage = useProfileStore((state) => state.fetchImage);
   const [products, setProducts] = useState<Partial<Product[]>>([]);

   useEffect(() => {
      getUsername();
      fetchImage();
      fetchProducts();
   }, []);

   async function getUsername() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      try {
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
         console.log('Erro no users: ', error);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
         // Nome do arquivo baseado no ID do usuário (sempre o mesmo)
         const fileName = `${session.user.id}-profile`;
         await supabase.storage.from("avatars").remove([fileName]);

         // Sobrescreve a imagem existente (usando upsert: true)
         const { error } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, { cacheControl: "no-store", upsert: true });

         if (error) throw error;

         // Obtém a URL pública (já atualizada)
         const { data: urlData } = await supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

         const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

         // Atualiza a URL na tabela users
         const { error: updateError } = await supabase
            .from("users")
            .update({ profile_image: imageUrl })
            .eq("user_id", session.user.id);

         if (updateError) throw updateError;

         fetchImage();
      } catch (error) {
         console.error("Erro ao fazer upload:", error);
      }
   }


   async function handleLogOut() {
      const { error } = await supabase.auth.signOut();
      await deleteCookie('token')
      router.push('/signin')
   };

   async function fetchProducts() {
      try {
         const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

         if (error) throw error;
         setProducts(data.sort((a, b) => b.sold - a.sold));
      } catch (error: any) {
         console.error("Erro ao buscar produtos:", error);
      }
   }

   return (
      <div>
         {isLoading
            ? <div>
               <Loading />
            </div>
            : <>
               <div className="p-5 w-full max-w-[1300px] mx-auto">
                  <h1 className="mb-5">Seu Perfil</h1>
                  <div className="grid items-start gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 min-h-[80vh]">
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
                                    className="w-44 h-44 rounded-full object-cover border"
                                 />
                              ) : (
                                 <>
                                    <img className="size-44 rounded-full " src="avatar.jpg" alt="Adicionar Foto" />
                                    <span className="text-center text-sm">Adicionar foto</span>
                                 </>
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
                     <Card className="w-full min-w-56 max-w-96">
                        <CardHeader>
                           <CardTitle>Produtos</CardTitle>
                           <CardDescription>Os cinco mais vendidos</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col h-full">
                           <ul className="mb-5">
                              {products.length > 0
                                 ? products.slice(0, 5).map((p) => (
                                    <li className="mb-2 flex justify-between gap-3"><p>{p?.name}</p> <span>{p?.sold} vendas</span></li>
                                 ))
                                 : <p>Adicione produtos</p>}
                           </ul>
                           <Button className=" w-full mt-auto">
                              <Link href={'/products'}>{products.length > 0 ? 'Ver todos' : 'Criar produto'}</Link>
                           </Button>
                        </CardContent>
                     </Card>
                  </div>
               </div>
               <Footer />
            </>
         }
      </div>
   )
}