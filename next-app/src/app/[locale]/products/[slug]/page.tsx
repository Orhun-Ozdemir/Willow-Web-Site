interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Product Detail Page</h1>
      <p className="mt-2 text-gray-600">Locale: {locale}</p>
      <p className="mt-1 text-gray-600">Slug: {slug}</p>
    </main>
  );
}
