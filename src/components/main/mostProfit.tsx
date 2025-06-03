import { Product } from "@/types/product"
import { BestSellerProductsT1Category } from "../charts/bestSellerProductsT1Category"
import { MediaProfitByCategory } from "../charts/mediaPorfitByCategory"
import { ProfitableMonthChart } from "../charts/profitableMonthChart"
import { ProfitMonthChart } from "../charts/profitMonthChart"
import { Skeleton } from "../skeleton"

type props = {
   isLoading: boolean;
   formattedData: Product[];
   formattedSortByCategory: {
      category: string;
      totalSold: number;
      totalQuantity: number;
      category_id: any;
   }[];
   productsByMonth: Record<string, Product[]>;
   avgProductsPerMonth: number;
   avgSoldPerMonth: number;
}

export const MostProfit = (
   {
      isLoading, formattedData,
      formattedSortByCategory, productsByMonth,
      avgProductsPerMonth, avgSoldPerMonth
   }: props) => {

   const mostProfitableChartData = formattedData
      .map(product => ({
         name: product.name,
         profit: (product.price - product.cost),
         fill: "var(--primary-color)"
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6);

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

   const productsProfitPerMonth = Object.entries(productsByMonth).map(([month, product]) => ({
      month,
      profit: product.reduce((acc, p) => acc + (p.price - p.cost), 0)
   }));

   const sortedProfitByCategory = Object.values(profitByCategory).sort((a, b) => b.profit - a.profit);

   const averageProfitByCategory = formattedData.reduce((acc, product) => {
      if (!acc[product.category_id]) {
         acc[product.category_id] = {
            category: product.category,
            profit: 0,
            count: 0
         }
         acc[product.category_id].profit += (product.price - product.cost);
         acc[product.category_id].count += 1;
      }
      return acc;
   }, {} as Record<string, { category: string, profit: number, count: number }>);

   const formattedAverageProfitByCategory = Object.values(averageProfitByCategory)
      .map(({ category, count, profit }) => ({
         category,
         averageProfit: profit / count
      })).sort((a, b) => b.averageProfit - a.averageProfit);

   return (
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
   )
}