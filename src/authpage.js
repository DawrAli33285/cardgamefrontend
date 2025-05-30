import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import { useDiscordLogin, UseDiscordLoginParams } from 'react-discord-login';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from './baseurl';
import {useRef,useEffect} from 'react'  



const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const adRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  const navigate=useNavigate();

  const discordLoginParams = {
    clientId: '1353009606363709480',
    redirectUri: 'https://cardgamefrontend-xtuk.vercel.app/signin',
    responseType: 'token', 
    scopes: ['identify', 'email'],
    onSuccess: response => {
      console.log('res')
      console.log(response)
    let avatar=`https://cdn.discordapp.com/avatars/${response.user.id}/${response.avatar}.png`
   let data={
    userName:response.user.username,
    avatar,
    email:response.user.email
   }
   authenticate(data,true)
    },
    onFailure: error => {
      
        console.error('Login failed:', error);
    },
};

const authenticate=async(data,login)=>{
  console.log(data)
  try{
if(login){
  let res=await axios.post(`${BASE_URL}/login`,data)
  toast.success(res.data.message,{containerId:'authPage'})
  console.log(res)
  localStorage.setItem('token',res.data.token)
  window.location.href='/'
}else{
  let res=await axios.post(`${BASE_URL}/register`,data)
  toast.success(res.data.message,{containerId:"authPage"})
}
  }catch(e){
    console.log("ERROR")
    console.log(e)
    if(e?.response?.data?.error){
      toast.error(e?.response?.data?.error,{containerId:"authPage"})
    }else{
      toast.error("something went wrong please try again",{containerId:"authPage"})
    }
  }
}

const { buildUrl, isLoading } = useDiscordLogin(discordLoginParams);




useEffect(() => { 
  const loadAd = () => {
    try {
      if (window.adsbygoogle && !adRef.current?.hasAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  };
  

  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3780432206906063';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = loadAd;
  
  document.head.appendChild(script);
  
  return () => {
    if (document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };
}, []);

  return (
   <>
   <ToastContainer containerId="authPage"/>

   <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] lg:min-h-[95vh] flex justify-center items-center'>
   <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block',width:'100%',height:'100%'}}
        data-ad-client="ca-pub-3780432206906063"
        data-ad-slot="7789922698"
        data-ad-format="auto"
        title="ads"
        data-full-width-responsive="true"
      ></ins>
    </div>
   </>
  );
};

export default AuthPage;