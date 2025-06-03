"use client"
import { Product } from "@/types/product"
import { BestSellersChart } from "../charts/bestSellersChart"
import { ProfitCategoryChart } from "../charts/profitCategoryCharts"
import { SoldMonthChart } from "../charts/soldMonthChart"
import { TotalSoldChart } from "../charts/totalSoldChart"
import { Skeleton } from "../skeleton"

type props = {
   formattedData: Product[];
   isLoading: boolean;
   productsByMonth: Record<string, Product[]>;
   totalQuantity: number;
   totalSold: number;
   avgProductsPerMonth: number;
   avgSoldPerMonth: number;
   formattedSortByCategory: {
      category: string;
      totalSold: number;
      totalQuantity: number;
      category_id: any;
   }[];
}
export const BestSellers = (
   {
      formattedData, isLoading, productsByMonth, totalQuantity, totalSold,
      avgProductsPerMonth, avgSoldPerMonth, formattedSortByCategory
   }: props) => {

   const productsSoldPerMonth = Object.entries(productsByMonth).map(([month, products]) => ({
      month,
      quantity: products.reduce((acc, p) => acc + p.quantity, 0),
      sold: products.reduce((acc, p) => acc + p.sold, 0),
   }));

   return (
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
   )
}