'use client'

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Store } from 'lucide-react';
import { completeOnboarding } from '@/app/[lang]/onboarding/_actions';
import toast from 'react-hot-toast';

export default function OnboardingClient({ dict, lang }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentLang = params?.lang || lang || 'en';

  const handleRoleSelection = async (role) => {
    setLoading(true);
    try {
      const result = await completeOnboarding({
        role: role,
        onboardingComplete: role === 'customer',
      });

      if (result.success) {
        await user?.reload();

        if (role === 'vendor') {
          router.push(`/${currentLang}/onboarding/vendor`);
        } else {
          toast.success('Welcome to Al Wathba Coop!');
          router.push(`/${currentLang}/`);
        }
      } else {
        toast.error(result.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      toast.error('An error occurred during onboarding');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {dict?.onboarding?.welcome || 'Welcome to Al Wathba Coop!'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {dict?.onboarding?.selectRole || 'Please select how you want to use Al Wathba Coop'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelection('customer')}
              disabled={loading}
              className={`w-full flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${
                selectedRole === 'customer'
                  ? 'border-[#1D77B6] bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ShoppingCart className="h-12 w-12 text-[#1D77B6] mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {dict?.onboarding?.shopTitle || 'I want to shop'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {dict?.onboarding?.shopDescription || 'Browse products and make purchases'}
              </p>
            </button>

            <button
              onClick={() => handleRoleSelection('vendor')}
              disabled={loading}
              className={`w-full flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${
                selectedRole === 'vendor'
                  ? 'border-[#1D77B6] bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Store className="h-12 w-12 text-[#1D77B6] mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {dict?.onboarding?.sellTitle || 'I want to sell'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {dict?.onboarding?.sellDescription || 'Create a store and sell products'}
              </p>
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {dict?.onboarding?.settingUp || 'Setting up your account...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}