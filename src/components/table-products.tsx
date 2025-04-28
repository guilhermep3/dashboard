"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { ChevronDown, ChevronUp, Pen, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type props = {
   categories: {id: string; name: string}[];
   products: Product[];
   handleUpdateProduct: () => void;
   handleEditProduct: (product: Product) => void;
   handleModalDeleteProduct: (product: Product) => void;
}
export const TableProducts = ({categories, products, handleUpdateProduct, handleEditProduct, handleModalDeleteProduct}: props) => {
   const [isLoading, setIsLoading] = useState(true);
   const [sortColumn, setSortColumn] = useState<keyof Product | null>(null);
   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

   useEffect(() => {
      setIsLoading(false);
   }, []);

   const handleSort = (column: keyof Product) => {
      if (sortColumn === column) {
         setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
         setSortColumn(column);
         setSortDirection("asc");
      }
   };

   const sortedProducts = [...products].sort((a, b) => {
      if (!sortColumn) return 0;
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      // se for string, ordene alfabéticamente
      if (typeof valueA === "string" && typeof valueB === "string") {
         return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      // se for numero, ordene numericamente
      if (typeof valueA === "number" && typeof valueB === "number") {
         return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return 0;
   });

   

   return (
      <Table className="bg-white dark:bg-zinc-900 rounded-lg">
         <TableHeader>
            <TableRow>
               <TableHead className="p-3 cursor-pointer" onClick={() => handleSort("name")}>
                  <p className="flex gap-1">Nome {sortColumn === "name" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead className="cursor-pointer" onClick={() => handleSort("category_id")}>
                  <p className="flex gap-1">Categoria  {sortColumn === "category_id" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                  <p className="flex gap-1">Preço  {sortColumn === "price" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead className="cursor-pointer" onClick={() => handleSort("cost")}>
                  <p className="flex gap-1">Custo  {sortColumn === "cost" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                  <p className="flex gap-1">Quantidade  {sortColumn === "quantity" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead className="cursor-pointer" onClick={() => (handleSort("sold"), handleUpdateProduct)}>
                  <p className="flex gap-1">Vendidos  {sortColumn === "sold" ? (sortDirection === "asc" ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : ""}</p>
               </TableHead>
               <TableHead>Ações</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={4}>Carregando...</TableCell>
               </TableRow>
            ) : (
               sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                     <TableCell className="p-3">{product.name}</TableCell>
                     <TableCell>
                        {categories.find((c) => c.id === product.category_id)?.name || "Sem categoria"}
                     </TableCell>
                     <TableCell>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                     <TableCell>R$ {product?.cost?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || '0'}</TableCell>
                     <TableCell>{product.quantity.toLocaleString("pt-BR")}</TableCell>
                     <TableCell>{product.sold}</TableCell>
                     <TableCell className="flex">
                        <Trash2 fill="transparent" stroke="#fff" size={28}
                           className="mr-2 bg-red-600 p-1 cursor-pointer rounded-md"
                           onClick={() => handleModalDeleteProduct(product)}
                        />
                        <Pen fill="transparent" stroke="#fff" size={28}
                           className="bg-emerald-600 p-1 cursor-pointer rounded-md"
                           onClick={() => handleEditProduct(product)}
                        />
                     </TableCell>
                  </TableRow>
               ))
            )}
         </TableBody>
      </Table>
   )
}