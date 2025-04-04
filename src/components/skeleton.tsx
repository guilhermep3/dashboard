import { Loading } from "./loading";
import { Card } from "./ui/card";

type props = {
   w?: string;
   h?: string;
}
export function Skeleton({w, h}: props){

   return (
      <Card className={` max-w-96`}
         style={{ width: w ?? '100%', height: h ?? '320px' }}>
         <Loading/>
      </Card>
   )
}