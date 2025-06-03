"use client"
import { Footer } from "@/components/footer";
import { Loading } from "@/components/loading";
import { ModalEdit } from "@/components/modal-edit";
import { YourProducts } from "@/components/products/yourProducts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
   };

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

   return (
      <div>
         {isLoading
            ? <div className="mt-28">
               <Loading />
            </div>
            : <>
               <div className="p-5 pb-10 w-full max-w-[1300px] mx-auto">
                  <h1 className="mb-5">Seus Produtos</h1>
                  <YourProducts
                     errorMessage={errorMessage} setErrorMessage={setErrorMessage}
                     selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                     categories={categories} fetchCategories={fetchCategories} fetchProducts={fetchProducts}
                     setModalProduct={setModalProduct} setIsOpen={setIsOpen} setModalAction={setModalAction}
                     setModalTitle={setModalTitle} setModalDescription={setModalDescription} setAlertOpen={setAlertOpen}
                     products={products} setProducts={setProducts} setCategories={setCategories}
                     handleUpdateProduct={handleUpdateProduct}
                  />
                  <ModalEdit
                     categories={categories} handleUpdateProduct={handleUpdateProduct}
                     modalProduct={modalProduct} setModalProduct={setModalProduct}
                     isOpen={isOpen} setIsOpen={setIsOpen}
                     setSelectedCategory={setSelectedCategory} isError={isError}
                     setIsError={setIsError} errorMessage={errorMessage}
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