/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { setCookie } from 'nookies';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TriangleAlert } from 'lucide-react';

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export const SignUpCard = () => {

  const [signUpData, setSignUpData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState<string>('');
  const [isMatched, setIsMatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (signUpData.password === signUpData.passwordConfirm && signUpData.password !== "") {
      setIsMatched(true);
    } else {
      setIsMatched(false);
    }
  }, [signUpData.password, signUpData.passwordConfirm])

  const onCredentialsSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`,
        signUpData
      );

      if (response.status === 201) {
        const token = response.data.accessToken;
        setCookie(null, 'token', token, { path: '/' });
      }

      if (response.status === 403) {
        setError(response.data.message);
      }

      router.push('/');
    } catch (error: any) {
      setError(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div>
      <Card className='w-full h-full p-8'>
        <CardHeader className='px-0 pt-0'>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Use your email or another service to continue
          </CardDescription>
        </CardHeader>
        {!!error && (
          <div
            className='bg-destructive/15 p-3 rounded-md flex items-center
          gap-x-2 text-sm text-destructive mb-6'
          >
            <TriangleAlert className='size-4' />
            <p>Something went wrong</p>
          </div>
        )}
        <CardContent className='space-y-5 px-0 pb-0'>
          <form onSubmit={onCredentialsSignUp} className='space-y-2.5'>
            <Input
              disabled={isLoading}
              value={signUpData.firstName}
              onChange={(e) =>
                setSignUpData({ ...signUpData, firstName: e.target.value })
              }
              placeholder='First Name'
              type='text'
              required
            />
            <Input
              disabled={isLoading}
              value={signUpData.lastName}
              onChange={(e) =>
                setSignUpData({ ...signUpData, lastName: e.target.value })
              }
              placeholder='Last Name'
              type='text'
              required
            />
            <Input
              disabled={isLoading}
              value={signUpData.email}
              onChange={(e) =>
                setSignUpData({ ...signUpData, email: e.target.value })
              }
              placeholder='Email'
              type='email'
              required
            />
            <Input
              disabled={isLoading}
              value={signUpData.password}
              onChange={(e) =>
                setSignUpData({ ...signUpData, password: e.target.value })
              }
              placeholder='Password'
              type='password'
              required
              minLength={8}
              maxLength={255}
            />
            <Input
              disabled={isLoading}
              value={signUpData.passwordConfirm}
              onChange={(e) =>
                setSignUpData({
                  ...signUpData,
                  passwordConfirm: e.target.value,
                })
              }
              placeholder='Confirm Password'
              type='password'
              required
            />
            <Button
              disabled={isLoading || !isMatched}
              type='submit'
              size='lg'
              className='w-full'
            >
              Continue
            </Button>
          </form>
          <Separator />
          <p className='text-xs text-muted-foreground'>
            Already have an account?
            <Link href='/login'>
              <span className='text-sky-700 hover:underline'> Login</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
