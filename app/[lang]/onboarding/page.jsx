import OnboardingClient from '@/components/OnboardingClient';
import { getDictionary } from '@/components/internationalization/dictionaries';

export default async function OnboardingPage({ params }) {
  const dict = await getDictionary(params.lang);
  return <OnboardingClient dict={dict} lang={params.lang} />;
}
