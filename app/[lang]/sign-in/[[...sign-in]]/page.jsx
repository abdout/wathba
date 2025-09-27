import { SignIn } from '@clerk/nextjs';

export default function SignInPage({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/sign-up" className="font-medium text-[#1D77B6] hover:text-[#1a6aa3]">
              create a new account
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '0.5rem',
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
                '&:hover': {
                  backgroundColor: '#f3f4f6',
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
              colorBackground: '#ffffff',
            },
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}