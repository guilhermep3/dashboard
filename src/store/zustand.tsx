import { create } from "zustand";
import { supabase } from "@/lib/supabase"; // ajuste conforme necessário

interface ProfileState {
   profileImage: string;
   fetchImage: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
   profileImage: "avatar.jpg",
   fetchImage: async () => {
      try {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) return;

         const { data: userData, error } = await supabase.from("users")
            .select("profile_image")
            .eq("user_id", session.user.id)
            .single();

         if (error) {
            console.log("Erro ao buscar avatar:", error);
            return;
         }

         set({ profileImage: userData?.profile_image || "avatar.jpg" });

      } catch (error: any) {
         console.log(error);
      }
   }
}));
