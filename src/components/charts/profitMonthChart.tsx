"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type props = {
  products: any;
  avgProductsPerMonth: any;
  avgSoldPerMonth: any;
}
export function ProfitMonthChart({ products, avgProductsPerMonth, avgSoldPerMonth }: props) {
  const totalProfit = products.reduce((acc: any, product: { profit: any }) => acc + product.profit, 0)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lucros por mês</CardTitle>
        <CardDescription>Total de lucro por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={products}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="profit" fill="var(--primary-color)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none mx-auto text-center">
          {((products[0].profit / totalProfit) * 100).toFixed(2)}% dos lucros são de {products[0].month}
        </div>
        <div className="leading-none text-muted-foreground mx-auto">
          Média de lucro por mês {totalProfit / products.length}
        </div>
      </CardFooter>
    </Card>
  )
}
