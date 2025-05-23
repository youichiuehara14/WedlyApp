// components/CategoryCostDoughnut.jsx
import { useEffect, useState, useContext } from 'react';
import { Context } from '../Context';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const CategoryCostDoughnut = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeBoardObject, tasksPerBoard } = useContext(Context);

  const options = {
    plugins: {
      legend: {
        labels: {
          color: 'black',
        },
      },
      tooltip: {
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
  };

  useEffect(() => {
    if (!activeBoardObject || !tasksPerBoard?.tasks?.length) {
      setChartData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const categoryMap = {};

      tasksPerBoard.tasks.forEach((task) => {
        const { category, cost } = task;
        if (category && typeof cost === 'number') {
          categoryMap[category] = (categoryMap[category] || 0) + cost;
        }
      });

      const labels = Object.keys(categoryMap);
      const costs = Object.values(categoryMap);

      if (labels.length && costs.length) {
        // Repeat static colors if there are more categories than colors
        const baseColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        const backgroundColor = labels.map((_, i) => baseColors[i % baseColors.length]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Total Cost per Category',
              data: costs,
              backgroundColor,
              borderWidth: 1,
            },
          ],
        });
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error processing tasks for doughnut chart:', error);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [activeBoardObject, tasksPerBoard]);

  return (
    <div className="max-w-md mx-auto p-4">
      {loading ? (
        <p className="text-center text-black">Loading chart...</p>
      ) : chartData ? (
        <div className="w-[200px] h-[200px]">
          <Doughnut data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-black">No data available</p>
      )}
    </div>
  );
};

export default CategoryCostDoughnut;
