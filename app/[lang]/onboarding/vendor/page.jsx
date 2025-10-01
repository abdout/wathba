import VendorOnboardingImproved from '@/components/VendorOnboardingImproved';
import { getDictionary } from '@/components/internationalization/dictionaries';

export default async function VendorOnboardingPage({ params }) {
  const dict = await getDictionary(params.lang);
  return <VendorOnboardingImproved dict={dict} lang={params.lang} />;
}

// Original component moved to backup file for reference
/*
'use client'

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createVendorStore } from '../_actions';
import toast from 'react-hot-toast';
import { Store, Mail, Phone, MapPin, FileText, User } from 'lucide-react';

function VendorOnboardingPageOriginal() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    address: '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    contact: '',
    logo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createVendorStore(formData);

      if (result.success) {
        await user?.reload();
        toast.success('Store created successfully! Waiting for admin approval.');
        router.push('/store-pending-approval');
      } else {
        toast.error(result.error || 'Failed to create store');
      }
    } catch (error) {
      toast.error('An error occurred while creating your store');
      console.error('Store creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Store
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Provide information about your store. Admin approval is required before you can start selling.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Store className="w-4 h-4 mr-2" />
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                    placeholder="My Awesome Store"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Store Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                    placeholder="mystore"
                    pattern="[a-zA-Z0-9_-]+"
                    title="Only letters, numbers, underscores, and hyphens allowed"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Business Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                    placeholder="store@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    id="contact"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Business Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <div>
                <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Store Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                  placeholder="Tell customers about your store and what you sell..."
                />
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Logo URL (Optional)
                </label>
                <input
                  type="url"
                  name="logo"
                  id="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1D77B6] focus:border-[#1D77B6] sm:text-sm px-3 py-2 border"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D77B6]"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1D77B6] hover:bg-[#1a6aa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D77B6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Store...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
*/