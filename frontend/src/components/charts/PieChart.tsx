import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useAppSelector } from "../../redux/hooks";

ChartJS.register(ArcElement, Tooltip, Legend);


interface IProps {
    displayLegend: boolean,
    width: number,
    height: number,
    mode: 'tasks'|'messages'|'loginTimes'|'commits'
}

const PieChart = ({displayLegend, width, height, mode}:IProps) => {
  const {reportData} = useAppSelector(state => state.report)

  const data = {
    labels: reportData.map((userData) => userData.fullName.split(" ")[0]),
    datasets: [
      {
        data: reportData.map((userData) => mode === 'tasks' ? userData.assignedTasks : mode === 'messages' ? userData.totalMessages : mode === 'loginTimes' ? userData.totalHoursLoggedIn : userData.totalCommits),
        backgroundColor: [
          "#18EEC0",
          "#D391D2",
          "#FF9D9D",
          "#FFBB00",
          "#B5FF9C",
          "#6A8CAF",
          "#A76F6F",
          "#C4A26A",
          "#709F7A",
          "#9E84B3"
        ]
      },
    ],
  };
  
  const options = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
          display: displayLegend,
          position: "bottom" as 'bottom',
      },
      title: {
          display: false,
      },
    },
  };
  
    return <Pie data={data} options={options} width={width} height={height}/>;
  };
  
export default PieChart;