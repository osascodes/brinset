'use client';
import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schema';
import { loginAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthCard from '@/features/auth/components/AuthCard';
import PasswordInput from '@/features/auth/components/PasswordInput';
import { useAuthForm } from '@/features/auth/hooks';
import GoogleButton from '@/features/auth/components/GoogleButton';

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);
        await loginAction(formData);
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : 'Sign in failed.');
      }
    });
  };

  return (
    <AuthCard title="Log in">
      <GoogleButton label="Continue with Google" />
      <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        or
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errorMessage}</div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-600">Email</Label>
          <Input {...form.register('email')} type="email" placeholder="you@email.com" autoComplete="email" />
          {form.formState.errors.email ? <p className="text-xs text-red-500">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-600">Password</Label>
          <PasswordInput {...form.register('password')} placeholder="Your password" autoComplete="current-password" />
          {form.formState.errors.password ? <p className="text-xs text-red-500">{form.formState.errors.password.message}</p> : null}
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-[#635BFF]">Forgot password?</Link>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full bg-[#635BFF] text-white hover:bg-[#635BFF]/90" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Log in'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-zinc-500">
        New shop owner?{' '}
        <Link href="/register" className="font-medium text-[#635BFF]">Create a shop</Link>
      </div>
      <Link href="/join" className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-[#E5E7EB] text-sm font-medium text-zinc-700 hover:border-[#635BFF] hover:text-[#635BFF]">
        New staff? Join with a code
      </Link>
    </AuthCard>
  );
}
