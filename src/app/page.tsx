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
import { Card } from "@/components/ui/card";
import { DashboardCard } from "@/components/charts/dashboardCard";
import { ProfitCategoryChart } from "@/components/charts/profitCategoryCharts";

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

         async function fetchCategories() {
            const { data, error } = await supabase.from("categories").select("*");
            if (error) throw error;
            return data;
         }
         const categories = await fetchCategories()
         console.log("categories: ", categories)

         const formatted = data.map((p) => ({
            name: p.name,
            price: p.price,
            cost: p.cost,
            quantity: p.quantity,
            sold: p.sold,
            category: categories.find((c) => c.id === p.category_id)?.name,
            created_at: new Date(p.created_at).toLocaleString("pt-BR", {
               month: "long",
               year: "numeric",
            }),
            category_id: p.category_id
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

   const soldByCategory = formattedData.reduce((acc, product) => {
      // Verifica se a categoria já existe no acumulador (acc)
      if (!acc[product.category_id]) {
         // Se não existir, inicializa a categoria no acumulador com `totalSold` zerado
         acc[product.category_id] = {
            category: product.category,
            totalSold: 0,
            totalQuantity: 0
         };
      }
      // Adiciona a quantidade vendida do produto ao total da categoria correspondente
      acc[product.category_id].totalSold += product.sold;
      acc[product.category_id].totalQuantity += product.quantity;

      // Retorna o acumulador atualizado para a próxima iteração
      return acc;
   }, {} as Record<string, { category: string; totalSold: number, totalQuantity: number }>);

   // Convertendo o objeto para um array para facilitar a exibição
   const formattedSortByCategory = Object.values(soldByCategory).sort((a, b) => b.totalSold - a.totalSold);

   console.log("Categorias mais vendidas:", formattedSortByCategory);


   return (
      <div>
         <div className="w-full max-w-[1200px] mx-auto p-5">
            <h1 className="mb-5">Dashboard</h1>
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
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                  {isLoading ? <Skeleton />
                     : <TotalSoldChart totalQuantity={totalQuantity} totalSold={totalSold} />
                  }
                  {isLoading ? <Skeleton h="300px" />
                     : <SoldMonthChart products={formattedChartData}
                        avgProductsPerMonth={avgProductsPerMonth}
                        avgSoldPerMonth={avgSoldPerMonth} />
                  }
                  {isLoading ? <Skeleton h="300px" />
                     : <ProfitCategoryChart formattedSortByCategory={formattedSortByCategory} />
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
