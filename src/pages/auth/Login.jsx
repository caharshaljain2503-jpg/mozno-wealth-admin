import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAdminLogin, useSendOtp, useVerifyOtp } from '../../api/hooks/useAdmin'
import { useAuth } from '../../context/AuthContext'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-script'
const RECAPTCHA_ONLOAD_CALLBACK = '__moznoAdminRecaptchaOnLoad'

function getRememberedCredentials() {
  if (typeof window === 'undefined') {
    return { email: '', rememberMe: false }
  }
  try {
    const savedEmail = localStorage.getItem('savedEmail')
    const savedRemember = localStorage.getItem('rememberMe') === 'true'
    if (savedEmail && savedRemember) {
      return { email: savedEmail, rememberMe: true }
    }
  } catch {
    /* localStorage unavailable */
  }
  return { email: '', rememberMe: false }
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // State for login form
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(() => getRememberedCredentials().email)
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(
    () => getRememberedCredentials().rememberMe
  )
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState('')
  
  // State for 2FA
  const [step, setStep] = useState('login')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  
  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Refs to track if OTP has been sent
  const otpSentRef = useRef(false);
  const recaptchaContainerRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      navigate(from, { replace: true })
    }
  }, [navigate, from])

  // Login Mutation
  const loginMutation = useAdminLogin({
    onSuccess: (data) => {
      const token = data?.token || data?.data?.token;
      login(token, rememberMe);
      setSuccess('Login successful! Redirecting...');
      setIsLoading(false);

      // Two-factor verification is currently bypassed for direct admin access.
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    },
    onError: (error) => {
      // Show user-friendly error messages
      if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Security check failed. Please try again.');
        resetRecaptcha();
      } else if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
        resetRecaptcha();
      } else if (error.response?.status === 404) {
        setError('Account not found. Please check your email.');
      } else if (error.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (!error.response) {
        setError('Unable to connect to server. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
      
      setIsLoading(false);
    }
  });

  // Send OTP Mutation
  const sendOtpMutation = useSendOtp({
    onSuccess: () => {
      setSuccess('Verification code sent to your email.');
      setIsLoading(false);
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        setError('Too many OTP requests. Please wait a few minutes.');
      } else if (error.response?.status === 404) {
        setError('Email not registered. Please contact support.');
        handleBackToLogin();
      } else {
        setError('Failed to send verification code. Please try again.');
      }
      setIsLoading(false);
    }
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useVerifyOtp({
    onSuccess: (data) => {
      // Update token after OTP verification
      login(data.token, rememberMe);
      
      setSuccess('Verification successful! Redirecting...');
      setIsLoading(false);
      
      // Redirect to original destination or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        setError('Invalid verification code. Please try again.');
      } else if (error.response?.status === 400) {
        setError('Code expired. Please request a new one.');
        setOtp(['', '', '', '', '', '']);
      } else {
        setError('Verification failed. Please try again.');
      }
      setIsLoading(false);
    }
  });

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken('');
    if (
      window.grecaptcha &&
      recaptchaWidgetIdRef.current !== null
    ) {
      window.grecaptcha.reset(recaptchaWidgetIdRef.current);
    }
  }, []);

  const renderRecaptcha = useCallback(() => {
    if (
      !RECAPTCHA_SITE_KEY ||
      !recaptchaContainerRef.current ||
      !window.grecaptcha?.render ||
      recaptchaWidgetIdRef.current !== null
    ) {
      return;
    }

    const mountWidget = () => {
      if (!recaptchaContainerRef.current || recaptchaWidgetIdRef.current !== null) {
        return;
      }

      try {
        recaptchaWidgetIdRef.current = window.grecaptcha.render(
          recaptchaContainerRef.current,
          {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: 'dark',
            callback: (token) => {
              setRecaptchaToken(token);
              setRecaptchaError('');
              setError('');
            },
            'expired-callback': () => {
              setRecaptchaToken('');
              setRecaptchaError('CAPTCHA expired. Please verify again.');
            },
            'error-callback': () => {
              setRecaptchaToken('');
              setRecaptchaError('CAPTCHA could not load. Please refresh the page.');
            },
          },
        );
        setRecaptchaReady(true);
        setRecaptchaError('');
      } catch (error) {
        console.error('Failed to render Google CAPTCHA:', error);
        setRecaptchaReady(false);
        setRecaptchaError('Google CAPTCHA could not render. Please refresh the page.');
      }
    };

    if (window.grecaptcha.ready) {
      window.grecaptcha.ready(mountWidget);
    } else {
      mountWidget();
    }
  }, []);

  useEffect(() => {
    if (step !== 'login') {
      recaptchaWidgetIdRef.current = null;
      setRecaptchaToken('');
      setRecaptchaReady(false);
      return;
    }

    if (!RECAPTCHA_SITE_KEY) {
      setRecaptchaError('Google CAPTCHA site key is missing.');
      return;
    }

    let timeoutId;

    const handleScriptLoad = () => {
      renderRecaptcha();
    };

    const handleScriptError = () => {
      setRecaptchaReady(false);
      setRecaptchaError('Google CAPTCHA failed to load. Please refresh the page.');
    };

    window[RECAPTCHA_ONLOAD_CALLBACK] = handleScriptLoad;

    timeoutId = window.setTimeout(() => {
      if (recaptchaWidgetIdRef.current === null) {
        setRecaptchaReady(false);
        setRecaptchaError(
          'Google CAPTCHA is not loading. Check that the site key is reCAPTCHA v2 checkbox and allowed for localhost.',
        );
      }
    }, 10000);

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
    if (window.grecaptcha?.render) {
      handleScriptLoad();
      return () => {
        window.clearTimeout(timeoutId);
        delete window[RECAPTCHA_ONLOAD_CALLBACK];
      };
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);
      return () => {
        window.clearTimeout(timeoutId);
        existingScript.removeEventListener('load', handleScriptLoad);
        existingScript.removeEventListener('error', handleScriptError);
        delete window[RECAPTCHA_ONLOAD_CALLBACK];
      };
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?onload=${RECAPTCHA_ONLOAD_CALLBACK}&render=explicit`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);
    document.body.appendChild(script);

    return () => {
      window.clearTimeout(timeoutId);
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);
      delete window[RECAPTCHA_ONLOAD_CALLBACK];
    };
  }, [step, renderRecaptcha]);

  // Auto-send OTP when entering 2FA step if not sent yet
  useEffect(() => {
    if (step !== '2fa' || otpSentRef.current || !email) return

    otpSentRef.current = true
    sendOtpMutation.mutate({ email })

    queueMicrotask(() => {
      setSuccess('Sending verification code...')
      setCountdown(300)
    })
  }, [step, email, sendOtpMutation])

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Reset loading state when mutations settle
  useEffect(() => {
    if (
      loginMutation.isPending ||
      sendOtpMutation.isPending ||
      verifyOtpMutation.isPending
    ) {
      return
    }
    queueMicrotask(() => {
      setIsLoading(false)
    })
  }, [
    loginMutation.isPending,
    sendOtpMutation.isPending,
    verifyOtpMutation.isPending,
  ])

  // Form validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle login submission
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Validation
    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (!RECAPTCHA_SITE_KEY) {
      setError('Google CAPTCHA site key is missing.');
      setIsLoading(false);
      return;
    }

    if (!recaptchaToken) {
      setError('Please complete the Google CAPTCHA.');
      setIsLoading(false);
      return;
    }
    
    // Reset OTP sent flag
    otpSentRef.current = false;
    
    // Call login API
    loginMutation.mutate({
      email,
      password,
      recaptchaToken,
    });
  }

  // Handle OTP change
  const handleOtpChange = (index, value) => {
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }

    // Auto-focus previous input on backspace
    if (value === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedCode.length === 6) {
      const newOtp = pastedCode.split('');
      setOtp(newOtp);
      
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    verifyOtpMutation.mutate({ email, otp: otpCode });
  }

  // Handle resend OTP
  const handleResendOtp = () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('Sending new verification code...');
    
    sendOtpMutation.mutate({ email });
    setOtp(['', '', '', '', '', '']);
    setCountdown(300);
  }

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Go back to login step
  const handleBackToLogin = () => {
    setStep('login');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    setCountdown(0);
    otpSentRef.current = false;
    
    // Reset mutations
    loginMutation.reset();
    sendOtpMutation.reset();
    verifyOtpMutation.reset();
  }

  // Determine if any mutation is pending
  const isAnyLoading = loginMutation.isPending || sendOtpMutation.isPending || verifyOtpMutation.isPending || isLoading;

  // Check if OTP is complete
  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 border-b border-gray-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm sm:text-lg">M</span>
          </div>
          <span className="font-semibold text-black dark:text-white text-sm sm:text-base">
            Mozno Advisory
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-xs sm:text-sm text-gray-500 dark:text-neutral-500">
            Secure Access Only
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[400px] sm:max-w-[480px]">
          
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              {step === '2fa' ? (
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
              {step === 'login' ? "Sign in to Admin Portal" : "Two-Factor Verification"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500">
              {step === 'login' 
                ? "Welcome back! Enter your credentials to continue." 
                : "Enter the 6-digit code sent to your email"}
            </p>
            {step === '2fa' && email && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500 mt-2">
                Code sent to <span className="font-medium">{email.replace(/(.{3})(.*)(?=@)/, '$1***')}</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 text-center">
                {success}
              </p>
            </div>
          )}

          {/* Login Form */}
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    className="w-full h-10 sm:h-11 pl-10 pr-4 text-sm rounded-md
                      bg-white dark:bg-transparent
                      border border-gray-300 dark:border-neutral-800
                      text-gray-900 dark:text-white
                      placeholder:text-gray-400 dark:placeholder:text-neutral-600
                      focus:outline-none focus:ring-2 
                      focus:ring-gray-900/10 dark:focus:ring-white/10
                      focus:border-gray-400 dark:focus:border-neutral-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200"
                    required
                    disabled={isAnyLoading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full h-10 sm:h-11 pl-10 pr-10 text-sm rounded-md
                      bg-white dark:bg-transparent
                      border border-gray-300 dark:border-neutral-800
                      text-gray-900 dark:text-white
                      placeholder:text-gray-400 dark:placeholder:text-neutral-600
                      focus:outline-none focus:ring-2 
                      focus:ring-gray-900/10 dark:focus:ring-white/10
                      focus:border-gray-400 dark:focus:border-neutral-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200"
                    required
                    disabled={isAnyLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                      text-gray-400 dark:text-neutral-600 
                      hover:text-gray-600 dark:hover:text-neutral-400 
                      transition-colors disabled:opacity-50"
                    disabled={isAnyLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Captcha Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300">
                  Security Check
                </label>
                <div className="min-h-[78px]">
                  <div ref={recaptchaContainerRef} />
                  {!recaptchaReady && !recaptchaError && (
                    <div className="h-[78px] w-[304px] max-w-full rounded-md border border-gray-300 dark:border-neutral-800 flex items-center justify-center text-xs text-gray-500 dark:text-neutral-500">
                      Loading Google CAPTCHA...
                    </div>
                  )}
                </div>
                {recaptchaError && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {recaptchaError}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-200 ${
                    rememberMe
                      ? "bg-black dark:bg-white border-black dark:border-white"
                      : "border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600"
                  }`}
                  disabled={isAnyLoading}
                >
                  {rememberMe && (
                    <svg
                      className="w-2.5 h-2.5 text-white dark:text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 cursor-pointer select-none"
                  onClick={() => !isAnyLoading && setRememberMe(!rememberMe)}
                >
                  Remember me for 30 days
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnyLoading || !recaptchaToken}
                className="w-full h-10 sm:h-11 rounded-md text-sm font-medium
                  bg-black dark:bg-white 
                  text-white dark:text-black
                  hover:bg-gray-800 dark:hover:bg-gray-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-gray-900 dark:focus:ring-white
                  focus:ring-offset-white dark:focus:ring-offset-black
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-6 sm:space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-4 text-center">
                  Enter 6-digit verification code
                </label>
                <div 
                  className="flex justify-center gap-2 sm:gap-3 mb-6"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold
                        rounded-lg border-2 
                        bg-white dark:bg-transparent
                        border-gray-300 dark:border-neutral-700
                        text-gray-900 dark:text-white
                        focus:border-blue-500 dark:focus:border-blue-400
                        focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30
                        outline-none transition-all duration-200
                        disabled:opacity-50"
                      disabled={isAnyLoading || sendOtpMutation.isPending}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-neutral-500">
                  {sendOtpMutation.isPending 
                    ? 'Sending verification code...' 
                    : 'Enter the 6-digit code sent to your email'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {countdown > 0 ? (
                      <span className="text-gray-500 dark:text-neutral-500">
                        Resend code in {formatTime(countdown)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isAnyLoading || sendOtpMutation.isPending}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                          disabled:text-gray-400 dark:disabled:text-neutral-600 
                          transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${sendOtpMutation.isPending ? 'animate-spin' : ''}`} />
                        {sendOtpMutation.isPending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={isAnyLoading}
                    className="text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white 
                      transition-colors disabled:opacity-50"
                  >
                    ← Back
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAnyLoading || !isOtpComplete || sendOtpMutation.isPending || verifyOtpMutation.isPending}
                  className="w-full h-11 rounded-md text-sm font-medium
                    bg-black dark:bg-white 
                    text-white dark:text-black
                    hover:bg-gray-800 dark:hover:bg-gray-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-gray-900 dark:focus:ring-white
                    focus:ring-offset-white dark:focus:ring-offset-black
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center justify-center gap-2"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-neutral-500">
                  Check your email for the 6-digit code. The code expires in 5 minutes.
                </p>
              </div>
            </form>
          )}

          {/* Divider (only shown on login step) */}
          {step === 'login' && (
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-gray-400 dark:text-neutral-600 bg-white dark:bg-black">
                  Protected by Mozno Security
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-neutral-800 px-4 sm:px-6 h-12 sm:h-14 flex items-center">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs text-gray-400 dark:text-neutral-600">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/docs"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              to="/support"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
          <span>© {new Date().getFullYear()} Mozno Advisory. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default Login
