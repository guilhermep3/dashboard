"use client"
import { Trash2 } from "lucide-react";
import { FormProduct } from "../form-product"
import { TableProducts } from "../table-products"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase";

type props = {
   errorMessage: string;
   setErrorMessage: (newMessage: string) => void;
   selectedCategory: string;
   setSelectedCategory: (newMessage: string) => void;
   categories: {
      id: string;
      name: string;
   }[];
   fetchCategories: any
   fetchProducts: (a?: any) => Promise<void>;
   setModalProduct: (newV: Product | null) => void;
   setIsOpen: (newV: boolean) => void;
   setModalTitle: (newV: string) => void;
   setModalDescription: (newV: string) => void;
   setModalAction: (newV: () => void) => void;
   setAlertOpen: (newV: boolean) => void;
   products: Product[];
   setProducts: (newV: Product[]) => void;
   setCategories: (newV: { id: string; name: string }[]) => void;
   handleUpdateProduct: () => void;
};

export const YourProducts = (
   {
      errorMessage, setErrorMessage, selectedCategory, setSelectedCategory,
      categories, fetchCategories, fetchProducts, setModalProduct, setIsOpen,
      setModalTitle, setModalDescription, setModalAction, setAlertOpen,
      products, setProducts, setCategories, handleUpdateProduct
   }: props) => {

   function handleEditProduct(product: Product) {
      setModalProduct(product);
      setIsOpen(true);
   };

   function openModal(title: string, description: string, action: () => void, data?: any) {
      setModalTitle(title);
      setModalDescription(description);
      setModalAction(() => action);
      setAlertOpen(true)
   }

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
                     setSelectedCategory={setSelectedCategory}
                     categories={categories}
                     fetchProducts={fetchProducts}
                     fetchCategories={fetchCategories}
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
   )
}