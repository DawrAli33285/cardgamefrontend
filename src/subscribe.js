import { Link } from "react-router-dom";
import Header from "./components/header";
import sub from "./Subscribe.png"
export default function Subscribe() {
    return (
        <div className='w-full px-[10px]'>
            <Header />
            <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[8rem] gap-[30px]'>
                <Link to="/" className="w-full flex justify-center items-center">
                    <img src={sub} className="max-w-[800px] w-full" alt="img" />
                </Link>
            </div>
        </div>
    )
}