import { createContext, useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from './baseurl';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WarningPopup from './components/warningPopup';

export const socketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);  
  const [socket,setSocket]=useState(null)
  const socketRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const localStream=useRef()
  const navigate=useNavigate()
const [popupData,setPopupData]=useState({
  warnings:0,
  userId:''
})

  const peers=useRef({});
  useEffect(() => {
    const socket = io(BASE_URL);

    console.log("SOCKET")
    console.log(socket)
    setSocket(socket)
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on("handleWarning",()=>{
      console.log("HANDLEWARNING")
      setShowWarning(true)
    })

let token=localStorage.getItem('token')
   if(token){
    getProfile();
   }
   socket.on("handleUserStatus",(data)=>{
    console.log("HANDLEUSERSTATUS")
    console.log(data)
    setProfile((prev)=>{
      let old=prev;
      old={
        ...old,
        status:data.status
      }
      return old
    })
    if(data.status=="Banned"){
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      setShowWarning(true)
    }
   })

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(`${BASE_URL}/getProfile`, headers);
      console.log("PROFILE")
      console.log(res.data)
if(res.data.user){
  setPopupData({
    userId:res.data.user._id,
    warnings:res.data.user.warnings
  })
let result=Number(res.data.user.warnings)-Number(res.data.user.prevWarnings)
if(result>0){
  setShowWarning(true)
}
}

      let data={
        ...res.data.user,
        subscription:res.data.subscription
      }
     
      socketRef?.current?.emit("connectUser",{email:res.data.user.email,userName:data.userName})
      socketRef.current.on("manualMatch",async(data)=>{

 
   let response=await axios.get(`${BASE_URL}/getCodeAndToken/${data.liveStreamRoomId}/broadcaster`)

   localStorage.setItem('authToken',response.data.token)
      navigate('/livegame')
      })
      setProfile(data);
      // socketRef?.current?.emit("manualMatch")
  
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  return (
    <socketContext.Provider value={{socket,socketRef, profile, localStream, peers }}>
      {children}

      {showWarning?<WarningPopup popupData={popupData} showWarning={showWarning} setShowWarning={setShowWarning}/>:''}
    </socketContext.Provider>
  );
};
