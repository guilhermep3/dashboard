"use client";

import { useEffect, useState } from "react";
import { AreaChartComponent } from "@/components/charts/areaChart";
import { BarChartComponent } from "@/components/charts/barChart";
import { PieChartComponent } from "@/components/charts/pieChart";
import { Loading } from "@/components/loading";
import { Skeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Footer } from "@/components/footer";
import { BarChartVComponent } from "@/components/charts/barChartV";
import { BarChartVLess } from "@/components/charts/barChartVLess";

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
            quantity: p.quantity,
            sold: p.sold,
            created_at: new Date(p.created_at).toLocaleString("pt-BR", {
               month: "long",
               year: "numeric",
            }),
         }));

         setFormattedData(formatted);
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
                  {isLoading ? <Skeleton />
                     : <PieChartComponent totalQuantity={totalQuantity} totalSold={totalSold} />
                  }
                  {isLoading ? <Skeleton h="300px" />
                     : <BarChartComponent products={formattedChartData}
                        avgProductsPerMonth={avgProductsPerMonth}
                        avgSoldPerMonth={avgSoldPerMonth} />
                  }
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {isLoading ? <Skeleton />
                     : <BarChartVComponent bestSellers={formattedData.sort((a, b) => b.sold - a.sold).slice(0, 5)} />
                  }
                  {isLoading ? <Skeleton />
                     : <BarChartVLess bestSellers={formattedData.sort((a, b) => b.sold + a.sold).slice(0, 5)} />
                  }

               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
