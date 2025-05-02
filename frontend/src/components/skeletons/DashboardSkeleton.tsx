import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const DashboardSkeleton = () => {
    return (
        <div className="w-[90%] flex flex-col py-8">
            {/* Header and badges section */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex xs:flex-col lg:flex-row xs:items-start lg:items-center justify-between mb-4">
                    <Skeleton height={24} width="40%" />
                    <Skeleton height={30} width={120} borderRadius={20} />
                </div>
                <div className="flex gap-6 pb-2">
                    <Skeleton height={16} width={140} />
                    <Skeleton height={16} width={160} />
                </div>
            </div>
            
            {/* Description section */}
            <div className="mt-8">
                <Skeleton height={20} width={100} className="mb-4" />
                <Skeleton height={16} count={4} className="mb-2" />
                <Skeleton height={16} width="75%" />
            </div>
        </div>
    );
}

export default DashboardSkeleton;