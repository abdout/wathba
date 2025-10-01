'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import {
  ShoppingCart,
  Store,
  ArrowRight,
  Check,
  User,
  Sparkles,
  TrendingUp,
  Package,
  Users,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { completeOnboarding } from '@/app/[lang]/onboarding/_actions';
import toast from 'react-hot-toast';

const roleFeatures = {
  customer: [
    { icon: Package, text: 'Browse thousands of products', color: 'text-blue-500' },
    { icon: Shield, text: 'Secure payment options', color: 'text-green-500' },
    { icon: Zap, text: 'Fast delivery to your door', color: 'text-yellow-500' },
    { icon: Users, text: 'Support local vendors', color: 'text-purple-500' },
  ],
  vendor: [
    { icon: Store, text: 'Create your own store', color: 'text-blue-500' },
    { icon: TrendingUp, text: 'Grow your business online', color: 'text-green-500' },
    { icon: Globe, text: 'Reach more customers', color: 'text-yellow-500' },
    { icon: Shield, text: 'Secure payment processing', color: 'text-purple-500' },
  ]
};

export default function OnboardingClientImproved({ dict, lang }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentLang = params?.lang || lang || 'en';

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelection = async (role) => {
    if (loading) return;

    setSelectedRole(role);
    setLoading(true);

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

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
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>{dict?.onboarding?.welcomeMessage || 'Welcome to Alwathba Coop!'}</span>
            </div>
          );
          router.push(`/${currentLang}/`);
        }
      } else {
        toast.error(result.error || 'Failed to complete onboarding');
        setSelectedRole('');
      }
    } catch (error) {
      toast.error('An error occurred during onboarding');
      console.error('Onboarding error:', error);
      setSelectedRole('');
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ role, title, description, icon: Icon, features }) => {
    const isSelected = selectedRole === role;
    const isDisabled = loading && selectedRole !== role;

    return (
      <button
        onClick={() => handleRoleSelection(role)}
        disabled={loading}
        className={`
          relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform
          ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${isSelected
            ? 'border-[#1D77B6] bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02]'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${loading && isSelected ? 'animate-pulse' : ''}
        `}
        style={{
          transitionDelay: role === 'customer' ? '0ms' : '100ms'
        }}
      >
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-[#1D77B6] rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${isSelected ? 'bg-[#1D77B6] shadow-md' : 'bg-gray-100'}
          `}>
            <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[#1D77B6]'}`} />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 text-sm transition-all duration-300
                ${isSelected ? 'translate-x-2' : ''}
              `}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span className="text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className={`
          flex items-center justify-between pt-4 border-t transition-all duration-300
          ${isSelected ? 'border-blue-200' : 'border-gray-100'}
        `}>
          <span className={`
            text-sm font-medium
            ${isSelected ? 'text-[#1D77B6]' : 'text-gray-500'}
          `}>
            {loading && isSelected
              ? (dict?.onboarding?.settingUp || 'Setting up...')
              : (dict?.onboarding?.getStarted || 'Get Started')
            }
          </span>
          <ArrowRight className={`
            w-5 h-5 transition-all duration-300
            ${isSelected ? 'text-[#1D77B6] translate-x-1' : 'text-gray-400'}
          `} />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header with user greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1D77B6] to-blue-600 rounded-full mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {user?.firstName
              ? `${dict?.onboarding?.welcomeUser || 'Welcome'}, ${user.firstName}!`
              : (dict?.onboarding?.welcome || 'Welcome to Alwathba Coop!')
            }
          </h1>

          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {dict?.onboarding?.selectRoleDescription ||
             "Let's get you started on your journey. How would you like to use Alwathba Coop?"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1D77B6] rounded-full flex items-center justify-center text-white font-medium">
              1
            </div>
            <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-medium">
              2
            </div>
          </div>
        </div>

        {/* Role selection cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <RoleCard
            role="customer"
            title={dict?.onboarding?.shopTitle || "I want to shop"}
            description={dict?.onboarding?.shopDescription || "Browse products and make purchases"}
            icon={ShoppingCart}
            features={roleFeatures.customer.map(f => ({
              ...f,
              text: dict?.onboarding?.[`customer_${roleFeatures.customer.indexOf(f)}`] || f.text
            }))}
          />

          <RoleCard
            role="vendor"
            title={dict?.onboarding?.sellTitle || "I want to sell"}
            description={dict?.onboarding?.sellDescription || "Create a store and sell products"}
            icon={Store}
            features={roleFeatures.vendor.map(f => ({
              ...f,
              text: dict?.onboarding?.[`vendor_${roleFeatures.vendor.indexOf(f)}`] || f.text
            }))}
          />
        </div>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {dict?.onboarding?.canChangeRole || "You can always change your role later in settings"}
          </p>
        </div>
      </div>
    </div>
  );
}