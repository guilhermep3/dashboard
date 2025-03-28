import { Button } from "@/components/ui/button";

type props = {
   text: string;
   wFull?: boolean;
}
export const ButtonP = ({ text, wFull }: props) => {
   return <Button className={`bg-emerald-600 hover:bg-emerald-500 mt-auto cursor-pointer
         ${wFull ? 'w-full' : 'w-fit'}`}>
      {text}
   </Button>
}