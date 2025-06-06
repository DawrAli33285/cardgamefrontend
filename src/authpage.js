import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import { useDiscordLogin } from 'react-discord-login';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './baseurl';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const adRef = useRef(null);
  const navigate = useNavigate();

  // Set current URL safely after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
      }
    }, []),
  });

  const authenticate = useCallback(async (data, login) => {
    console.log('Authenticating with data:', data);
    try {
      if (login) {
        const res = await axios.post(`${BASE_URL}/login`, data);
        toast.success(res.data.message, { containerId: 'authPage' });
        console.log('Login response:', res);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        const res = await axios.post(`${BASE_URL}/register`, data);
        toast.success(res.data.message, { containerId: 'authPage' });
      }
    } catch (e) {
      console.error('Authentication error:', e);
      if (e?.response?.data?.error) {
        toast.error(e.response.data.error, { containerId: 'authPage' });
      } else {
        toast.error('Something went wrong. Please try again.', { containerId: 'authPage' });
      }
    }
  }, [navigate]);

  const discordLoginParams = {
    clientId: '1353009606363709480',
    redirectUri: 'https://cardgamefrontend-xtuk.vercel.app/signin',
    responseType: 'token',
    scopes: ['identify', 'email'],
    onSuccess: (response) => {
      console.log('Discord login success:', response);
      const avatar = `https://cdn.discordapp.com/avatars/${response.user.id}/${response.avatar}.png`;
      const data = {
        userName: response.user.username,
        avatar,
        email: response.user.email
      };
      authenticate(data, true);
    },
    onFailure: (error) => {
      console.error('Discord login failed:', error);
      toast.error('Discord login failed. Please try again.', { containerId: 'authPage' });
    },
  };

  const discordLogin = useDiscordLogin(discordLoginParams);

  // Function to load AdSense ads with better error handling
  const loadAds = useCallback(() => {
    try {
      // Check if adsbygoogle is available
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // Check if ad container exists and is visible
        if (adRef.current) {
          console.log('Loading AdSense ad...');
          console.log('Ad container dimensions:', {
            width: adRef.current.offsetWidth,
            height: adRef.current.offsetHeight,
            visible: adRef.current.offsetParent !== null
          });
          
          // Push ad configuration
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
          console.log('AdSense ad loaded successfully');
          
          // Listen for ad load events
          setTimeout(() => {
            const adElements = document.querySelectorAll('ins.adsbygoogle');
            adElements.forEach((ad, index) => {
              console.log(`Ad ${index} status:`, {
                'data-adsbygoogle-status': ad.getAttribute('data-adsbygoogle-status'),
                'data-ad-status': ad.getAttribute('data-ad-status')
              });
            });
          }, 3000);
        }
      } else {
        console.warn('AdSense script not loaded yet');
        // Retry after a short delay
        setTimeout(loadAds, 1000);
      }
    } catch (error) {
      console.error('Error loading AdSense ads:', error);
      // Log more details about the error
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        adContainer: adRef.current ? 'exists' : 'missing'
      });
    }
  }, []);

  useEffect(() => {
    // Load AdSense script if not already loaded
    const loadAdSenseScript = () => {
      if (typeof window === 'undefined') return;
      
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3780432206906063';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          console.log('AdSense script loaded');
          // Small delay to ensure script is fully initialized
          setTimeout(loadAds, 500);
        };
        
        script.onerror = () => {
          console.error('Failed to load AdSense script');
        };
        
        document.head.appendChild(script);
      } else {
        // Script already exists, just load ads
        loadAds();
      }
    };

    loadAdSenseScript();
  }, [loadAds]);

  const handleDiscordLogin = useCallback(() => {
    if (discordLogin.buildUrl && !discordLogin.isLoading) {
      window.open(discordLogin.buildUrl(), '_self');
    }
  }, [discordLogin.buildUrl, discordLogin.isLoading]);

  const toggleLoginMode = useCallback(() => {
    setIsLogin(prev => !prev);
  }, []);

  return (
    <>
      <ToastContainer containerId="authPage" />
      
      <div className="w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] lg:min-h-[95vh] flex flex-col justify-center items-center">
        
        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          
          {/* Discord Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={discordLogin.isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {discordLogin.isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                <span>Continue with Discord</span>
              </>
            )}
          </button>
          
          <div className="text-center">
            <button
              onClick={toggleLoginMode}
              className="text-[#2cac4f] hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* AdSense Ad Container with debugging info */}
        <div className="w-full max-w-4xl">
          <div className="text-center text-white text-sm mb-2">
            Advertisement
          </div>
          <div 
            ref={adRef}
            className="ad-container bg-gray-100 rounded-lg overflow-hidden border"
            style={{ minHeight: '250px', maxWidth: '100%' }}
          >
            <ins
              className="adsbygoogle"
              style={{
                display: 'block',
                width: '100%',
                height: '250px',
                backgroundColor: '#f0f0f0'
              }}
              data-ad-client="ca-pub-3780432206906063"
              data-ad-slot="9178191838"
              data-ad-format="rectangle"
              data-ad-layout="in-article"
              data-full-width-responsive="false"
            />
          </div>
          
          {/* Ad loading/error indicator */}
          <div className="text-center mt-2 text-white text-xs">
            {!adLoaded ? (
              <span>Loading advertisement...</span>
            ) : (
              <span>Ad loaded - Check browser console for status</span>
            )}
          </div>
          
          {/* Debug info */}
          {currentUrl && (
            <div className="text-center mt-2 text-white text-xs opacity-75">
              Current URL: {currentUrl}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthPage;