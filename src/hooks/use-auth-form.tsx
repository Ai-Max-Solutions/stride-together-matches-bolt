import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthFormData {
  email: string;
  password: string;
  fullName: string;
  isOrganization: boolean;
  organizationName: string;
  organizationType: 'club' | 'charity';
}

export function useAuthForm() {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: '',
    isOrganization: false,
    organizationName: '',
    organizationType: 'club'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const validateForm = (isSignUp: boolean) => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (isSignUp && !formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (isSignUp && formData.isOrganization && !formData.organizationName.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (isSignUp: boolean) => {
    if (!validateForm(isSignUp)) return;

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName,
          formData.isOrganization ? {
            organizationName: formData.organizationName,
            organizationType: formData.organizationType
          } : undefined
        );
        if (error) {
          setError(error.message);
        } else {
          toast({
            title: "Account created successfully!",
            description: formData.isOrganization 
              ? "Your organization account has been created. Please check your email to verify your account."
              : "Please check your email to verify your account.",
          });
          navigate('/profile/setup');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/profile/setup');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    updateField,
    handleSubmit,
    handleGoogleSignIn
  };
}