"use client"
import Image from "next/image"
import Logo from "/public/logo-vistats.png"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function Register() {
   const [name, setName] = useState('');
   const [company, setCompany] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isError, setIsError] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [isOpen, setIsOpen] = useState(false);
   const router = useRouter();

   useEffect(() => {
      if (isError === true) {
         setIsError(false);
      }
   }, [name, company, email, password]);

   const getTranslatedError = (error: any) => {
      setIsError(true);
      if (name === '' || company === '' || email === '' || password === '') {
         return "Preencha todos os campos corretamente."
      }
      switch (error) {
         case "user_already_exists":
            return "Usuário já existe. Clique em 'Entrar'.";
         case "invalid_email":
            return "E-mail inválido. Insira um e-mail válido.";
         case "weak_password":
            return "Senha fraca. Use pelo menos 6 caracteres.";
         case "anonymous_provider_disabled":
            return "Preencha todos os campos corretamente.";
         default:
            return "Ocorreu um erro. Tente novamente.";
      }
   };

   async function handleRegister(e: React.FormEvent) {
      e.preventDefault();
      try {
         const { data, error } = await supabase.auth.signUp({ email, password })

         if (error) {
            setErrorMessage(getTranslatedError(error.code));
            throw error
         };

         if (data.user) {
            const { error: insertError } = await supabase.from('users').insert({
               user_id: data.user.id,
               name: name,
               company_name: company
            });

            if (insertError) {
               setErrorMessage(getTranslatedError(insertError.code));
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
               <form className="flex flex-col gap-2" onSubmit={handleRegister}>
                  <div className="flex gap-2">
                     <div>
                        <Label htmlFor="name" className="mb-1 text-base">Nome</Label>
                        <Input placeholder="Digite seu nome" id="name"
                           className="border-zinc-400"
                           value={name}
                           onChange={(e) => setName(e.target.value)} />
                     </div>
                     <div>
                        <Label htmlFor="company" className="mb-1 text-base">Empresa</Label>
                        <Input placeholder="Nome da empresa" id="company"
                           className="border-zinc-400"
                           value={company}
                           onChange={(e) => setCompany(e.target.value)} />
                     </div>
                  </div>
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