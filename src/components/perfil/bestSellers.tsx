import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { Product } from "@/types/product";

type props = {
   products: Partial<Product[]>
}
export const BestSellers = ({products}: props) => {

   return (
      <Card className="w-full min-w-56 max-w-96">
         <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Os cinco mais vendidos</CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col h-full">
            <ul className="mb-5">
               {products.length > 0
                  ? products.slice(0, 5).map((p) => (
                     <li className="mb-2 flex justify-between gap-3"><p>{p?.name}</p> <span>{p?.sold} vendas</span></li>
                  ))
                  : <p>Adicione produtos</p>}
            </ul>
            <Button className=" w-full mt-auto">
               <Link href={'/products'}>{products.length > 0 ? 'Ver todos' : 'Criar produto'}</Link>
            </Button>
         </CardContent>
      </Card>
   )
}