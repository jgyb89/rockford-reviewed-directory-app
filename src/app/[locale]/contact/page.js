import ContactLandingClient from './ContactLandingClient';

export const metadata = {
  title: 'Contact Us | Cape Coral Reviewed',
  description: 'Get in touch with the Cape Coral Reviewed team. We would love to hear from you regarding partnerships, questions, or general inquiries.',
  keywords: 'contact Cape Coral Reviewed, reach out, partnerships, local directory support',
};

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function ContactPage() {

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <ContactLandingClient />
    </main>
  );
}
