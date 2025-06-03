"use client";
import { useEffect } from "react";
import { Product } from "@/types/product";
import { Footer } from "@/components/footer";
import { useProfileStore } from "@/store/zustand";
import { useDashboardData } from "@/hooks/useDashboarddata";
import { SummaryCards } from "@/components/main/summaryCards";
import { BestSellers } from "@/components/main/bestSellers";
import { MostProfit } from "@/components/main/mostProfit";

export default function Home() {
   const { data: formattedData, loading: isLoading } = useDashboardData();
   const fetchImage = useProfileStore((state) => state.fetchImage);

   useEffect(() => {
      fetchImage();
   }, []);

   // Agrupamento por mês
   const productsByMonth = formattedData.reduce((acc, product) => {
      const month = product.created_at;
      if (!acc[month]) acc[month] = [];
      acc[month].push(product);
      return acc;
   }, {} as Record<string, Product[]>);


   // Dados de totais
   const totalQuantity = formattedData.reduce((acc, product) => acc + product.quantity, 0);
   const totalSold = formattedData.reduce((acc, product) => acc + product.sold, 0);
   const monthsCount = Object.keys(productsByMonth).length;
   const avgProductsPerMonth = monthsCount > 0 ? totalQuantity / monthsCount : 0;
   const avgSoldPerMonth = monthsCount > 0 ? totalSold / monthsCount : 0;

   const soldByCategory = formattedData.reduce((acc, product) => {
      // Verifica se a categoria já existe no acumulador (acc)
      if (!acc[product.category_id]) {
         // Se não existir, inicializa a categoria no acumulador com `totalSold` zerado
         acc[product.category_id] = {
            category: product.category,
            totalSold: 0,
            totalQuantity: 0,
            category_id: product.category_id
         };
      }
      // Adiciona a quantidade vendida do produto ao total da categoria correspondente
      acc[product.category_id].totalSold += product.sold;
      acc[product.category_id].totalQuantity += product.quantity;

      // Retorna o acumulador atualizado para a próxima iteração
      return acc;
   }, {} as Record<string, { category: string; totalSold: number, totalQuantity: number, category_id: any }>);
   // Convertendo o objeto para um array
   const formattedSortByCategory = Object.values(soldByCategory).sort((a, b) => b.totalSold - a.totalSold);

   if (formattedData.length === 0) {
      return (
         <div>
            <div className="w-full max-w-[1300px] mx-auto p-5">
               <h1 className="mb-5 text-lg sm:text-xl font-semibold">Dashboard</h1>
               <div className="grid grid-cols-1 min-h-[80vh] gap-10">
                  Adicione produtos para analisar os gráficos.
               </div>
            </div>
            <Footer />
         </div>
      )
   }

   return (
      <div>
         <div className="w-full max-w-[1300px] mx-auto p-5">
            <h1 className="mb-5 text-lg sm:text-xl font-semibold">Dashboard</h1>
            <div className="grid grid-cols-1 min-h-[80vh] gap-10">
               <SummaryCards formattedData={formattedData} />
               <div className="flex flex-col border-t-2 border-zinc-300 dark:border-zinc-900">
                  <h1 className="text-lg my-3">Vendas</h1>
                  <BestSellers formattedData={formattedData} isLoading={isLoading}
                     totalQuantity={totalQuantity} totalSold={totalSold}
                     avgProductsPerMonth={avgProductsPerMonth} formattedSortByCategory={formattedSortByCategory}
                     avgSoldPerMonth={avgSoldPerMonth} productsByMonth={productsByMonth}
                  />
               </div>
               <div className="flex flex-col border-t-2 border-zinc-300 dark:border-zinc-900">
                  <h1 className="text-lg my-3">Lucros</h1>
                  <MostProfit isLoading={isLoading} formattedData={formattedData}
                     formattedSortByCategory={formattedSortByCategory} productsByMonth={productsByMonth}
                     avgProductsPerMonth={avgProductsPerMonth} avgSoldPerMonth={avgSoldPerMonth}
                  />
               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
