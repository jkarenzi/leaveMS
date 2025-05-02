import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const GroupSkeleton = ({ number = 4 }) => {
    return (
        <div className="w-[90%] flex flex-col gap-6 z-10">
            <div className="w-full flex xs:flex-col sm:flex-row xs:gap-4 sm:gap-0 xs:items-start sm:items-center justify-between bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col gap-2">
                    <Skeleton height={24} width={180} />
                    <Skeleton height={16} width={240} />
                </div>
                <div className="xs:w-full sm:w-auto">
                    <Skeleton height={40} width={120} borderRadius={8} />
                </div>
            </div>
            
            {Array(number).fill(0).map((_, index) => (
                <div key={index} className="w-full flex flex-col rounded-lg overflow-hidden shadow-md bg-white border border-gray-100">
                    <div className="w-full flex xs:flex-col sm:flex-row xs:gap-3 sm:gap-0 xs:items-start sm:items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Skeleton circle width={36} height={36} />
                            <div className="flex xs:flex-col sm:flex-row xs:gap-1 sm:gap-3 xs:items-start sm:items-center">
                                <Skeleton height={20} width={120} />
                                <Skeleton height={18} width={60} borderRadius={999} />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 xs:mt-3 sm:mt-0 xs:ml-10 sm:ml-0">
                            <Skeleton circle width={28} height={28} />
                            <Skeleton circle width={28} height={28} />
                        </div>
                    </div>
                    
                    {index === 0 && (
                        <div className="w-full flex flex-col gap-4 py-5 px-5 border-t border-gray-100 bg-gray-50">
                            <div>
                                <Skeleton height={18} width={100} className="mb-2" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton height={24} width={110} borderRadius={999} />
                                    <Skeleton height={24} width={130} borderRadius={999} />
                                    <Skeleton height={24} width={120} borderRadius={999} />
                                </div>
                            </div>
                            
                            <div>
                                <Skeleton height={18} width={120} className="mb-2" />
                                <Skeleton height={16} width="100%" style={{ maxWidth: "450px" }} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GroupSkeleton;