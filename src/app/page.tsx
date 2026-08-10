// Apex domain (no restaurant subdomain) — restaurant flows live under {slug}.<root domain>,
// resolved by src/middleware.ts to src/app/sites/[slug]/page.tsx.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center gap-3">
      <h1 className="text-3xl font-bold text-white">GastroMind</h1>
      <p className="text-gray-500 max-w-md">
        Bu adres bir restorana ait değil. Restoranınızın QR koduyla size özel adrese ulaşabilirsiniz.
      </p>
    </main>
  );
}