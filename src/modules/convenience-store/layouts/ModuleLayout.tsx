import Menu from './Menu';
import { Toaster } from "sonner";
import { Outlet } from "react-router-dom";
import DebugPackageLoader from '../components/debug/DebugPackageLoader'; 
export default function MainLayout() {
    return (
        <>
        <DebugPackageLoader />
        <div  className='h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden'>

        
            {/* menu cũ */}
            <Menu />

            {/* main content cũ */}
           <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
            <Toaster position="top-right" richColors />
        </div>
        </>
    );
}
