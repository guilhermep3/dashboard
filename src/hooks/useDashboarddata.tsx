import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export function useDashboardData() {
   const [data, setData] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function fetchData() {
         const { data: productsData, error: productError } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

         if (productError) {
            console.error("Erro ao buscar produtos:", productError);
            setLoading(false);
            return;
         }

         const { data: categoriesData, error: categoryError } = await supabase
            .from("categories")
            .select("*");

         if (categoryError) {
            console.error("Erro ao buscar categorias:", categoryError);
            setLoading(false);
            return;
         }

         const formatted = productsData.map((p) => ({
            ...p,
            category: categoriesData.find((c) => c.id === p.category_id)?.name,
            created_at: new Date(p.created_at).toLocaleString("pt-BR", {
               month: "long",
               year: "numeric",
            }),
         }));

         setData(formatted);
         setLoading(false);
      }

      fetchData();
   }, []);

   return { data, loading };
}
