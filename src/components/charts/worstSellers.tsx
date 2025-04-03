"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import {
   ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart"
import { Product } from "@/types/product"
import Products from "@/app/(private)/products/page"

const chartConfig = {
   desktop: {
      label: "Desktop",
      color: "var(--primary-color)",
   },
   mobile: {
      label: "Mobile",
      color: "var(--chart-2)",
   },
   label: {
      color: "var(--background)",
   },
} satisfies ChartConfig

type props = {
   bestSellers: any;
}
export function WorstSellersChart({bestSellers}: props) {

   return (
      <Card className="col-span-1 md:col-span-2 flex flex-col shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
         <CardHeader>
            <CardTitle>5 Produtos MENOS vendidos</CardTitle>
            <CardDescription>Numeros totais</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig}>
               <BarChart
                  accessibilityLayer
                  data={bestSellers}
                  layout="vertical"
                  margin={{
                     right: 16,
                  }}
               >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                     dataKey="name"
                     type="category"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     tickFormatter={(value) => value.slice(0, 3)}
                     hide
                  />
                  <XAxis dataKey="sold" type="number" hide />
                  <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                     dataKey="sold"
                     layout="vertical"
                     fill="var(--primary-color)"
                     radius={4}
                  >
                     <LabelList
                        dataKey="name"
                        position="insideLeft"
                        offset={8}
                        className="fill-white"
                        fontSize={12}
                     />
                     <LabelList
                        dataKey="sold"
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                     />
                  </Bar>
               </BarChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
               {bestSellers[0].name ?? 'sem nome'} vendeu {(bestSellers[0].sold / bestSellers[0].quantity * 100).toFixed(2)}% da quantia em estoque <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
               {bestSellers[1].name} vendeu {(bestSellers[1].sold / bestSellers[1].quantity * 100).toFixed(2)}% da quantia em estoque
            </div>
         </CardFooter>
      </Card>
   )
}
