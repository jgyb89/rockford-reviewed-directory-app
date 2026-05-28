import RecommendLandingClient from './RecommendLandingClient';

export const metadata = {
  title: 'Recommend a Business | Cape Coral Reviewed',
  description: 'Know a great local business in Cape Coral? Recommend them to be added to our premier local directory. Help us spotlight the best businesses with a YouTube feature, newsletter shoutout, and social media promotion.',
  keywords: 'Cape Coral businesses, recommend a business, Cape Coral directory, local spotlight, best of Cape Coral',
};

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function RecommendPage({ params }) {
  const { locale } = await params;

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <RecommendLandingClient />
    </main>
  );
}
