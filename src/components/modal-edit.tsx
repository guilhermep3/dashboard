import { Product } from "@/types/product"
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

type props = {
   categories: { id: string; name: string }[];
   handleUpdateProduct: () => void;
   modalProduct: Product | null;
   setModalProduct: (newProduct: Product) => void;
   isOpen: boolean;
   setIsOpen: (newValue: boolean) => void;
   setSelectedCategory: (newValue: string) => void;
   isError: boolean;
   setIsError: (newV: boolean) => void;
   errorMessage: string;
}
export const ModalEdit = ({ categories, handleUpdateProduct, modalProduct, setModalProduct, isOpen, setIsOpen, setSelectedCategory, isError, setIsError, errorMessage }: props) => {

   return (
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
                  <Label htmlFor="modalCost" className="mb-1 text-base">Custo</Label>
                  <Input id="modalCost"
                     type="number"
                     placeholder="Custo do produto"
                     value={modalProduct?.cost}
                     onChange={(e) => setModalProduct({ ...modalProduct!, cost: Number(e.target.value) })}
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
               <div>
                  <Label htmlFor="modalSold" className="mb-1 text-base">Vendidos</Label>
                  <Input id="modalSold"
                     type="number"
                     placeholder="Quantidade vendida"
                     value={modalProduct?.sold}
                     onChange={(e) => setModalProduct({ ...modalProduct!, sold: Number(e.target.value) })}
                     required
                  />
               </div>
               <div>
                  <Select defaultValue={modalProduct?.category_id} onValueChange={(value) => {
                     setSelectedCategory(value),
                        setIsError(false)
                  }}>
                     <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectGroup>
                           <SelectLabel>Categorias</SelectLabel>
                           {categories && categories.map((c) => c.name ? (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                           ) : null)}
                        </SelectGroup>
                     </SelectContent>
                  </Select>
               </div>
               {isError &&
                  <p className="text-red-600 text-center text-sm">{errorMessage}</p>
               }
            </form>
            <div className="flex justify-center gap-3">
               <Button onClick={handleUpdateProduct}>Confirmar</Button>
               <DialogClose className="bg-red-600 px-3 py-1 rounded-md text-white cursor-pointer"
                  onClick={() => setIsError(false)}>
                  Cancelar
               </DialogClose>
            </div>
         </DialogContent>
      </Dialog>
   )
}