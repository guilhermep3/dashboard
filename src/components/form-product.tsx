import { supabase } from "@/lib/supabase"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { useState } from "react"
import { productSchema } from "@/utils/product-schema"

type props = {
   errorMessage: string;
   setErrorMessage: (newError: string) => void;
   selectedCategory: string;
   categories: { id: string; name: string }[];
   fetchProducts: () => void;
   fetchCategories: () => void;
   setSelectedCategory: (newSelected: string) => void;
}
export const FormProduct = ({ errorMessage, setErrorMessage, selectedCategory, categories, fetchProducts, fetchCategories, setSelectedCategory }: props) => {
   const [isError, setIsError] = useState(false);
   const [newProduct, setNewProduct] = useState({
      name: '',
      price: '',
      cost: '',
      quantity: '',
      category_id: '',
      sold: 0
   });
   const [categoryName, setCategoryName] = useState('');

   async function handleAddProduct(e: React.FormEvent) {
      e.preventDefault();

      const { data: userData, error: errorGetUser } = await supabase.auth.getUser();
      if (!userData.user) {
         return console.error("Usuário não autenticado!", errorGetUser);
      }

      const isCreatingCategory = categoryName.trim() !== '';
      const isSelectingCategory = selectedCategory !== '' && selectedCategory !== 'none';

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
               cost: newProduct.cost,
               quantity: newProduct.quantity,
               categoryName: categoryName,
               sold: newProduct.sold.toString()
            })

            const alreadyHaveCategory = categories.some(
               (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
            );
            if (alreadyHaveCategory) {
               setErrorMessage("Essa categoria já existe!");
               setIsError(true);
               return;
            }
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
               cost: parseFloat(validatedData.cost),
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
               cost: newProduct.cost,
               quantity: newProduct.quantity,
               selectedCategory: selectedCategory,
               sold: newProduct.sold.toString()
            });

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
               cost: parseFloat(validatedData.cost),
               quantity: parseInt(validatedData.quantity),
               category_id: categoryId,
               user_id: userData.user.id,
            });
            if (error) {
               return console.error("Erro ao adicionar produto:", error);
            }
         }
         setNewProduct({ name: "", price: "", cost: "", quantity: "", category_id: "", sold: 0 });
         setCategoryName("");
         fetchProducts();
         setIsError(false);
      } catch (error: any) {
         const firstError = error.errors[0];
         setErrorMessage(firstError.message);
         setIsError(true);
      }
   };

   return (
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
            step="0.01"
            placeholder="Custo"
            value={newProduct.cost}
            onChange={(e) => {
               setNewProduct({ ...newProduct, cost: e.target.value }),
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
   )
}