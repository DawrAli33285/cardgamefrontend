import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import { useDiscordLogin } from 'react-discord-login';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './baseurl';

const GoogleAd = () => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (window.adsbygoogle && !adRef.current?.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (e) {
        console.error('AdSense error:', e);
        // Retry after 1 second
        setTimeout(loadAd, 1000);
      }
    };

    // Only load the script once
    if (!document.querySelector('script[src*="pagead/js/adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3780432206906063';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        // Wait for the container to be rendered
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
    <div className={`ad-container w-full transition-opacity duration-500 ${adLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3780432206906063"
        data-ad-slot="7789922698"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
    },
  });

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

  return (
    <>
      <ToastContainer containerId="authPage" />
      <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] lg:min-h-[95vh] flex flex-col justify-center items-center'>
        <div className="w-full max-w-4xl mb-10">
          <h1 className="text-3xl font-bold text-white text-center mb-4">Authentication Required</h1>
          <p className="text-white text-center mb-8">
            Please sign in with Discord to access the full features of our platform
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Sign in with Discord</h2>
                <p className="mb-4">
                  Securely authenticate using your Discord account to access your personalized dashboard.
                </p>
                
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <a 
                    href={buildUrl()} 
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.83 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"/>
                    </svg>
                    Continue with Discord
                  </a>
                )}
              </div>
              
              <div className="md:w-1/2 border-l md:pl-8">
                <h2 className="text-xl font-semibold mb-4">Email Sign In</h2>
                <p className="mb-4">
                  Sign in with your email address and password to access your account.
                </p>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="text-center text-white mb-8">
            <p>Don't have an account? <button className="text-blue-200 hover:underline">Sign up here</button></p>
          </div>
        </div>
        
        <div className="w-full max-w-4xl mt-8">
          <GoogleAd />
        </div>
      </div>
    </>
  );
};

export default AuthPage;