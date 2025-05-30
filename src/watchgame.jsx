import Header from "./components/header";
import { useContext, useEffect, useRef, useState } from 'react';
import { socketContext } from "./socketContext";
import Peer from './Peer'
import axios from "axios";
import { useHMSActions } from "@100mslive/react-sdk";
import { useLocation } from "react-router-dom";
import { selectPeers, useHMSStore } from "@100mslive/react-sdk";
import { BASE_URL } from "./baseurl";
import { useHMSNotifications } from "@100mslive/react-sdk";


export default function Watchgame() {
    const hmsActions = useHMSActions();
     const peers = useHMSStore(selectPeers);
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);
    const [data,setData]=useState([])
    const {socketRef,profile}=useContext(socketContext)
    const [spectatorMessages,setSpectatorMessages]=useState([])
    const [rightMessage,setRightMessage]=useState("")
    const location=useLocation();
    const [messages,setMessages]=useState([])
    const notifications = useHMSNotifications();

useEffect(()=>{
if(profile){
    joinRoom();
}
},[profile])
useEffect(() => {
    window.onunload = () => {
      hmsActions.leave();
    };
  }, [hmsActions]);


useEffect(() => {
    if (notifications?.type === 'PEER_LEFT') {
        const peer = notifications.data;
        if (peer.roleName === 'broadcaster') {
            hmsActions.leave();
            window.location.href = "/";
        } else {
            alert(`${peer.name} left the stream`);
        }
    }
}, [notifications, hmsActions]);


const sendMessage=async()=>{
    try{
        let params=new URLSearchParams(location.search)
        let socketId=params.get('playerOne')
        let data={
            ...profile,
            message:rightMessage,
            socketId

        }
        socketRef?.current?.emit("sendSpectatorMessage",data)
       setRightMessage("")
    }catch(e){
    
    }
    }


useEffect(()=>{
if(socketRef?.current){
    console.log("SOCKET WORKING")
    socketRef?.current?.on("sendSpectatorMessage",(data)=>{
        setSpectatorMessages((prev)=>{
            let old=[...prev]
            old=[...old,{...data, color: 'text-blue-500'}]
            return old
        })
    })
    let params=new URLSearchParams(location.search)
    let playerOne=params.get('playerOne')
    socketRef?.current?.emit("liveStream",playerOne)
    socketRef?.current?.on("spectatorleave",()=>{
        alert("Match ended")
        hmsActions.leave();
        window.location.href="/"
    })

    socketRef?.current?.on("sendMessage",(data)=>{
        console.log("message recieved")
        console.log(data)
setMessages((prev)=>{
    let old=[...prev]
    old=[...old,{...data, color: 'text-green-500'}]
    return old
})
    })
}
},[socketRef?.current])


const joinRoom=async()=>{
   try{
    let params=new URLSearchParams(location.search)
    let liveStreamRoomId=params.get('liveStreamRoomId')
    console.log("liveStreamRoomId")
    console.log(liveStreamRoomId)
    let response=await axios.get(`${BASE_URL}/getCodeAndToken/${liveStreamRoomId}/viewer-realtime`)
    let authToken=response.data.token
    console.log('authToken')
    console.log(authToken)
    await hmsActions.join({ userName:profile.userName, authToken:authToken});
   }catch(e){
console.log(e.message)
console.log("JOINROOM ERROR")
   }
}

    return (
        <div className="w-full p-[20px] relative">
            <Header />



          
            <div className="w-full bg-green-700 lg:p-[20px] mt-[10px] min-h-[800px] flex gap-[20px] relative">
                <div className="md:hidden flex justify-between mb-4 absolute top-0 left-0 w-full z-[9999]">
                    <button
                        onClick={() => setLeftOpen(!leftOpen)}
                        className="bg-black p-2 rounded flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-white">Players</span>
                    </button>
                    <button
                        onClick={() => setRightOpen(!rightOpen)}
                        className="bg-black p-2 rounded flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white">Chat</span>
                    </button>
                </div>
                
                <div className={`md:flex flex-col w-80 bg-black p-4 ${leftOpen ? 'absolute left-0 top-0 h-full z-50' : 'hidden'}`}>
                    

                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg.color} font-bold`}>{msg?.by}: </span>
                                <span className="text-white font-bold">{msg?.message}</span>
                            </div>
                        ))}
                    </div>

                   
                </div>

                <div id="videoContainer" className="flex-grow text-center bg-black relative justify-center items-center flex-col" 
     style={{ width: '100%', margin: '0 auto' }}>
    {peers.map((peer, i) => (
        peer?.videoTrack ? <Peer key={peer.id} peer={peer} /> : null
    ))}
</div>

               
                <div className={`md:flex flex-col w-80 bg-black p-4 ${rightOpen ? 'absolute right-0 top-0 h-full z-50' : 'hidden'}`}>
                    <h2 className="text-white text-xl mb-4 font-bold">LIVE CHAT</h2>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {spectatorMessages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg.color} font-bold`}>{msg?.by}: </span>
                                <span className="text-white font-bold">{msg?.message}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                            placeholder="Type message..."
                            value={rightMessage}
                            onChange={(e)=>{
                                setRightMessage(e.target.value)
                            }}
                        />
                        <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded">
                            Send
                        </button>
                    </div>
                </div>
            </div>

           
            {(leftOpen || rightOpen) && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => {
                        setLeftOpen(false);
                        setRightOpen(false);
                    }}
                ></div>
            )}
        </div>
    )
}