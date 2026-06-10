interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SolutionsPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Solutions Page</h1>
      <p className="mt-2 text-gray-600">Locale: {locale}</p>
    </main>
  );
}
