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