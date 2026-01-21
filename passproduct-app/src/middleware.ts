import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/why-it-works",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/marketplace(.*)",
  "/listing/(.*)",
  "/api/webhook(.*)",
  "/api/db/categories(.*)",
  "/api/db/listings(.*)",
  "/api/extract-product-info(.*)",
  "/api/enrich-product(.*)",
  "/api/infer-category(.*)",
  "/api/verify/(.*)",
  "/api/market-prices(.*)", // Análisis de precios de mercado
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
