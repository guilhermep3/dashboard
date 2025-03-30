"use client"
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Pen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

const productSchema = z.object({
   name: z.string().trim().min(1, "O nome do produto é obrigatório."),
   price: z.string()
      .trim()
      .min(1, "O preço é obrigatório.")
      .refine(value => !isNaN(parseFloat(value)) && parseFloat(value) > 0, "O preço deve ser um número válido."),
   quantity: z.string()
      .trim()
      .min(1, "A quantidade é obrigatória.")
      .refine(value => !isNaN(parseInt(value)) && parseInt(value) > 0, "A quantidade deve ser um número válido."),
   categoryName: z.string().trim(),
   selectedCategory: z.string().trim(),
}).refine((data) => {
   // Apenas um dos campos pode ser preenchido: categoryName ou selectedCategory
   return !(data.categoryName && data.selectedCategory && data.selectedCategory !== "none");
}, {
   message: "Preencha apenas um dos campos: Criar Categoria ou Selecionar Categoria.",
   path: ["categoryName"],
});

interface Product {
   id: string;
   name: string;
   price: number;
   quantity: number;
   category_id?: any;
}
export default function Products() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [products, setProducts] = useState<Product[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [alertOpen, setAlertOpen] = useState(false);
   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const [modalProduct, setModalProduct] = useState<Product | null>(null);
   const [newProduct, setNewProduct] = useState({
      name: '',
      price: '',
      quantity: '',
      category_id: ''
   });
   const [categoryName, setCategoryName] = useState('');
   const [isError, setIsError] = useState(true);
   const [errorMessage, setErrorMessage] = useState('');

   useEffect(() => {
      checkUser();
      fetchProducts();
      fetchCategories();
   }, [])

   async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         router.push('/');
      }
   };

   // async function handleCheckForm() {
   //    console.log("------------");
   //    console.log("categoryName: ", categoryName);
   //    console.log("selectedCategory: ", selectedCategory);
   //    if (selectedCategory && selectedCategory !== 'none' && categoryName !== '') {
   //       setErrorMessage("Somente um campo de categoria deve estar preenchido.")
   //       console.log("os dois estão preenchidos, ERRO")
   //    } else if ((!selectedCategory || selectedCategory === 'none') && categoryName === '') {
   //       setErrorMessage("Preencha um dos campos de categoria.")
   //       console.log("os dois estão vazios, ERRO")
   //    } else {
   //       console.log('certo, OK')
   //    }
   //    console.log("------------");
   // }

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

      const { data: userData, error: errorGetUser } = await supabase.auth.getUser();
      if (!userData.user) {
         return console.error("Usuário não autenticado!", errorGetUser);
      }

      try {
         // valida os campos
         const validatedData = productSchema.parse({
            name: newProduct.name,
            price: newProduct.price,
            quantity: newProduct.quantity,
            categoryName: categoryName,
            selectedCategory: selectedCategory,
         });

         console.log("Dados válidos: ", validatedData);

         // Verifica se a categoria já existe
         const alreadyHaveCategory = categories.some(
            (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
         );
         if (alreadyHaveCategory) {
            return setAlertOpen(true);
         }

         const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .insert({ name: categoryName, user_id: userData.user.id })
            .select("id")
            .single();

         if (categoryError) {
            return console.error("Erro ao criar categoria: ", categoryError);
         }

         // Adiciona o produto
         const { data, error } = await supabase.from("products").insert({
            name: validatedData.name,
            price: parseFloat(validatedData.price),
            quantity: parseInt(validatedData.quantity),
            category_id: categoryData.id,
            user_id: userData.user.id,
         });

         if (error) {
            return console.error("Erro ao adicionar produto:", error);
         }

         // Reseta os campos
         setNewProduct({ name: "", price: "", quantity: "", category_id: categoryData.id });
         fetchProducts();
      } catch (error: any) {
         if (error instanceof z.ZodError) {
            setErrorMessage(error.errors[0].message);
            setIsError(true);
            console.error("Erro de validação: ", error.errors);
         }
      }
   }

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

         if (error) console.log("erro: ", error);
         setIsOpen(false);
         fetchProducts();
      } catch (error) {
         console.log('Erro ao atualizar o produto: ', error)
      }
   };

   async function fetchCategories() {
      const { data, error } = await supabase
         .from('categories')
         .select('id, name')
         .eq('user_id', (await supabase.auth.getUser())?.data.user?.id);

      if (error) {
         console.error('Erro ao buscar categorias:', error);
      } else {
         setCategories(data);
      }
   };

   function handleOpenModal(product: Product) {
      setModalProduct(product);
      setIsOpen(true);
      console.log(categories)
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
                        onChange={(e) => {
                           setNewProduct({ ...newProduct, name: e.target.value }),
                              setIsError(false),
                              setErrorMessage('')
                        }}
                        required
                     />
                     <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço"
                        value={newProduct.price}
                        onChange={(e) => {
                           setNewProduct({ ...newProduct, price: e.target.value }),
                              setIsError(false),
                              setErrorMessage('')
                        }}
                        required
                     />
                     <Input
                        type="number"
                        placeholder="Quantidade"
                        value={newProduct.quantity}
                        onChange={(e) => {
                           setNewProduct({ ...newProduct, quantity: e.target.value }),
                              setIsError(false),
                              setErrorMessage('')
                        }}
                        required
                     />
                     <Input
                        type="text"
                        placeholder="Criar Categoria ( roupa, tecnologia... )"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                     />
                     <Select onValueChange={(value) => {
                        setSelectedCategory(value),
                           setIsError(false)
                     }}>
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectGroup>
                              <SelectLabel>Categorias</SelectLabel>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {categories.map((c) => (
                                 <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                              ))}
                           </SelectGroup>
                        </SelectContent>
                     </Select>
                     <Button type="submit" className="w-full">
                        Adicionar Produto
                     </Button>
                     {isError &&
                        <p className="text-red-600 text-center text-sm">{errorMessage}</p>
                     }
                  </form>
               </CardContent>
            </Card>
            <Table className="bg-white dark:bg-zinc-900 rounded-lg">
               <TableHeader>
                  <TableRow>
                     <TableHead className="p-3">Nome</TableHead>
                     <TableHead>Categoria</TableHead>
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
                           <TableCell>
                              {categories.find((c) => c.id === product.category_id)?.name || "Sem categoria"}
                           </TableCell>

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
         <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle className="text-center">Já possui uma categoria com o mesmo nome</DialogTitle>
                  <DialogDescription className="text-center">Tente outro nome ou selecione o já criado</DialogDescription>
               </DialogHeader>
               <DialogClose className="bg-red-600 px-3 py-1 rounded-md text-white cursor-pointer w-fit mx-auto mt-3">
                  Confirmar
               </DialogClose>
            </DialogContent>
         </Dialog>
      </div >
   )
}