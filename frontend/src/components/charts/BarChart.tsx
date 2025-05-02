import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { useAppSelector } from "../../redux/hooks";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);


const DoubleBarChart = () => {
  const {reportData} = useAppSelector(state => state.report)
  const peerScores: number[] = []
  for(const userData of reportData){
    let sum = 0
    for(const assessment of userData.peerAssessments){
      sum += assessment.score
    }

    if(userData.peerAssessments.length === 0){
      peerScores.push(0)
    }

    if(userData.peerAssessments.length !== 0){
      peerScores.push(Math.round(sum / userData.peerAssessments.length))
    }
  }

  console.log(reportData)
  console.log(peerScores)
  
  const data = {
    labels: reportData.map((userData) => userData.fullName.split(" ")[0]),
    datasets: [
      {
        label: "Peer Score",
        data: peerScores,
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
      {
        label: "Self Score",
        data: reportData.map(userData => userData.selfAssessment?.score || 0),
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
      legend: { display: false},
      tooltip: { enabled: true },
      title: { display: false},
    },
    scales: {
      x: {
        title: { display: true },
        stacked: false,
      },
      y: {
        title: { display: true },
        beginAtZero: true,
        min: 0,
        max: 25,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return <Bar data={data} options={options}  width={300} height={200}/>;
};

export default DoubleBarChart;