"use client"
import Image from "next/image"
import Logo from "/public/logo-vistats.png"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getCookie, setCookie } from 'cookies-next';
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const loginSchema = z.object({
   email: z.string()
      .email("Por favor, insira um e-mail válido")
      .max(100, "E-mail muito longo"),
   password: z.string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
})

type LoginSchema = z.infer<typeof loginSchema>;

export default function SignIn() {
   const router = useRouter();
   const { handleSubmit, register, formState: { errors } } = useForm<LoginSchema>({
      resolver: zodResolver(loginSchema)
   })


   async function handleSignIn(data: LoginSchema) {
      const { email, password } = data;

      try {
         const { data, error } = await supabase.auth.signInWithPassword({ email, password });
         console.log("Dados do login:", data);
         console.log('Access token: ', data.session?.access_token)
         if (error) {
            throw error;
         };

         if (data.session) {
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
               <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleSignIn)}>
                  <div>
                     <Label htmlFor="email" className="mb-1 text-base">Email</Label>
                     <Input type="email" id="email" className="border-zinc-400"
                        placeholder="Digite seu email" {...register("email")} />
                     {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                     <Label htmlFor="password" className="mb-1 text-base">Senha</Label>
                     <Input type="password" id="password" className="border-zinc-400"
                        placeholder="Digite sua senha" {...register("password")} />
                     {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="text-lg my-1">
                     Enviar
                  </Button>
                  <div className="text-center mt-2">
                     <p>Não tem uma conta? <Link href={'/register'} className="text-emerald-600 font-semibold">Criar conta</Link></p>
                  </div>
               </form>
            </div>
         </div>
      </div>
   )
}