import { SignUp } from '@clerk/nextjs';
import { getDictionary } from '@/components/internationalization/dictionaries';
import OptimizedImage from '@/components/OptimizedImage';

export default async function SignUpPage({ params }) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="min-h-screen flex">
      {/* Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1D77B6] to-[#1a6aa3]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">
              {dict?.auth?.join_us || "Join Alwathba Coop"}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {dict?.auth?.signup_subtitle || "Create an account and start shopping with amazing deals"}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/80">
                {dict?.auth?.member_benefits || "Exclusive member benefits"}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p className="text-white/80">
                {dict?.auth?.community_shopping || "Join our shopping community"}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/80">
                {dict?.auth?.quality_products || "Quality products guaranteed"}
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
              {dict?.auth?.join_us || "Join Alwathba Coop"}
            </h1>
            <p className="text-gray-600">
              {dict?.auth?.signup_subtitle_mobile || "Create your account"}
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {dict?.auth?.create_account || "Create your account"}
            </h2>
            <p className="text-gray-600">
              {dict?.auth?.have_account || "Already have an account?"}{' '}
              <a href={`/${params.lang}/sign-in`} className="font-medium text-[#1D77B6] hover:text-[#1a6aa3]">
                {dict?.auth?.sign_in || "Sign in"}
              </a>
            </p>
          </div>

          <SignUp
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
            path={`/${params.lang}/sign-up`}
            signInUrl={`/${params.lang}/sign-in`}
          />
        </div>
      </div>
    </div>
  );
}