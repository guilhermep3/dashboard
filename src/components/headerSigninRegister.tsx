"use client"
import { ThemeToggle } from "./theme-toggle"

export const HeaderSignInRegister = () => {

   return (
      <header className="bg-white dark:bg-black flex justify-between items-center px-5 sm:px-6 py-3 min-h-24 w-full transition">
         <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600">Vistats</h1>
         <div className="flex items-center gap-3">
            <ThemeToggle />
         </div>
      </header>
   )
}