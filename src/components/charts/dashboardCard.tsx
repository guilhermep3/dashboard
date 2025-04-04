import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

type props = {
   data: any;
   title: string;
   description: string;
}
export const DashboardCard = ({ data, title, description }: props) => {

   return (
      <Card className="flex items-center flex-col flex-1 gap-0 p-0 text-center h-44 shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
         <CardHeader className="text-center flex justify-center w-full bg-emerald-600 px-1 py-3 rounded-t-xl">
            <CardTitle className="flex items-center gap-1 text-lg text-white"><DollarSign /> {title}</CardTitle>
         </CardHeader>
         <CardContent className="flex flex-col justify-center items-center gap-2 h-full -mt-2">
            <p className="text-2xl font-bold text-emerald-600">
               {data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-zinc-700 dark:text-zinc-400">{description}</p>
         </CardContent>
      </Card>
   )
}