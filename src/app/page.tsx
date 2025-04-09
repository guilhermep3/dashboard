"use client";

import { useEffect, useState } from "react";
import { SoldMonthChart } from "@/components/charts/soldMonthChart";
import { TotalSoldChart } from "@/components/charts/totalSoldChart";
import { Skeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Footer } from "@/components/footer";
import { BestSellersChart } from "@/components/charts/bestSellersChart";
import { WorstSellersChart } from "@/components/charts/worstSellers";
import { DashboardCard } from "@/components/charts/dashboardCard";
import { ProfitCategoryChart } from "@/components/charts/profitCategoryCharts";
import { BestSellerProductsT1Category } from "@/components/charts/bestSellerProductsT1Category";
import { useProfileStore } from "@/store/zustand";
import { ProfitableMonthChart } from "@/components/charts/profitableMonthChart";
import { useDashboardData } from "@/hooks/useDashboarddata";
import { ProfitMonthChart } from "@/components/charts/profitMonthChart";
import { MediaProfitByCategory } from "@/components/charts/mediaPorfitByCategory";

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
   console.log("productsByMonth: ",productsByMonth)

   const productsSoldPerMonth = Object.entries(productsByMonth).map(([month, products]) => ({
      month,
      quantity: products.reduce((acc, p) => acc + p.quantity, 0),
      sold: products.reduce((acc, p) => acc + p.sold, 0),
   }));

   const productsProfitPerMonth = Object.entries(productsByMonth).map(([month, product]) => ({
      month,
      profit: product.reduce((acc, p) => acc + (p.price - p.cost), 0)
   }))
   console.log("productsProfitPerMonth: ",productsProfitPerMonth)

   const profitByCategory = formattedData.reduce((acc, product) => {
      const lucroTotal = (product.price - product.cost) * product.sold;
      const catId = product.category_id;

      if (!acc[catId]) {
         acc[catId] = {
            category: product.category,
            profit: 0,
            category_id: catId
         };
      }

      acc[catId].profit += lucroTotal;

      return acc;
   }, {} as Record<string, { category: string; profit: number; category_id: string }>);

   const sortedProfitByCategory = Object.values(profitByCategory)
      .sort((a, b) => b.profit - a.profit);

   // Dados de totais
   const totalProfit = formattedData.reduce((acc, product) => acc + (product.sold * (product.price - product.cost)), 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
   const totalInvoicing = formattedData.reduce((acc, product) => acc + (product.sold * product.price), 0);
   const totalCost = formattedData.reduce((acc, product) => acc + product.cost, 0);
   const totalPrice = formattedData.reduce((acc, product) => acc + product.price, 0);
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
   console.log("formattedSortByCategory: ",formattedSortByCategory)
   
   const averageProfitByCategory = formattedData.reduce((acc, product) => {
      if(!acc[product.category_id]){
         acc[product.category_id] = {
            category: product.category,
            profit: 0,
            count: 0
         }
         acc[product.category_id].profit += (product.price - product.cost);
         acc[product.category_id].count += 1;
      }
      return acc;
   }, {} as Record<string, { category: string, profit: number, count: number}>);

   const formattedAverageProfitByCategory = Object.values(averageProfitByCategory)
      .map(({category, count, profit}) => ({
         category,
         averageProfit: profit / count
      })).sort((a, b) => b.averageProfit - a.averageProfit)


   const mostProfitableChartData = formattedData
      .map(product => ({
         name: product.name,
         profit: (product.price - product.cost),
         fill: "var(--primary-color)"
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6);


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
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                  <DashboardCard data={totalInvoicing}
                     title="Faturamento total"
                     description="Soma do valor de todas as vendas realizadas, sem considerar os custos." />
                  <DashboardCard data={totalProfit}
                     title="Lucro total"
                     description="Valor restante após descontar os custos do faturamento total." />
                  <DashboardCard data={totalCost}
                     title="Custo total"
                     description="Soma dos custos de todos os produtos vendidos." />
                  <DashboardCard data={totalPrice}
                     title="Preço total"
                     description="Soma do preço de venda de todos os produtos comercializados." />
               </div>
               <div className="flex flex-col border-t-2 border-zinc-300 dark:border-zinc-900">
                  <h1 className="text-lg my-3">Vendas</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                     {isLoading ? <Skeleton />
                        : <TotalSoldChart totalQuantity={totalQuantity} totalSold={totalSold} />
                     }
                     {isLoading ? <Skeleton h="300px" />
                        : <SoldMonthChart products={productsSoldPerMonth}
                           avgProductsPerMonth={avgProductsPerMonth}
                           avgSoldPerMonth={avgSoldPerMonth} />
                     }
                     {isLoading ? <Skeleton h="300px" />
                        : <ProfitCategoryChart formattedSortByCategory={formattedSortByCategory} />
                     }
                     {isLoading ? <Skeleton />
                        : <BestSellersChart bestSellers={formattedData.sort((a, b) => b.sold - a.sold).slice(0, 5)} />
                     }
                  </div>
               </div>
               <div className="flex flex-col border-t-2 border-zinc-300 dark:border-zinc-900">
                  <h1 className="text-lg my-3">Lucros</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                     {isLoading ? <Skeleton h="300px" />
                        : <BestSellerProductsT1Category mostProfitable={mostProfitableChartData} categoryName={formattedSortByCategory[0].category} />
                     }
                     {isLoading ? <Skeleton h="300px" />
                        : <ProfitMonthChart products={productsProfitPerMonth}
                           avgProductsPerMonth={avgProductsPerMonth}
                           avgSoldPerMonth={avgSoldPerMonth} />
                     }
                     {isLoading ? <Skeleton />
                        : <ProfitableMonthChart products={sortedProfitByCategory}
                           avgProductsPerMonth={avgProductsPerMonth}
                           avgSoldPerMonth={avgSoldPerMonth} />
                     }
                     {isLoading ? <Skeleton />
                        : <MediaProfitByCategory products={formattedAverageProfitByCategory} />
                     }
                  </div>
               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
