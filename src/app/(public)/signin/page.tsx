"use client"
import Image from "next/image"
import Logo from "/public/logo-vistats.png"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getCookie, setCookie } from 'cookies-next'; // Instale com: npm install cookies-next


export default function SignIn() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isError, setIsError] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const router = useRouter();

   useEffect(() => {
      if (isError === true) {
         setIsError(false);
      };
   }, [email, password]);

   function getTranslatedError(error: any) {
      setIsError(true);
      switch (error) {
         case "invalid_credentials":
            return "Dados inválidos, tente novamente";
         case "validation_failed":
            return "Preencha todos os campos corretamente.";
         default:
            return "Ocorreu um erro. Tente novamente.";
      }
   }

   async function handleSignIn(e: React.FormEvent) {
      e.preventDefault();
      try {
         const { data, error } = await supabase.auth.signInWithPassword({ email, password });
         console.log("Dados do login:", data); // Verifique o que está vindo aqui
         console.log('Access token: ', data.session?.access_token)
         if (error) {
            setIsError(true);
            setErrorMessage(getTranslatedError(error.code));
            throw error;
         };
         
         if(data.session){
            await setCookie('token', data.session.access_token, {
               path: '/',
               secure: true, // Garante que o cookie só seja transmitido por HTTPS
               maxAge: 60 * 60 * 24 * 7 // Expira em 7 dias
            })
         }
         console.log(getCookie('token'))
         
         router.push('/');
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <div className="flex justify-center items-center min-h-screen -mt-24 w-full bg-zinc-100 dark:bg-zinc-900">
         <div className="flex flex-col gap-4 p-5 mx-2 rounded-xl sm:min-w-96 border border-zinc-800 bg-white dark:bg-black shadow-2xl shadow-emerald-200 dark:shadow-emerald-950">
            <div className="flex flex-col items-center border-b border-zinc-400 dark:border-zinc-800 pb-4">
               <Image src={Logo} alt="Logo da Vistats" className="size-16" />
               <h1 className="text-xl font-semibold my-1">Faça login na <span className="font-bold text-emerald-600">Vistats</span></h1>
               <h2 className="text-center">Analise os dados dos produtos da sua empresa!</h2>
            </div>
            <div>
               <form className="flex flex-col gap-2" onSubmit={handleSignIn}>
                  <div>
                     <Label htmlFor="email" className="mb-1 text-base">Email</Label>
                     <Input type="email" id="email"
                        placeholder="Digite seu email"
                        className="border-zinc-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                     <Label htmlFor="password" className="mb-1 text-base">Senha</Label>
                     <Input type="password" id="password"
                        placeholder="Digite sua senha"
                        className="border-zinc-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="text-lg my-1">
                     Enviar
                  </Button>
                  {isError &&
                     <p className="text-red-700 text-center">{errorMessage}</p>
                  }
                  <div className="text-center mt-2">
                     <p>Não tem uma conta? <Link href={'/register'} className="text-emerald-600 font-semibold">Criar conta</Link></p>
                  </div>
               </form>
            </div>
         </div>
      </div>
   )
}