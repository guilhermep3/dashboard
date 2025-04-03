"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
const chartData = [
   { month: "January", desktop: 186 },
   { month: "February", desktop: 305 },
   { month: "March", desktop: 237 },
]

const chartConfig = {
   desktop: {
      label: "category",
      color: "var(--chart-1)",
   },
} satisfies ChartConfig

export function ProfitCategoryChart({ formattedSortByCategory }: any) {

   return (
      <Card className="flex flex-col shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
         <CardHeader>
            <CardTitle>Categorias mais vendidas</CardTitle>
            <CardDescription>top 5 mais vendidas</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig}>
               <BarChart accessibilityLayer data={formattedSortByCategory}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                     dataKey="category"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     tickFormatter={(value) => value.slice(0, 12)}
                  />
                  <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="totalSold" fill="var(--primary-color)" radius={8} />
               </BarChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
               {(formattedSortByCategory[0].totalSold / formattedSortByCategory[0].totalQuantity * 100).toFixed(2)}%
               do estoque de {formattedSortByCategory[0].category} vendido <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
               {(formattedSortByCategory[1].totalSold / formattedSortByCategory[1].totalQuantity * 100).toFixed(2)}%
               do estoque de {formattedSortByCategory[1].category} vendido
            </div>
         </CardFooter>
      </Card>
   )
}
