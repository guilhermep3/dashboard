import { Linkedin } from "lucide-react"

export function Footer() {

   return (
      <footer className="flex flex-col justify-center items-center gap-3 w-full p-5 bg-white dark:bg-black">
         <a href="https://www.linkedin.com/in/guilherme-pereira3/" target="_blank"><Linkedin fill="#007BB6" stroke="transparent"  /></a>
         <div>
            <p className="text-center text-sm">
               Desenvolvido por
               <a href="https://github.com/guilhermep3" target="_blank"
                  className="text-emerald-600 underline"> Guilherme Pereira</a>
            </p>
         </div>
      </footer>
   )
}