import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Stride Together
          </h1>
          <p className="text-muted-foreground">
            Find your perfect fitness buddy
          </p>
        </div>

        {isSignUp ? (
          <SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
        ) : (
          <SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
        )}

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}