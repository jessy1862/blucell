
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Upload, Camera, Eye, EyeOff, Check, Chrome, KeyRound, ArrowLeft } from 'lucide-react';
import { 
  auth, 
  db, 
  storage, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  doc, 
  setDoc, 
  getDoc, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from '../services/firebase';
import { saveUserToNeon } from '../services/neon';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhoto(null);
      setPhotoPreview('');
      setError('');
      setSuccessMessage('');
      setVerificationSent(false);
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setIsResetPassword(false);
      resetForm();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Determine Role
        let role: 'CUSTOMER' | 'FIXER' | 'ADMIN' | 'SUPER_ADMIN' = 'CUSTOMER';
        if (user.email === 'jesicar1100@gmail.com') {
            role = 'SUPER_ADMIN';
        }

        const userData = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: role,
            avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`,
            createdAt: new Date().toISOString()
        };

        // Try Firestore save (non-blocking)
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, userData);
            }
        } catch (fsError) {
            console.warn("Firestore operation skipped due to permissions:", fsError);
        }

        // Save to Neon
        await saveUserToNeon({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            created_at: userData.createdAt,
            phone: '',
            address: ''
        });

        // App.tsx onAuthStateChanged will handle the rest
    } catch (err: any) {
        console.error("Google Auth Error", err);
        setError(err.message || "Failed to sign in with Google.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Please enter your email address.");
          return;
      }
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      try {
          await sendPasswordResetEmail(auth, email);
          setSuccessMessage(`Password reset link sent to ${email}`);
      } catch (err: any) {
          console.error("Reset Password Error", err);
          if (err.code === 'auth/user-not-found') {
              setError("No user found with this email address.");
          } else {
              setError(err.message || "Failed to send reset email.");
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
        if (isLogin) {
            // --- LOGIN LOGIC ---
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                throw new Error("Please verify your email address to log in.");
            }

            // Navigate handled by App.tsx listener
        } else {
            // --- SIGN UP LOGIC ---
            
            // 1. Validation
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters.");
            }

            // 2. Create Authentication User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let photoURL = `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`;

            // 3. Upload Photo if selected
            if (photo) {
                try {
                    const storageRef = ref(storage, `profile_photos/${user.uid}`);
                    await uploadBytes(storageRef, photo);
                    photoURL = await getDownloadURL(storageRef);
                } catch (uploadErr) {
                    console.error("Photo upload failed", uploadErr);
                }
            }

            // 4. Update Auth Profile
            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL
            });

            // Determine Role
            let role: 'CUSTOMER' | 'FIXER' | 'ADMIN' | 'SUPER_ADMIN' = 'CUSTOMER';
            if (email === 'jesicar1100@gmail.com') {
                role = 'SUPER_ADMIN';
            }

            const userData = {
                id: user.uid,
                name: name,
                email: email,
                role: role, 
                avatar: photoURL,
                createdAt: new Date().toISOString()
            };

            // 5. Save User Data to Database (Firestore) - Non-blocking / Safe
            try {
                 await setDoc(doc(db, "users", user.uid), userData);
            } catch (fsError) {
                console.warn("Firestore save skipped:", fsError);
            }

            // Save to Neon
            await saveUserToNeon({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                avatar: userData.avatar,
                created_at: userData.createdAt,
                phone: '',
                address: ''
            });

            // 6. Send Verification Email & Sign Out (Do not auto-login)
            await sendEmailVerification(user);
            await signOut(auth);
            
            setVerificationSent(true);
            setIsLoading(false);
            return; // Stop here to show verification screen
        }
    } catch (err: any) {
        console.error("Auth Error", err);
        
        // Error Mapping
        if (err.message === "Passwords do not match." || err.message === "Password must be at least 6 characters.") {
             setError(err.message);
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError("Password or Email Incorrect");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("User already exists. Sign in?");
        } else if (err.code === 'auth/weak-password') {
            setError("Password should be at least 6 characters.");
        } else if (err.message.includes("verify your email")) {
             setError(err.message);
        } else {
            setError(err.message || "Authentication failed. Please try again.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  // Verification Screen
  if (verificationSent) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Verify your email</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        We have sent you a verification email to <span className="font-bold text-slate-900 dark:text-white">{email}</span>. Verify it and log in.
                    </p>
                    <Button 
                        onClick={() => { 
                            setVerificationSent(false); 
                            setIsLogin(true); 
                            // Reset password fields but keep email for easier login
                            setPassword('');
                            setConfirmPassword('');
                            setPhoto(null);
                            setPhotoPreview('');
                            setError('');
                            setSuccessMessage('');
                        }} 
                        className="w-full"
                    >
                        Login
                    </Button>
                </Card>
            </div>
        </div>
      );
  }

  // Reset Password Screen
  if (isResetPassword) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-blucell-100 dark:bg-blucell-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-6 h-6 text-blucell-600" />
                        </div>
                        <h2 className="text-2xl font-bold">Reset Password</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                            Enter your email and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-4">
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

                         {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 animate-fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 animate-fade-in">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send Reset Link
                        </Button>

                        <button 
                            type="button" 
                            onClick={() => { setIsResetPassword(false); setError(''); setSuccessMessage(''); }}
                            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mt-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </button>
                    </form>
                </Card>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join BLUCELL'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isLogin ? 'Enter your credentials to access your account' : 'Create your profile to start buying & fixing'}
          </p>
        </div>

        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Sign Up Specific Fields */}
            {!isLogin && (
              <div className="space-y-5 animate-fade-in">
                {/* Photo Upload */}
                <div className="flex justify-center mb-4">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="absolute bottom-0 right-0 bg-blucell-600 text-white p-1.5 rounded-full shadow-lg">
                            <Upload className="w-3 h-3" />
                        </div>
                    </div>
                </div>

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
              </div>
            )}
            
            {/* Common Fields */}
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
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                 {isLogin && (
                     <button 
                        type="button" 
                        onClick={() => { setIsResetPassword(true); setError(''); setSuccessMessage(''); }}
                        className="text-xs font-medium text-blucell-600 hover:text-blucell-500 hover:underline"
                     >
                         Forgot Password?
                     </button>
                 )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Repeat Password for Sign Up */}
            {!isLogin && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repeat Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isLogin}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                    {error.includes("Sign in?") && (
                        <button 
                            type="button" 
                            onClick={toggleMode} 
                            className="ml-auto font-bold underline hover:text-red-800 dark:hover:text-red-400"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                 <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 animate-fade-in">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <Button type="submit" className="w-full text-lg py-6" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-silver-surface-dark text-slate-500">Or continue with</span>
                </div>
            </div>

            <Button 
                type="button" 
                variant="secondary" 
                className="w-full py-3 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
                onClick={handleGoogleLogin}
                isLoading={isLoading}
            >
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={toggleMode}
                className="ml-2 font-bold text-blucell-600 hover:text-blucell-500 transition-colors"
                type="button"
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
