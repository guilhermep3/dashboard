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

type props = {
  products: any;
  avgProductsPerMonth: any;
  avgSoldPerMonth: any;
}
export function BarChartComponent({ products, avgProductsPerMonth, avgSoldPerMonth }: props) {


  const chartConfig = {
    quantity: {
      label: "Quantidade",
      color: "var(--secondary-color)",
    },
    sold: {
      label: "Vendidos",
      color: "var(--primary-color)",
    },
  } satisfies ChartConfig


  return (
    <Card className="flex flex-col shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Vendas por mês</CardTitle>
        <CardDescription>Total de quantidade e vendas por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={products}>
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="quantity" fill="var(--secondary-color)" radius={4} />
            <Bar dataKey="sold" fill="var(--primary-color)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Média de vendas por mês {avgSoldPerMonth}
        </div>
        <div className="leading-none text-muted-foreground">
          Média de quantidade por mês {avgProductsPerMonth}
        </div>
      </CardFooter>
    </Card>
  )
}
