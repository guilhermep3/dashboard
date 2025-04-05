"use client"
import Image from "next/image"
import Logo from "/public/logo-vistats.png"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const registerSchema = z.object({
   name: z.string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome não pode ter mais que 50 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
   company: z.string()
      .min(3, "Empresa deve ter pelo menos 3 caracteres")
      .max(50, "Nome da empresa muito longo"),
   email: z.string()
      .email("Por favor, insira um e-mail válido")
      .max(100, "E-mail muito longo"),
   password: z.string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function Register() {
   const [formData, setFormData] = useState({
      name: '',
      company: '',
      email: '',
      password: ''
   })
   const [isOpen, setIsOpen] = useState(false);
   const router = useRouter();
   const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
      resolver: zodResolver(registerSchema)
   })


   async function handleRegister(data: RegisterSchema) {

      const { name, company, email, password } = data;
      try {
         const { data: signUpData, error } = await supabase.auth.signUp({ email, password })

         if (error) {
            throw error
         };

         if (signUpData.user) {
            const { error: insertError } = await supabase.from('users').insert({
               user_id: signUpData.user.id,
               name,
               company_name: company
            });

            if (insertError) {
               throw insertError;
            } else {
               setIsOpen(true);
            };
         };
      } catch (error) {
         throw error;
      }
   }

   function handleGoSignIn() {
      setIsOpen(false);
      router.push("/signin");
   }

   return (
      <div className="flex justify-center items-center min-h-screen -mt-24 w-full bg-zinc-100 dark:bg-zinc-900">
         <div className="flex flex-col gap-4 p-3 sm:p-5 mx-2 rounded-xl sm:min-w-96 border border-zinc-800 bg-white dark:bg-black shadow-2xl shadow-emerald-200 dark:shadow-emerald-950">
            <div className="flex flex-col items-center border-b border-zinc-400 pb-4">
               <Image src={Logo} alt="Logo da Vistats" className="size-16" />
               <h1 className="text-xl font-semibold my-1">Cadastre-se na <span className="font-bold text-emerald-600">Vistats</span></h1>
               <h2 className="text-center">Analise os dados dos produtos da sua empresa!</h2>
            </div>
            <div>
               <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleRegister)}>
                  <div className="flex gap-2">
                     <div>
                        <Label htmlFor="name" className="mb-1 text-base">Nome</Label>
                        <Input id="name" className="border-zinc-400"
                           placeholder="Digite seu nome" {...register("name")} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                     </div>
                     <div>
                        <Label htmlFor="company" className="mb-1 text-base">Empresa</Label>
                        <Input id="company" className="border-zinc-400"
                           placeholder="Nome da empresa" {...register("company")} />
                        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
                     </div>
                  </div>
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
                     <p>Já possui uma conta? <Link href={'/signin'} className="text-emerald-600 font-semibold">Entrar</Link></p>
                  </div>
               </form>
            </div>
         </div>
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="text-center">
               <DialogHeader>
                  <h1 className="text-center text-lg font-semibold">Parabéns</h1>
               </DialogHeader>
               Conta criada com sucesso, agora entre na sua conta com o mesmo email e senha
               <Button onClick={handleGoSignIn}>Entrar</Button>
            </DialogContent>
         </Dialog>
      </div>
   )
}