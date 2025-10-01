import OnboardingClientImproved from '@/components/OnboardingClientImproved';
import { getDictionary } from '@/components/internationalization/dictionaries';

export default async function OnboardingPage({ params }) {
  const dict = await getDictionary(params.lang);
  return <OnboardingClientImproved dict={dict} lang={params.lang} />;
}
