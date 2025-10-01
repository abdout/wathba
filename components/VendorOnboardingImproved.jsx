'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createVendorStore } from '@/app/[lang]/onboarding/_actions';
import toast from 'react-hot-toast';
import {
  Store, Mail, Phone, MapPin, FileText, User, Upload, ArrowRight, ArrowLeft,
  Check, Building, Globe, Image, Sparkles, ChevronRight, Info, Camera
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Store },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Details', icon: FileText },
  { id: 4, title: 'Review', icon: Check },
];

export default function VendorOnboardingImproved({ dict, lang }) {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animateStep, setAnimateStep] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    address: '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    contact: '',
    logo: '',
    categories: [], // Store categories
    socialLinks: {
      website: '',
      instagram: '',
      facebook: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    setAnimateStep(true);
    const timer = setTimeout(() => setAnimateStep(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    const newErrors = {};

    switch (fieldName) {
      case 'name':
        if (!formData.name) newErrors.name = 'Store name is required';
        break;
      case 'username':
        if (!formData.username) {
          newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
          newErrors.username = 'Only letters, numbers, underscores, and hyphens allowed';
        }
        break;
      case 'email':
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;
      case 'contact':
        if (!formData.contact) newErrors.contact = 'Contact number is required';
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    let isValid = true;
    const stepErrors = {};

    switch (step) {
      case 1:
        if (!formData.name) {
          stepErrors.name = 'Store name is required';
          isValid = false;
        }
        if (!formData.username) {
          stepErrors.username = 'Username is required';
          isValid = false;
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
          stepErrors.username = 'Invalid username format';
          isValid = false;
        }
        break;
      case 2:
        if (!formData.email) {
          stepErrors.email = 'Email is required';
          isValid = false;
        }
        if (!formData.contact) {
          stepErrors.contact = 'Contact number is required';
          isValid = false;
        }
        if (!formData.address) {
          stepErrors.address = 'Address is required';
          isValid = false;
        }
        break;
      case 3:
        if (!formData.description) {
          stepErrors.description = 'Description is required';
          isValid = false;
        }
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const result = await createVendorStore(formData);

      if (result.success) {
        await user?.reload();

        // Show success animation
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span>Store created successfully!</span>
          </div>,
          { duration: 5000 }
        );

        // Redirect to pending approval page
        setTimeout(() => {
          router.push('/store-pending-approval');
        }, 1500);
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

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                ${isActive ? 'bg-[#1D77B6] shadow-lg scale-110' : ''}
                ${isCompleted ? 'bg-green-500' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-300' : ''}
              `}
            >
              {isCompleted ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              )}
              {isActive && (
                <div className="absolute inset-0 rounded-full animate-ping bg-[#1D77B6] opacity-25"></div>
              )}
            </div>

            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={`
                  h-1 rounded-full transition-all duration-500
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={`space-y-6 ${animateStep ? 'animate-fadeIn' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Let's set up your store
              </h3>
              <p className="text-gray-600">
                Choose a unique name and username for your store
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Store className="w-4 h-4 mr-2" />
                  Store Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all
                    ${errors.name && touchedFields.name ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="My Awesome Store"
                />
                {errors.name && touchedFields.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Store Username
                  <span className="ml-2 text-xs text-gray-500">
                    (This will be your store URL)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => handleBlur('username')}
                    className={`
                      w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all
                      ${errors.username && touchedFields.username ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="mystore"
                  />
                  {formData.username && (
                    <p className="mt-1 text-xs text-gray-500">
                      Your store URL: alwathba.com/store/{formData.username}
                    </p>
                  )}
                </div>
                {errors.username && touchedFields.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`space-y-6 ${animateStep ? 'animate-fadeIn' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Contact Information
              </h3>
              <p className="text-gray-600">
                How can customers reach you?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  Business Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all
                    ${errors.email && touchedFields.email ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="store@example.com"
                />
                {errors.email && touchedFields.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  onBlur={() => handleBlur('contact')}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all
                    ${errors.contact && touchedFields.contact ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="+971 50 123 4567"
                />
                {errors.contact && touchedFields.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Business Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur('address')}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all
                    ${errors.address && touchedFields.address ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="123 Main St, Dubai, UAE"
                />
                {errors.address && touchedFields.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={`space-y-6 ${animateStep ? 'animate-fadeIn' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tell us about your store
              </h3>
              <p className="text-gray-600">
                Help customers understand what you offer
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Store Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent transition-all resize-none
                    ${errors.description && touchedFields.description ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Tell customers about your store, what makes you unique, and what products you offer..."
                />
                {errors.description && touchedFields.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Store Logo
                  <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1D77B6] transition-colors">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drop your logo here or click to browse
                  </p>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Or enter logo URL"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Social Links
                  <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={formData.socialLinks.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent"
                    placeholder="Website URL"
                  />
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D77B6] focus:border-transparent"
                    placeholder="Instagram URL"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={`space-y-6 ${animateStep ? 'animate-fadeIn' : ''}`}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Review Your Information
              </h3>
              <p className="text-gray-600">
                Make sure everything looks good before submitting
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Store Name</p>
                  <p className="font-medium text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium text-gray-900">@{formData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{formData.contact}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{formData.address}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">{formData.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    What happens next?
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    After you submit, our team will review your store application within 24-48 hours.
                    You'll receive an email once your store is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <StepIndicator />

            {renderStepContent()}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#1D77B6] text-white rounded-lg hover:bg-[#1a6aa3] transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Store...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Create Store
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}