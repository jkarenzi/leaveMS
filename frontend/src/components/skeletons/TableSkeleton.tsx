import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


interface IProps {
    cols: number,
    rows: number
}

const TableSkeleton = ({cols, rows}:IProps) => {
    return (
        <>
            {Array.from({length: rows}).map((_, x) => (
                <tr key={x}>
                    {Array.from({length: cols}).map((_, i) => (
                        <td className='px-4 py-2' key={i}>
                            <Skeleton borderRadius={8} height="2rem" baseColor='#bdbdbd' highlightColor='#e7e7e7'/>
                        </td>
                    ))}
                </tr> 
            ))}
        </>
    );
}
 
export default TableSkeleton;