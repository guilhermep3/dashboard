"use client"
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Pen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Product {
   id: string;
   name: string;
   price: number;
   quantity: number;
}

export default function Products() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [products, setProducts] = useState<Product[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [modalProduct, setModalProduct] = useState<Product | null>(null);

   const [newProduct, setNewProduct] = useState({
      name: '',
      price: '',
      quantity: '',
   });

   useEffect(() => {
      checkUser();
      fetchProducts();
   }, [])

   async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         router.push('/');
      }
   };

   async function fetchProducts() {
      try {
         const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

         if (error) throw error;
         console.log("data: ", data)
         setProducts(data || []);
      } catch (error: any) {
         console.log(error)
      } finally {
         setIsLoading(false);
      }
   };

   async function handleAddProduct(e: React.FormEvent) {
      e.preventDefault();
      const { data: userData } = await supabase.auth.getUser();
      try {
         const { data, error } = await supabase.from('products').insert({
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity),
            category_id: '217c8250-9956-4820-b67f-f2dbca706cd8',
            user_id: userData.user?.id
         });
         console.log("userData.user?.id: ", userData.user?.id)

         if (error) return console.log('if error: ', error)

         setNewProduct({ name: '', price: '', quantity: '' });
         fetchProducts();
      } catch (error: any) {
         console.log("erro ao adicionar: ", error)
      }
   };

   async function handleDeleteProduct(id: string) {
      try {
         const { data, error } = await supabase.from("products").delete().eq('id', id);
         await console.log(data)
         if (error) throw error;

         setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
         console.log("Erro ao excluir produto: ", error)
      }
   };

   async function handleUpdateProduct() {
      console.log("modalProduct", modalProduct)
      try {
         const { data, error } = await supabase.from("products").update({
            name: modalProduct?.name,
            price: modalProduct?.price,
            quantity: modalProduct?.quantity
         }).eq("id", modalProduct?.id)

         if (error) console.log("erro: ",error);
         setIsOpen(false);
         fetchProducts();
      } catch (error) {
         console.log('Erro ao atualizar o produto: ',error)
      }
   };

   function handleOpenModal(product: Product) {
      setModalProduct(product);
      setIsOpen(true);
   };


   return (
      <div className="p-5 w-full max-w-[1200px] mx-auto">
         <h1 className="mb-5">Seus Produtos</h1>
         <div className="grid gap-5 grid-cols-1">
            <Card className="w-full max-w-96">
               <CardHeader>
                  <CardTitle className="text-lg">Adicionar Produto</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                     <Input
                        placeholder="Nome do produto"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                     />
                     <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                     />
                     <Input
                        type="number"
                        placeholder="Quantidade"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        required
                     />
                     <Button type="submit" className="w-full">
                        Adicionar Produto
                     </Button>
                  </form>
               </CardContent>
            </Card>
            <Table className="bg-white dark:bg-zinc-900 rounded-lg">
               <TableHeader>
                  <TableRow>
                     <TableHead className="p-3">Nome</TableHead>
                     <TableHead>Preço</TableHead>
                     <TableHead>Quantidade</TableHead>
                     <TableHead>Ações</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={4}>Carregando...</TableCell>
                     </TableRow>
                  ) : (
                     products.map((product) => (
                        <TableRow key={product.id}>
                           <TableCell className="p-3">{product.name}</TableCell>
                           <TableCell>R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell>{product.quantity.toLocaleString('pt-BR')}</TableCell>
                           <TableCell className="flex">
                              <Trash2 fill="transparent" stroke="#fff" size={28}
                                 className="mr-2 bg-red-600 p-1 cursor-pointer rounded-md"
                                 onClick={() => handleDeleteProduct(product.id)} />
                              <Pen fill="transparent" stroke="#fff" size={28}
                                 className="bg-emerald-600 p-1 cursor-pointer rounded-md"
                                 onClick={() => handleOpenModal(product)} />
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle className="text-center">Edite o produto</DialogTitle>
               </DialogHeader>
               <form className="flex flex-col gap-3">
                  <div>
                     <Label htmlFor="modalName" className="mb-1 text-base">Nome</Label>
                     <Input id="modalName"
                        type="text"
                        placeholder="Nome do produto"
                        value={modalProduct?.name}
                        onChange={(e) => setModalProduct({ ...modalProduct!, name: e.target.value })}
                        required
                     />
                  </div>
                  <div>
                     <Label htmlFor="modalPrice" className="mb-1 text-base">Preço</Label>
                     <Input id="modalPrice"
                        type="number"
                        placeholder="Preço do produto"
                        value={modalProduct?.price}
                        onChange={(e) => setModalProduct({ ...modalProduct!, price: Number(e.target.value) })}
                        required
                     />
                  </div>
                  <div>
                     <Label htmlFor="modalQuantity" className="mb-1 text-base">Quantidade</Label>
                     <Input id="modalQuantity"
                        type="number"
                        placeholder="Nome do produto"
                        value={modalProduct?.quantity}
                        onChange={(e) => setModalProduct({ ...modalProduct!, quantity: Number(e.target.value) })}
                        required
                     />
                  </div>
               </form>
               <div className="flex justify-center gap-3">
                  <Button onClick={handleUpdateProduct}>Confirmar</Button>
                  <DialogClose className="bg-red-600 px-3 py-1 rounded-md text-white cursor-pointer">
                     Cancelar
                  </DialogClose>
               </div>
            </DialogContent>
         </Dialog>
      </div >
   )
}