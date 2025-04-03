import { DollarSign } from "lucide-react"
import { Card, CardTitle } from "../ui/card"

type props = {
   data: any;
   title: string;
   description: string;
}
export const DashboardCard = ({data, title, description}: props) => {

   return (
      <Card className="flex justify-center items-center flex-col flex-1 gap-3 p-3 text-center h-44 shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
         <CardTitle className="flex items-center gap-1 text-lg"><DollarSign /> {title}</CardTitle>
         <p className="text-2xl font-bold text-emerald-600">
            {data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
         </p>
         <p className="text-xs text-zinc-700 dark:text-zinc-400">{description}</p>
      </Card>
   )
}