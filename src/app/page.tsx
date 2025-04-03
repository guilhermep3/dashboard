"use client";

import { useEffect, useState } from "react";
import { AreaChartComponent } from "@/components/charts/areaChart";
import { BarChartComponent } from "@/components/charts/barChart";
import { PieChartComponent } from "@/components/charts/pieChart";
import { Loading } from "@/components/loading";
import { Skeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export default function Home() {
   const [productsData, setProductsData] = useState<Product[]>([]);
   const [products, setProducts] = useState<Partial<Product[]>>([]);
   const [productsByMonth, setProductsByMonth] = useState<Record<string, any[]>>({});
   const [chartData, setChartData] = useState<any[]>([]);
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
         setProductsData(data || []);

         const formattedData = data?.map((p) => ({
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            sold: p.sold,
            created_at: new Date(p.created_at).toLocaleString("pt-BR", {
               month: "long",
               year: "numeric",
            }),
         })) || [];

         const groupedData = groupByMonth(formattedData);
         setProductsByMonth(groupedData);
         setChartData(formatChartData(groupedData));
         setProducts(formattedData);
         console.log("formatChartData(groupedData): ", formatChartData(groupedData))
      } catch (error: any) {
         console.error("Erro ao buscar produtos:", error);
      }
   }

   function groupByMonth(products: any[]) {
      return products.reduce((acc, product) => {
         const month = product.created_at;
         if (!acc[month]) acc[month] = [];
         acc[month].push(product);
         return acc;
      }, {} as Record<string, any[]>);
   }

   function formatChartData(productsByMonth: Record<string, any[]>) {
      return Object.entries(productsByMonth).map(([month, products]) => ({
         month,
         quantity: products.reduce((acc, p) => acc + p.quantity, 0),
         sold: products.reduce((acc, p) => acc + p.sold, 0),
      }));
   }

   const totalQuantity = productsData.reduce((acc, product) => acc + product.quantity, 0);
   const totalSold = productsData.reduce((acc, product) => acc + product.sold, 0);

   const monthsCount = Object.keys(chartData).length;
   const avgProductsPerMonth = monthsCount > 0 ? totalQuantity / monthsCount : 0;
   const avgSoldPerMonth = monthsCount > 0 ? totalSold / monthsCount : 0;

   return (
      <div className="p-5 w-full max-w-[1200px] mx-auto">
         <h1 className="mb-5">Dashboard</h1>
         <div className="grid grid-cols-1">
            <div className="grid items-start grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
               {isLoading ? <Skeleton /> : <PieChartComponent totalQuantity={totalQuantity} totalSold={totalSold} />}
               {isLoading ? <Skeleton h="300px" /> 
                  : <BarChartComponent products={chartData} avgProductsPerMonth={avgProductsPerMonth} avgSoldPerMonth={avgSoldPerMonth} />
               }
            </div>
         </div>
      </div>
   );
}