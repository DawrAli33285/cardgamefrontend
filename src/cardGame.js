import Header from "./components/header";
import pokemon from "./pokemon.png"
import { socketContext } from "./socketContext";
import { useContext, useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
export default function CardGame() {
    const {socketRef}=useContext(socketContext)
    const [matches,setMatches]=useState([])

useEffect(()=>{
if(socketRef?.current?.connected){
   

    
    socketRef?.current?.emit("getMatches")
    socketRef?.current?.on('getMatches',(data)=>{
        console.log(data)
        console.log('getMatches')
        if(!data){
            window.location.reload(true)
        }
        setMatches((prev)=>{
            let old=prev;
            if(old?.length>0){
                return old
            }else{
                
                old=data
                return old
            }
        })
    })

  
}
},[socketRef?.current])

const navigate=useNavigate();


    return (
        <div className='w-full px-[10px]'>
            <Header />
            <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[8rem] gap-[30px]'>
                <div className='flex flex-col w-full h-full gap-[6px]  relative'>
                {matches?.map((val,i)=>{
                    return <div className="w-full h-full">
                  
                    <div className="flex gap-[10px] items-center lg:items-stretch w-full lg:flex-row flex-col lg:justify-center">
                     
                        <div className="lg:w-[10%] w-full h-full bg-black flex justify-center items-center py-4">
                            <img 
                                src={pokemon} 
                                alt="pokemon" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        
                      
                        <div className="lg:w-[80%] w-full h-[inherit] bg-black p-[10px]">
                            <p className="text-white font-bold text-[14px] lg:text-[16px]">
                               {val?.userName} vs {val?.matchAgainst?.userName} <span onClick={()=>{
                                navigate(`/watchgame?playerOne=${val?.socketId}&playerTwo=${val?.matchAgainst?.socketId}&liveStreamRoomId=${val?.liveStreamRoomId}`)
                               }} className="text-blue-400">
                               (Watch Now)
                               </span>
                            </p>
                        </div>
                    </div>
                    </div>
                })}
                </div>
            </div>
        </div>
    )
}