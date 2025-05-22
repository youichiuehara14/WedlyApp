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
        </>
      ) : (
        <p className="text-gray-500 text-sm">Please select a board to view dashboard data.</p>
      )}
    </>
  );
}

export default Overview;
