"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

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
   { month: "April", desktop: 73 },
   { month: "May", desktop: 209 },
   { month: "June", desktop: 214 },
]

const chartConfig = {
   desktop: {
      label: "averageProfit",
      color: "var(--primary-color)",
   },
} satisfies ChartConfig

type props = {
   products: any;
}
export function MediaProfitByCategory({products}: props) {

   return (
      <Card>
         <CardHeader>
            <CardTitle>Média de lucro dos produtos por categoria</CardTitle>
            <CardDescription>Média de todos os produtos</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig}>
               <BarChart
                  accessibilityLayer
                  data={products}
                  layout="vertical"
                  margin={{
                     left: -20,
                  }}
               >
                  <XAxis type="number" dataKey="averageProfit" hide />
                  <YAxis
                     dataKey="category"
                     type="category"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="averageProfit" fill="var(--secondary-color)" radius={5} />
               </BarChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm text-center">
            <div className="flex gap-2 font-medium leading-none">
               {products[0].category} lucra {products[0].averageProfit.toLocaleString('pt-BR', {style: "currency", currency: "BRL"})+" "}
               a cada venda de produto em média
            </div>
            <div className="leading-none text-muted-foreground">
               as categorias que mais lucram por unidade vendida
            </div>
         </CardFooter>
      </Card>
   )
}