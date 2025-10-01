import { SignIn } from '@clerk/nextjs';
import { getDictionary } from '@/components/internationalization/dictionaries';
import OptimizedImage from '@/components/OptimizedImage';

export default async function SignInPage({ params }) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="min-h-screen flex">
      {/* Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1D77B6] to-[#1a6aa3]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">
              {dict?.auth?.welcome_back || "Welcome Back"}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {dict?.auth?.signin_subtitle || "Sign in to continue shopping with the best deals from Alwathba Coop"}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-white/80">
                {dict?.auth?.exclusive_offers || "Get exclusive offers and updates"}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zm13 15.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <p className="text-white/80">
                {dict?.auth?.track_orders || "Track your orders easily"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {dict?.auth?.welcome_back || "Welcome Back"}
            </h1>
            <p className="text-gray-600">
              {dict?.auth?.signin_subtitle_mobile || "Sign in to your account"}
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {dict?.auth?.signin_title || "Sign in to your account"}
            </h2>
            <p className="text-gray-600">
              {dict?.auth?.no_account || "Don't have an account?"}{' '}
              <a href={`/${params.lang}/sign-up`} className="font-medium text-[#1D77B6] hover:text-[#1a6aa3]">
                {dict?.auth?.create_account || "Sign up"}
              </a>
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: {
                  fontSize: 14,
                  textTransform: 'none',
                  backgroundColor: '#1D77B6',
                  '&:hover': {
                    backgroundColor: '#1a6aa3',
                  },
                },
                card: {
                  boxShadow: 'none',
                  borderRadius: '0.5rem',
                  backgroundColor: 'transparent',
                },
                headerTitle: {
                  display: 'none',
                },
                headerSubtitle: {
                  display: 'none',
                },
                socialButtonsBlockButton: {
                  fontSize: 14,
                  textTransform: 'none',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                },
                dividerLine: {
                  backgroundColor: '#e5e7eb',
                },
                dividerText: {
                  color: '#6b7280',
                },
                formFieldLabel: {
                  color: '#374151',
                  fontSize: 14,
                },
                formFieldInput: {
                  fontSize: 14,
                  borderColor: '#d1d5db',
                  '&:focus': {
                    borderColor: '#1D77B6',
                  },
                },
                footerActionLink: {
                  color: '#1D77B6',
                  '&:hover': {
                    color: '#1a6aa3',
                  },
                },
              },
              layout: {
                socialButtonsVariant: 'blockButton',
                socialButtonsPlacement: 'top',
              },
              variables: {
                colorPrimary: '#1D77B6',
                colorBackground: 'transparent',
              },
            }}
            routing="path"
            path={`/${params.lang}/sign-in`}
            signUpUrl={`/${params.lang}/sign-up`}
          />
        </div>
      </div>
    </div>
  );
}