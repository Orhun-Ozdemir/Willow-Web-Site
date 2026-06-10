interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function StartProjectPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">StartProject Page</h1>
      <p className="mt-2 text-gray-600">Locale: {locale}</p>
    </main>
  );
}
