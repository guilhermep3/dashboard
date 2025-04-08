import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const publicRoutes = ["/signin", "/register"];

export async function middleware(req: NextRequest) {
   const res = NextResponse.next();

   // Inicializa o cliente Supabase com suporte a cookies e sessões
   const supabase = createMiddlewareClient({ req, res });

   const { data: { session } } = await supabase.auth.getSession();

   const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

   // se não estiver autenticado e não for uma rota publica, redireciona para signin.
   if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/signin', req.url));
   }

   // se estiver autenticado e for uma rota publica, redireciona para raiz /.
   if (session && isPublicRoute) {
      return NextResponse.redirect(new URL('/', req.url));
   }

   // senão, permite o acesso normalmente
   return res;
}


export const config: MiddlewareConfig = {
   matcher: [
      /*
      * Match all request paths except for the ones starting with:
      * - api (API routes)
      * - _next/static (static files)
      * - _next/image (image optimization files)
      * - favicon.ico, sitemap.xml, robots.txt (metadata files)
      */
      '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
   ]
}