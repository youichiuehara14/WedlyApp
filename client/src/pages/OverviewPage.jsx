import CategoryCostDoughnut from '../charts/CategoryCostDoughnut';
import CategoryCostBar from '../charts/CategoryCostBar';
import { useContext } from 'react';
import { Context } from '../Context';
import OverviewCards from '../components/OverviewCards';

function Overview() {
  const { activeBoardObject } = useContext(Context);

  return (
    <>
      {activeBoardObject && activeBoardObject ? (
        <>
          <OverviewCards />
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 mt-10">
            <CategoryCostDoughnut boardId={activeBoardObject} />
            <CategoryCostBar boardId={activeBoardObject} />
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">
          Please select a board to view dashboard data.
        </p>
      )}
    </>
  );
}

export default Overview;
