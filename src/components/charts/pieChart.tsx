"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

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

type props = {
   totalQuantity: number;
   totalSold: number;
}
export function PieChartComponent({ totalQuantity, totalSold }: props) {

   const chartData = [
      { name: "Quantidade Total", total: totalQuantity, fill: "var(--secondary-color)" },
      { name: "Vendas Totais", total: totalSold, fill: "var(--primary-color)" },
   ]

   const chartConfig = {
      totalQuantity: {
         label: "Quantidade Total",
         color: "var(--chart-1)",
      },
      totalSold: {
         label: "Vendas Totais",
         color: "var(--chart-2)",
      },
   } satisfies ChartConfig

   return (
      <Card className="flex flex-col shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
         <CardHeader className="items-center pb-0">
            <CardTitle className="text-base sm:text-lg">Vendas totais dos produtos</CardTitle>
            <CardDescription>Soma de todos os produtos</CardDescription>
         </CardHeader>
         <CardContent className="flex-1 pb-0">
            <ChartContainer
               config={chartConfig}
               className="mx-auto aspect-square max-h-[250px]"
            >
               <PieChart>
                  <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                     data={chartData}
                     dataKey="total"
                     nameKey="name"
                     innerRadius={60}
                     strokeWidth={5}
                  >
                     <Label
                        content={({ viewBox }) => {
                           if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                 <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                 >
                                    <tspan
                                       x={viewBox.cx}
                                       y={viewBox.cy}
                                       className="fill-foreground text-3xl font-bold"
                                    >
                                       {totalSold.toLocaleString()}
                                    </tspan>
                                    <tspan
                                       x={viewBox.cx}
                                       y={(viewBox.cy || 0) + 24}
                                       className="fill-muted-foreground"
                                    >
                                       Vendas
                                    </tspan>
                                 </text>
                              )
                           }
                        }}
                     />
                  </Pie>
               </PieChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col gap-2 text-sm text-center">
            <div className="flex items-center gap-2 font-medium leading-none">
               {(totalSold / totalQuantity * 100).toFixed(2)}% dos produtos foram vendidos
            </div>
            <div className="leading-none text-muted-foreground">
               Quantidade em Estoque: {totalQuantity.toLocaleString()}
            </div>
            <div className="leading-none text-muted-foreground">
               Total Vendido: {totalSold.toLocaleString()}
            </div>
         </CardFooter>

      </Card>
   )
}
