import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const AssignmentSkeleton = ({number}:{number:number}) => {
    return (
        <>
            {Array.from({length: number}).map((_, i) => (
                <div 
                    key={i}
                    className={`relative w-full flex xs:flex-col sm:flex-row xs:gap-4 sm:gap-0 xs:items-start sm:items-center justify-between py-5 px-4 ${
                        i < number - 1 ? 'border-b border-gray-200' : ''
                    }`}
                >
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Skeleton width="100%" height="100%" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Skeleton borderRadius={8} width="100%" height="1.2rem" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                            <div className="flex xs:flex-col sm:flex-row xs:items-start sm:items-center xs:gap-1 sm:gap-3 w-full">
                                <Skeleton borderRadius={8} width="120px" height="0.9rem" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                                <Skeleton borderRadius="9999px" width="80px" height="1rem" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center xs:mt-3 sm:mt-0 xs:self-end sm:self-auto">
                        <Skeleton borderRadius={8} width="90px" height="2rem" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                        <div className="w-8 h-8 ml-3 rounded-full overflow-hidden flex-shrink-0">
                            <Skeleton circle width="100%" height="100%" baseColor='#f2f2f2' highlightColor='#e7e7e7'/>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
 
export default AssignmentSkeleton;