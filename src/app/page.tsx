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
import { DollarSign } from "lucide-react";
import Products from "./(private)/products/page";

export default function Home() {
   const [formattedData, setFormattedData] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      fetchProducts();
      setTimeout(() => setIsLoading(false), 500);
   }, []);

   async function fetchProducts() {
      try {
         const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

         if (error) throw error;

         console.log("dados puros: ", data);

         const formatted = data.map((p) => ({
            name: p.name,
            price: p.price,
            cost: p.cost,
            quantity: p.quantity,
            sold: p.sold,
            created_at: new Date(p.created_at).toLocaleString("pt-BR", {
               month: "long",
               year: "numeric",
            }),
         }));

         setFormattedData(formatted);
         console.log("formatted: ", formatted)
      } catch (error: any) {
         console.error("Erro ao buscar produtos:", error);
      }
   }

   // Agrupamento por mês
   const productsByMonth = formattedData.reduce((acc, product) => {
      const month = product.created_at;
      if (!acc[month]) acc[month] = [];
      acc[month].push(product);
      return acc;
   }, {} as Record<string, Product[]>);

   const formattedChartData = Object.entries(productsByMonth).map(([month, products]) => ({
      month,
      quantity: products.reduce((acc, p) => acc + p.quantity, 0),
      sold: products.reduce((acc, p) => acc + p.sold, 0),
   }));

   // Dados de totais
   const totalProfit = formattedData.reduce((acc, product) => acc + (product.sold * (product.price - product.cost)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
   const totalInvoicing = formattedData.reduce((acc, product) => acc + (product.sold * product.price), 0);
   const totalCost = formattedData.reduce((acc, product) => acc + product.cost, 0);
   const totalPrice = formattedData.reduce((acc, product) => acc + product.price, 0);
   const totalQuantity = formattedData.reduce((acc, product) => acc + product.quantity, 0);
   const totalSold = formattedData.reduce((acc, product) => acc + product.sold, 0);
   const monthsCount = Object.keys(productsByMonth).length;
   const avgProductsPerMonth = monthsCount > 0 ? totalQuantity / monthsCount : 0;
   const avgSoldPerMonth = monthsCount > 0 ? totalSold / monthsCount : 0;

   return (
      <div>
         <div className="w-full max-w-[1200px] mx-auto p-5">
            <h1 className="mb-5">Dashboard</h1>
            <div className="grid grid-cols-1 min-h-[80vh] gap-10">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                  <div className="flex justify-center items-center flex-col flex-1 text-center h-44 rounded-xl p-2 bg-emerald-100 dark:bg-emerald-950 border border-emerald-600">
                     <p className="flex gap-1 text-lg"><DollarSign /> Faturamento total</p>
                     <p className="text-2xl font-semibold my-3">
                        {totalInvoicing.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </p>
                     <p className="text-sm text-zinc-700 dark:text-zinc-400">Soma do valor de todas as vendas realizadas, sem considerar os custos.</p>
                  </div>
                  <div className="flex justify-center items-center flex-col flex-1 text-center h-44 rounded-xl p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-600">
                     <p className="flex gap-1 text-lg"><DollarSign /> Lucro total</p>
                     <p className="text-2xl font-semibold my-3">{totalProfit}</p>
                     <p className="text-sm text-zinc-700 dark:text-zinc-400">Valor restante após descontar os custos do faturamento total.</p>
                  </div>
                  <div className="flex justify-center items-center flex-col flex-1 text-center h-44 rounded-xl p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-600">
                     <p className="flex gap-1 text-lg"><DollarSign /> Custo total</p>
                     <p className="text-2xl font-semibold my-3">
                        {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </p>
                     <p className="text-sm text-zinc-700 dark:text-zinc-400">Soma dos custos de todos os produtos vendidos.</p>
                  </div>
                  <div className="flex justify-center items-center flex-col flex-1 text-center h-44 rounded-xl p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-600">
                     <p className="flex gap-1 text-lg"><DollarSign /> Preço total</p>
                     <p className="text-center text-2xl font-semibold my-3">
                        {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </p>
                     <p className="text-sm text-zinc-700 dark:text-zinc-400">Soma do preço de venda de todos os produtos comercializados.</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                  {isLoading ? <Skeleton />
                     : <TotalSoldChart totalQuantity={totalQuantity} totalSold={totalSold} />
                  }
                  {isLoading ? <Skeleton h="300px" />
                     : <SoldMonthChart products={formattedChartData}
                        avgProductsPerMonth={avgProductsPerMonth}
                        avgSoldPerMonth={avgSoldPerMonth} />
                  }
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {isLoading ? <Skeleton />
                     : <BestSellersChart bestSellers={formattedData.sort((a, b) => b.sold - a.sold).slice(0, 5)} />
                  }
                  {isLoading ? <Skeleton />
                     : <WorstSellersChart bestSellers={formattedData.sort((a, b) => b.sold + a.sold).slice(0, 5)} />
                  }

               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
