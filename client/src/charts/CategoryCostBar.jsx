// components/CategoryCostBar.jsx
import { useEffect, useState, useContext } from 'react';
import { Context } from '../Context';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CategoryCostBar = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeBoardObject, tasksPerBoard } = useContext(Context);

  // Chart.js configuration, to remove label
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  useEffect(() => {
    if (!activeBoardObject) {
      console.warn('No activeBoardObject provided yet, skipping fetch...');
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const categoryMap = {};
        tasksPerBoard.tasks.forEach(({ category, cost }) => {
          if (category && typeof cost === 'number') {
            categoryMap[category] = (categoryMap[category] || 0) + cost;
          }
        });

        const labels = Object.keys(categoryMap);
        const costs = Object.values(categoryMap);

        if (labels.length && costs.length) {
          setChartData({
            labels,
            datasets: [
              {
                data: costs,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(255, 205, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(201, 203, 207, 0.2)',
                ],
                borderColor: [
                  'rgb(255, 99, 132)',
                  'rgb(255, 159, 64)',
                  'rgb(255, 205, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(54, 162, 235)',
                  'rgb(153, 102, 255)',
                  'rgb(201, 203, 207)',
                ],
                borderWidth: 1,
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error('Error fetching tasks for bar chart:', error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeBoardObject, tasksPerBoard]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-lg font-bold text-center mb-4">
        Task Cost by Category (Bar Chart)
      </h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading chart...</p>
      ) : chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}
    </div>
  );
};

export default CategoryCostBar;
