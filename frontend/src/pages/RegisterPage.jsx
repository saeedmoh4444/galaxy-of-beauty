import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../validators/auth';
import { useRegister } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const registerMutation = useRegister();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'TECHNICIAN') navigate('/tech/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
      acceptTerms: false,
      city: '',
      area: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">✨</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 font-display">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-gray-500 mt-2">انضمي إلى منصة جالكسي بيوتي</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="الاسم الكامل"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              placeholder="example@email.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
              placeholder="+966 5X XXX XXXX"
              dir="ltr"
              {...register('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر دورك <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'CUSTOMER', { shouldValidate: true })}
                className={`card text-center py-4 transition-all cursor-pointer
                  ${selectedRole === 'CUSTOMER'
                    ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                    : 'hover:border-primary-200'}`}
              >
                <span className="text-2xl">👩‍🦰</span>
                <p className="text-sm font-medium mt-1">{t('auth.roleCustomer')}</p>
                <p className="text-xs text-gray-400 mt-1">احجزي خدمات التجميل</p>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'TECHNICIAN', { shouldValidate: true })}
                className={`card text-center py-4 transition-all cursor-pointer
                  ${selectedRole === 'TECHNICIAN'
                    ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                    : 'hover:border-primary-200'}`}
              >
                <span className="text-2xl">💇‍♀️</span>
                <p className="text-sm font-medium mt-1">{t('auth.roleTechnician')}</p>
                <p className="text-xs text-gray-400 mt-1">قدمي خدماتك للعميلات</p>
              </button>
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>

          {/* Technician extra fields */}
          {selectedRole === 'TECHNICIAN' && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <p className="text-sm font-medium text-gray-700">معلومات إضافية لمقدمة الخدمة</p>
              <div>
                <label htmlFor="city" className="block text-xs text-gray-600 mb-1">
                  المدينة <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  className="input-field bg-white text-sm py-2"
                  placeholder="الرياض"
                  {...register('city')}
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="area" className="block text-xs text-gray-600 mb-1">
                  الحي
                </label>
                <input
                  id="area"
                  type="text"
                  className="input-field bg-white text-sm py-2"
                  placeholder="حي النرجس"
                  {...register('area')}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')} <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              className={`input-field ${errors.password ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              id="acceptTerms"
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600">
              أوافق على{' '}
              <a href="/terms" className="text-primary-600 underline" target="_blank">
                الشروط والأحكام
              </a>{' '}
              و{' '}
              <a href="/privacy" className="text-primary-600 underline" target="_blank">
                سياسة الخصوصية
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-600 -mt-2">{errors.acceptTerms.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || registerMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {(isSubmitting || registerMutation.isPending) && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {t('auth.registerTitle')}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
