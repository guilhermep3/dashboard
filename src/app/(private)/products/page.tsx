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
   categoryName: z.string().optional(),
   selectedCategory: z.string().optional(),
}).refine((data) => {
   const isCreatingCategory = data.categoryName && data.categoryName.trim() !== "";
   const isSelectingCategory = data.selectedCategory && data.selectedCategory.trim() !== "" && data.selectedCategory !== "none";
   return !(isCreatingCategory && isSelectingCategory) && (isCreatingCategory || isSelectingCategory);
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
   const [modalProduct, setModalProduct] = useState<Product | null>(null);
   const [newProduct, setNewProduct] = useState({
      name: '',
      price: '',
      quantity: '',
      category_id: ''
   });
   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const [categoryName, setCategoryName] = useState('');
   const [isError, setIsError] = useState(true);
   const [errorMessage, setErrorMessage] = useState('');
   const [modalTitle, setModalTitle] = useState('');
   const [modalDescription, setModalDescription] = useState('');
   const [modalData, setModalData] = useState<any>(null);

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

   async function fetchProducts() {
      try {
         const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

         if (error) throw error;
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
      console.log("categoryName: ", categoryName.trim())
      console.log("selectedCategory: ", selectedCategory)

      const isCreatingCategory = categoryName.trim() !== '';
      const isSelectingCategory = selectedCategory !== '' && selectedCategory !== 'none';

      console.log("isCreatingCategory: ", isCreatingCategory)
      console.log("isSelectingCategory: ", isSelectingCategory)

      if (!isCreatingCategory && !isSelectingCategory) {
         setErrorMessage("Preencha um dos campos de categoria.");
         setIsError(true);
         return;
      } else if (isCreatingCategory && isSelectingCategory) {
         setErrorMessage("Preencha apenas um campo de categoria.");
         setIsError(true);
         return;
      }

      try {
         let categoryId: string | null = null;
         if (isCreatingCategory) {
            const validatedData = productSchema.parse({
               name: newProduct.name,
               price: newProduct.price,
               quantity: newProduct.quantity,
               categoryName: categoryName
            })

            const alreadyHaveCategory = categories.some(
               (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
            );
            if (alreadyHaveCategory) {
               setErrorMessage("Essa categoria já existe!");
               setIsError(true);
               return;
            }
            console.log("categoryName: ", categoryName)
            const { data: categoryData, error: categoryError } = await supabase
               .from("categories")
               .insert({ name: categoryName, user_id: userData.user.id })
               .select("id")
               .single();

            if (categoryError) {
               return console.error("Erro ao criar categoria: ", categoryError);
            }

            categoryId = categoryData.id;

            // Adiciona o produto
            const { error } = await supabase.from("products").insert({
               name: validatedData.name,
               price: parseFloat(validatedData.price),
               quantity: parseInt(validatedData.quantity),
               category_id: categoryId,
               user_id: userData.user.id,
            });

            fetchCategories();

            if (error) {
               return console.error("Erro ao adicionar produto:", error);
            }
         }
         if (isSelectingCategory) {
            const validatedData = productSchema.parse({
               name: newProduct.name,
               price: newProduct.price,
               quantity: newProduct.quantity,
               selectedCategory: selectedCategory
            });
            console.log("validatedData: ", validatedData)
            console.log("selectedCategory: ", selectedCategory)

            const selectedCat = categories.find((c) => c.name === selectedCategory);
            if (!selectedCat) {
               setErrorMessage("Categoria selecionada inválida.");
               setIsError(true);
               return;
            }
            categoryId = selectedCat.id;
            if (!categoryId) {
               setErrorMessage("Erro ao definir categoria.");
               setIsError(true);
               return;
            }

            // Adiciona o produto
            const { error } = await supabase.from("products").insert({
               name: validatedData.name,
               price: parseFloat(validatedData.price),
               quantity: parseInt(validatedData.quantity),
               category_id: categoryId,
               user_id: userData.user.id,
            });
            if (error) {
               return console.error("Erro ao adicionar produto:", error);
            }
         }
         setNewProduct({ name: "", price: "", quantity: "", category_id: "" });
         setCategoryName("");
         setSelectedCategory("none");
         fetchProducts();
         setSelectedCategory("none");
         setIsError(false);
      } catch (error: any) {
         const firstError = error.errors[0];
         setErrorMessage(firstError.message);
         setIsError(true);
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

   function openModal(title: string, description: string, data?: any) {
      setModalTitle(title);
      setModalDescription(description);
      setModalData(data);
      setIsOpen(true);
   }

   function handleOpenModal(product: Product) {
      setModalProduct(product);
      setIsOpen(true);
      console.log(categories)
   };
   function handleModalDeleteProduct(product: Product) {
      openModal(
         `Deletar ${product.name}?`,
         "Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.",
         product
      );
   }

   function handleModalCategory(category: any) {
      setIsOpen(true);
      setModalTitle(`Você quer deletar a categoria ${category.name}?`);
   };

   const categoryCounts = products.reduce((acc, product) => {
      acc[product.category_id] = (acc[product.category_id] || 0) + 1;
      return acc;
   }, {} as Record<string, number>);

   return (
      <div className="p-5 w-full max-w-[1200px] mx-auto">
         <h1 className="mb-5">Seus Produtos</h1>
         <div className="grid gap-5 grid-cols-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                 {categories && categories.map((c) => c.name ? (
                                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                 ) : null)}
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
               <Card className="size-80">
                  <CardHeader>
                     <CardTitle>Todas as categorias</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-scroll">
                     <ul>
                        {categories.map((c) => (
                           <li key={c.id} className="flex justify-between mb-2">
                              {c.name} - {categoryCounts[c.id] || 0} produtos
                              <Trash2 fill="transparent" stroke="#fff" size={28}
                                 className="mr-2 stroke-red-600 bg-transparent p-1 cursor-pointer rounded-md"
                                 onClick={() => handleModalCategory(c)} />
                           </li>
                        ))}
                     </ul>
                  </CardContent>
               </Card>
            </div>
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