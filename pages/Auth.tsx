import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { User, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { MOCK_ALL_USERS } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let loginUser: User;

    // Check if user exists in mock data to preserve ID/Relationships
    const existingUser = MOCK_ALL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        loginUser = existingUser;
    } else {
        // Determine Role for new user
        let role: UserRole = 'CUSTOMER';
        if (email.includes('admin')) {
            role = 'ADMIN';
        } else if (email.includes('fixer')) {
            role = 'FIXER';
        }
        
        // Create new mock user
        loginUser = {
            id: Date.now().toString(),
            name: name || email.split('@')[0] || 'User',
            email: email,
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${name || email}&background=f97316&color=fff`
        };
    }

    onLogin(loginUser);
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isLogin ? 'Enter your credentials to access your account' : 'Join BLUCELL to start your tech journey'}
          </p>
        </div>

        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium text-blucell-600 hover:text-blucell-500 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};