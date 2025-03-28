import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

const publicRoutes = [
   {path: '/signin', whenAuthenticated: 'redirect'},
   {path: '/register', whenAuthenticated: 'redirect'}
] as const;
// as const impede que os valores do array sejam alterados

const REDIRECT_WHEN_NOT_AUTHENTICATED = '/signin';

export function middleware(request: NextRequest) {
   const path = request.nextUrl.pathname;
   const publicRoute = publicRoutes.find(route => route.path === path);
   const authToken = request.cookies.get('token');

   // Se não há token e a rota é pública, next.
   if(!authToken && publicRoute){
      return NextResponse.next();
   }
   // Se não há token e a rota não é publica, redirecione para signIn.
   if(!authToken && !publicRoute){
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
      return NextResponse.redirect(redirectUrl);
   }
   // Se houver token e a rota for publica.
   if(authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect'){
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
   }

   // Se há um token e a rota não está na lista pública, next.
   return NextResponse.next();
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