"use client"
import { Footer } from "@/components/footer";
import { FormProduct } from "@/components/form-product";
import { Loading } from "@/components/loading";
import { ModalEdit } from "@/components/modal-edit";
import { TableProducts } from "@/components/table-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

export const productSchema = z.object({
   name: z.string().trim().min(1, "O nome do produto é obrigatório."),
   price: z.string()
      .trim()
      .min(1, "O preço é obrigatório.")
      .refine(value => !isNaN(parseFloat(value)) && parseFloat(value) > 0, "O preço deve ser um número válido."),
   cost: z.string()
      .trim()
      .min(1, "O custo é obrigatório")
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

export default function Products() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [products, setProducts] = useState<Product[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [alertOpen, setAlertOpen] = useState(false);
   const [modalProduct, setModalProduct] = useState<Product | null>(null);
   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const [isError, setIsError] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [modalTitle, setModalTitle] = useState('');
   const [modalDescription, setModalDescription] = useState('');
   const [modalData, setModalData] = useState<any>(null);
   const [modalAction, setModalAction] = useState<() => void>(() => { });

   useEffect(() => {
      checkUser();
      fetchProducts();
      fetchCategories();
   }, []);

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

   async function handleDeleteProduct(id: string) {
      try {
         const { data, error } = await supabase.from("products").delete().eq('id', id);
         if (error) {
            console.log("Erro ao deletar produto: ", error)
            return
         };

         setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
         console.log("Erro ao excluir produto: ", error)
      }
      setAlertOpen(false);
   };

   async function handleUpdateProduct() {
      const { data, error } = await supabase
         .from("products")
         .select("*")
         .eq("id", modalProduct?.id)
         .single();

      if (error) {
         console.log("Erro ao buscar produto:", error);
         return;
      }

      const productToChange = data;
      const soldChanged = modalProduct!.sold !== productToChange.sold;
      const quantityChanged = modalProduct!.quantity !== productToChange.quantity;
      let categoryChanged = selectedCategory !== productToChange.category_id;
      if (!selectedCategory) {
         categoryChanged = false
      }
      let newQuantity = productToChange.quantity;

      // se sold foi mudado, tira da quantidade o valor atualizado
      if (soldChanged) {
         const soldDifference = modalProduct!.sold - productToChange.sold;
         newQuantity -= soldDifference;
      }
      // se a quantidade foi alterada, atualize o valor sem calcular com as vendas
      if (quantityChanged) {
         newQuantity = modalProduct!.quantity;
      }

      if (newQuantity < 0) {
         setErrorMessage("Unidades vendidas não pode ser maior do que a quantia disponível.");
         setIsError(true);
         return;
      }

      try {
         const { error } = await supabase
            .from("products")
            .update({
               name: modalProduct?.name,
               price: modalProduct?.price,
               cost: modalProduct?.cost,
               quantity: newQuantity,
               sold: modalProduct!.sold,
               ...categoryChanged && { category_id: selectedCategory }
            })
            .eq("id", modalProduct?.id);

         if (error) console.log("Erro ao atualizar:", error);

         setIsOpen(false);
         await fetchProducts();
      } catch (error) {
         console.log("Erro ao atualizar o produto: ", error);
      }
      setIsOpen(false);
   }


   async function fetchCategories() {
      const { data, error } = await supabase.from('categories')
         .select('id, name')
         .eq('user_id', (await supabase.auth.getUser())?.data.user?.id);

      if (error) {
         console.error('Erro ao buscar categorias:', error);
      } else {
         setCategories(data);
      }
   };

   async function handleDeleteCategory(id: string) {
      try {
         const { data, error } = await supabase.from("categories").delete().eq('id', id);
         if (error) {
            console.log("Erro ao deletar categoria: ", error)
            return;
         }
         setCategories(categories.filter(category => category.id !== id));
      } catch (error) {
         console.log("Erro ao excluir categoria: ", error)
      }
      fetchProducts();
      setAlertOpen(false);
   }

   function openModal(title: string, description: string, action: () => void, data?: any) {
      setModalTitle(title);
      setModalDescription(description);
      setModalAction(() => action);
      setModalData(data);
      setAlertOpen(true)
   }

   function handleEditProduct(product: Product) {
      setModalProduct(product);
      setIsOpen(true);
   };
   function handleModalDeleteProduct(product: Product) {
      openModal(
         `Deletar ${product.name}?`,
         "Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.",
         () => handleDeleteProduct(product.id!),
         product
      );
   }

   function handleModalCategory(category: any) {
      openModal(
         `Deletar a categoria ${category.name} ?`,
         "Ao excluir uma categoria, TODOS os produtos serão excluidos também",
         () => handleDeleteCategory(category.id),
         category
      )
   };

   const categoryCounts = products.reduce((acc, product) => {
      acc[product.category_id] = (acc[product.category_id] || 0) + 1;
      return acc;
   }, {} as Record<string, number>);

   return (
      <div>
         {isLoading
            ? <div className="mt-28">
               <Loading />
            </div>
            : <>
               <div className="p-5 pb-10 w-full max-w-[1300px] mx-auto">
                  <h1 className="mb-5">Seus Produtos</h1>
                  <div className="grid gap-8 grid-cols-1">
                     <div className="flex items-start justify-center flex-wrap gap-3">
                        <Card className="w-full max-w-96">
                           <CardHeader>
                              <CardTitle className="text-lg">Adicionar Produto</CardTitle>
                           </CardHeader>
                           <CardContent>
                              <FormProduct
                                 errorMessage={errorMessage}
                                 setErrorMessage={setErrorMessage}
                                 selectedCategory={selectedCategory}
                                 categories={categories}
                                 fetchProducts={fetchProducts}
                                 fetchCategories={fetchCategories}
                                 setSelectedCategory={setSelectedCategory}
                              />
                           </CardContent>
                        </Card>
                        <Card className="w-80">
                           <CardHeader>
                              <CardTitle>Todas as categorias</CardTitle>
                           </CardHeader>
                           <CardContent className="overflow-y-scroll mr-3">
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
                     <TableProducts
                        categories={categories}
                        products={products}
                        handleUpdateProduct={handleUpdateProduct}
                        handleEditProduct={handleEditProduct}
                        handleModalDeleteProduct={handleModalDeleteProduct}
                     />
                  </div>
                  <ModalEdit
                     categories={categories}
                     handleUpdateProduct={handleUpdateProduct}
                     modalProduct={modalProduct}
                     setModalProduct={setModalProduct}
                     isOpen={isOpen}
                     setIsOpen={setIsOpen}
                     setSelectedCategory={setSelectedCategory}
                     isError={isError}
                     setIsError={setIsError}
                     errorMessage={errorMessage}
                  />
                  <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                     <DialogContent>
                        <DialogHeader>
                           <DialogTitle className="text-center">{modalTitle}</DialogTitle>
                           <DialogDescription className="text-center text-zinc-700 dark:text-zinc-300 my-1">{modalDescription}</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center items-center gap-5 mx-auto">
                           <Button onClick={modalAction}>Confirmar</Button>
                           <DialogClose className="bg-red-600 px-3 py-[6px] rounded-md text-white cursor-pointer w-fit">
                              Cancelar
                           </DialogClose>
                        </div>
                     </DialogContent>
                  </Dialog>
               </div >
               <Footer />
            </>}
      </div>
   )
}