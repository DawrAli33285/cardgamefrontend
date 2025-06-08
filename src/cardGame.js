import Header from "./components/header";
import pokemon from "./pokemon.png";
import { socketContext } from "./socketContext";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { BASE_URL } from "./baseurl";

export default function CardGame() {
    const { socketRef, socket, profile} = useContext(socketContext);
    const [matches, setMatches] = useState([]);
    const [matchSettings, setMatchSettings] = useState();
    const [users, setUsers] = useState([]);
    const listenerAdded = useRef(false); 
    const navigate = useNavigate();

    useEffect(() => {
        if (socketRef?.current && !listenerAdded.current) {
            console.log("Setting up socket listener...");
            socketRef?.current?.emit("getUsers");
            
            socketRef?.current?.on("getUsers", (data) => {
                console.log("getUsers");
                console.log(data);
                setUsers(data);
            });
            
            socketRef?.current?.on("updatedSpectatorInteractionControls", (data) => {
                setMatchSettings((prev) => {
                    let old = prev;
                    old = data;
                    return old;
                });
            });
            
      
            const handleGetMatches = (data) => {
                console.log('Received matches data:', data);
                
              
                if (Array.isArray(data) && data.length > 0) {
                    console.log("Updating matches state");
                    setMatches(data); 
                } else {
                    setMatches([]);
                }
            };

         
            socketRef.current.on('getMatches', handleGetMatches);
            
          
            socketRef.current.emit("getMatches");
            
          
            listenerAdded.current = true;
            
          
            return () => {
                console.log("Removing socket listener...");
                socketRef.current.off('getMatches', handleGetMatches);
                listenerAdded.current = false;
            };
        }
    }, [socketRef.current, socket]); 

    useEffect(() => {
        getMatchSettings();
    }, []);

    const getMatchSettings = async () => {
        try {
            let response = await axios.get(`${BASE_URL}/getMatchSettings`);
            console.log("getMatchSettings");
            console.log(response.data);
            setMatchSettings(response.data.settings);
        } catch (e) {
            console.error("Error fetching match settings:", e);
        }
    };

    const getSpectatorCount = (roomId) => {
        return users.filter(user => user?.roomId === roomId).length;
    };

    const canWatchMatch = (roomId) => {
        if (!matchSettings?.enable_spectator_settings) {
            return false;
        }
        
        const spectatorCount = getSpectatorCount(roomId);
        return spectatorCount < matchSettings?.max_spectators;
    };

    const getWatchStatus = (roomId) => {
        if (!matchSettings?.enable_spectator_settings) {
            return null; 
        }
        
        const spectatorCount = getSpectatorCount(roomId);
        if (spectatorCount >= matchSettings?.max_spectators) {
            return "Room Full";
        }
        
        return "Watch Now";
    };

    return (
        <div className='w-full px-[10px]'>
            <Header />
            <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[2rem] gap-[30px]'>
                {profile?.subscription?.cancelled==true? <div className='hidden lg:flex flex-col w-[250px] h-fit'>
                    <div className='bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-6 text-white shadow-lg'>
                        <div className='text-center mb-4'>
                            <div className='w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                                    <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'/>
                                </svg>
                            </div>
                            <h3 className='text-lg font-bold mb-2'>Trendy Summer Dress</h3>
                            <p className='text-sm opacity-90 mb-2'>
                                🌟 Brand New Floral Print Dress
                            </p>
                            <p className='text-xs opacity-80 mb-4'>
                                Perfect for casual outings & summer parties
                            </p>
                            <div className='bg-white bg-opacity-20 rounded-lg p-2 mb-3'>
                                <p className='text-sm font-bold'>Only $24.99</p>
                                <p className='text-xs'>Free Shipping Available</p>
                            </div>
                            <button className='bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all'>
                                Shop on eBay →
                            </button>
                        </div>
                    </div>
                    
                    <div className='mt-4 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg p-6 text-white shadow-lg'>
                        <div className='text-center'>
                            <div className='w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                                    <path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z'/>
                                </svg>
                            </div>
                            <h3 className='text-lg font-bold mb-2'>Wireless Headphones</h3>
                            <p className='text-sm opacity-90 mb-2'>
                                🎧 Premium Sound Quality
                            </p>
                            <p className='text-xs opacity-80 mb-4'>
                                Noise cancelling with 30hr battery life
                            </p>
                            <div className='bg-white bg-opacity-20 rounded-lg p-2 mb-3'>
                                <p className='text-sm font-bold'>$89.99</p>
                                <p className='text-xs line-through opacity-70'>$129.99</p>
                            </div>
                            <button className='bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all'>
                                Buy Now on eBay →
                            </button>
                        </div>
                    </div>
                </div>
                :``}
                
                {/* Main Content */}
                <div className='flex flex-col w-full h-full gap-[6px] relative flex-1'>
                    {matches.length === 0 ? (
                        <div className="text-white text-center py-10">
                            No active matches found
                        </div>
                    ) : (
                        matches.map((val, i) => {
                            const roomId = val?.liveStreamRoomId;
                            const watchStatus = getWatchStatus(roomId);
                            const canWatch = canWatchMatch(roomId);
                            
                            return (
                                <div key={`${val.socketId}-${i}`} className="w-full h-full">
                                    <div className="flex gap-[10px] items-center lg:items-stretch w-full lg:flex-row flex-col lg:justify-center">
                                        <div className="lg:w-[10%] w-full h-full bg-black flex justify-center items-center py-4">
                                            <img 
                                                src={val.image} 
                                                alt="pokemon" 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                        <div className="lg:w-[80%] w-full h-[inherit] bg-black p-[10px]">
                                            <p className="text-white font-bold text-[14px] lg:text-[16px]">
                                                {val?.userName} vs {val?.matchAgainst?.userName}
                                                {watchStatus && (
                                                    <span 
                                                        onClick={canWatch ? () => navigate(`/watchgame?playerOne=${val?.socketId}&playerTwo=${val?.matchAgainst?.socketId}&liveStreamRoomId=${val?.liveStreamRoomId}`) : undefined}
                                                        className={`ml-2 ${
                                                            canWatch 
                                                                ? 'text-blue-400 cursor-pointer hover:text-blue-300' 
                                                                : 'text-red-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        ({watchStatus})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}