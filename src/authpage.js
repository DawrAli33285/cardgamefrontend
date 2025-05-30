import React, { useState, useRef, useEffect } from 'react';
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
  const adRef = useRef(null);
  const containerRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  const navigate = useNavigate();

  const discordLoginParams = {
    clientId: '1353009606363709480',
    redirectUri: 'https://cardgamefrontend-xtuk.vercel.app/signin',
    responseType: 'token', 
    scopes: ['identify', 'email'],
    onSuccess: response => {
      console.log('res');
      console.log(response);
      let avatar = `https://cdn.discordapp.com/avatars/${response.user.id}/${response.avatar}.png`;
      let data = {
        userName: response.user.username,
        avatar,
        email: response.user.email
      };
      authenticate(data, true);
    },
    onFailure: error => {
      console.error('Login failed:', error);
    },
  };

  const authenticate = async (data, login) => {
    console.log(data);
    try {
      if (login) {
        let res = await axios.post(`${BASE_URL}/login`, data);
        toast.success(res.data.message, { containerId: 'authPage' });
        console.log(res);
        localStorage.setItem('token', res.data.token);
        window.location.href = '/';
      } else {
        let res = await axios.post(`${BASE_URL}/register`, data);
        toast.success(res.data.message, { containerId: "authPage" });
      }
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      if (e?.response?.data?.error) {
        toast.error(e?.response?.data?.error, { containerId: "authPage" });
      } else {
        toast.error("Something went wrong, please try again", { containerId: "authPage" });
      }
    }
  };

  const { buildUrl, isLoading } = useDiscordLogin(discordLoginParams);

  useEffect(() => { 
    const loadAd = () => {
      try {
        if (window.adsbygoogle && !adRef.current?.hasAttribute('data-adsbygoogle-status')) {
          // Check container dimensions
          if (containerRef.current.offsetWidth > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          } else {
            // Retry after 100ms if container not ready
            setTimeout(loadAd, 100);
          }
        }
      } catch (e) {
        console.error('AdSense error:', e);
        // Retry after 500ms on error
        setTimeout(loadAd, 500);
      }
    };

    // Only load the script once
    const isScriptLoaded = document.querySelector(
      'script[src*="pagead/js/adsbygoogle.js"]'
    );

    if (!isScriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3780432206906063';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        // Wait for container to render
        setTimeout(loadAd, 300);
      };
      document.head.appendChild(script);
    } else {
      // Script already exists, just load the ad
      setTimeout(loadAd, 300);
    }

    return () => {
      const script = document.querySelector('script[src*="pagead/js/adsbygoogle.js"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <ToastContainer containerId="authPage" />
      
      <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-gradient-to-br from-green-500 to-emerald-700 min-h-[95vh] lg:min-h-[95vh] flex flex-col justify-center items-center'>
        <div className="w-full max-w-4xl mb-10">
          <h1 className="text-3xl font-bold text-white text-center mb-4">Welcome to Card Game</h1>
          <p className="text-white text-center mb-8">
            Sign in with Discord to start playing
          </p>
          
          <div className="bg-white rounded-xl shadow-2xl p-6 transition-all hover:shadow-lg">
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-center">Discord Sign In</h2>
                <p className="text-gray-600 text-center mb-4">
                  Fast and secure authentication with your Discord account
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <a 
                  href={buildUrl()} 
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.83 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"/>
                  </svg>
                  Sign in with Discord
                </a>
              )}
            </div>
          </div>
          
          <div className="text-center text-white mt-6">
            <p className="text-sm">By signing in, you agree to our <a href="#" className="text-blue-200 hover:underline">Terms of Service</a></p>
          </div>
        </div>
        
        {/* Ad Container with proper dimensions */}
        <div 
          ref={containerRef}
          className={`w-full max-w-4xl rounded-lg overflow-hidden transition-all duration-500 ${adLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ minWidth: '320px', minHeight: '100px' }}
        >
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3780432206906063"
            data-ad-slot="9178191838"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </>
  );
};

export default AuthPage;