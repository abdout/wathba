'use client'

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function StorePendingApprovalPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Check if store is already approved
    const checkApproval = () => {
      if (user?.publicMetadata?.storeApproved === true) {
        router.push('/store');
      }
    };

    // Check approval status every 5 seconds
    const interval = setInterval(checkApproval, 5000);

    return () => clearInterval(interval);
  }, [user, router]);

  const storeData = user?.publicMetadata?.storeData;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Store is Pending Approval
            </h2>

            <p className="text-gray-600 mb-8">
              Thank you for creating your store! Our admin team is reviewing your application.
              This usually takes 24-48 hours. We'll notify you once your store is approved.
            </p>

            {storeData && (
              <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Store Name</dt>
                    <dd className="text-sm text-gray-900">{storeData.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="text-sm text-gray-900">@{storeData.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{storeData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="text-sm text-gray-900">{storeData.contact}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D77B6]"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1D77B6] hover:bg-[#1a6aa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D77B6]"
              >
                Check Status
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>This page will automatically redirect once your store is approved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}