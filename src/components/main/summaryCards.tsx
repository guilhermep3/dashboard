import { Product } from "@/types/product";
import { DashboardCard } from "../charts/dashboardCard";

type props = {
   formattedData: Product[];
}
export function SummaryCards({ formattedData }: props) {

   const totalInvoicing = formattedData.reduce((acc, product) => acc + (product.sold * product.price), 0);
   const totalProfit = formattedData.reduce((acc, product) => acc + (product.sold * (product.price - product.cost)), 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
   const totalCost = formattedData.reduce((acc, product) => acc + product.cost, 0);
   const totalPrice = formattedData.reduce((acc, product) => acc + product.price, 0);

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
         <DashboardCard data={totalInvoicing}
            title="Faturamento total"
            description="Soma do valor de todas as vendas realizadas, sem considerar os custos."
         />
         <DashboardCard data={totalProfit}
            title="Lucro total"
            description="Valor restante após descontar os custos do faturamento total."
         />
         <DashboardCard data={totalCost}
            title="Custo total"
            description="Soma dos custos de todos os produtos vendidos."
         />
         <DashboardCard data={totalPrice}
            title="Preço total"
            description="Soma do preço de venda de todos os produtos comercializados."
         />
      </div>
   );
}
