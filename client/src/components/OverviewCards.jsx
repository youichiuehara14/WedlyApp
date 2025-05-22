import { useContext, useEffect } from 'react';
import { Context } from '../Context';
import { PhilippinePeso, ListChecks, LoaderCircle, CircleCheckBig, Heart } from 'lucide-react';
import weddingPlans from '../assets/icons/wedding-plans.png';
import moneyBag from '../assets/icons/money-bag.png';
import CategoryCostDoughnut from '../charts/CategoryCostDoughnut';
import CategoryCostBar from '../charts/CategoryCostBar';
import wedCouple from '../assets/icons/wedcouple.svg';

function OverviewCard_Budget() {
  const { activeBoardObject, tasksPerBoard, fetchTasksPerBoard } = useContext(Context);

  useEffect(() => {
    if (activeBoardObject?._id) {
      fetchTasksPerBoard(activeBoardObject._id);
    }
  }, [activeBoardObject?._id]);

  const tasks = tasksPerBoard?.tasks || [];

  const tasksCost = tasks.reduce((acc, task) => {
    const taskCost = parseFloat(task.cost) || 0;
    return acc + taskCost;
  }, 0);

  const remainingBudget = activeBoardObject?.totalBudget - tasksCost || 0;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === 'Done').length;

  const today = new Date();
  const upcomingDate = new Date();
  upcomingDate.setDate(today.getDate() + 7);

  const overdueTasks = tasks.filter((task) => {
    return task.dueDate && new Date(task.dueDate) < today;
  }).length;

  const incomingTasks = tasks.filter((task) => {
    const due = new Date(task.dueDate);
    return due >= today && due <= upcomingDate;
  }).length;

  const calculateDaysLeft = (weddingDateStr) => {
    const weddingDate = new Date(weddingDateStr);
    const diffTime = weddingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = activeBoardObject?.weddingDate
    ? calculateDaysLeft(activeBoardObject.weddingDate)
    : null;

  return (
    <div className="min-h-screen p-4 grid grid-cols-12 grid-rows-5 grid-rows-auto gap-4 border-1 rounded-4xl bg-[#2d2f25] shadow-neumorphism-inset">
      {/* Task Overview */}
      <div className="col-span-12 md:col-span-9 xl:col-span-9 border border-[#dddddd2d] p-4 rounded-4xl row-span-2 md:row-span-3">
        {/* Task Overview 1st Row */}
        <div className="flex flex-col h-full justify-between ">
          <div className="flex flex-col items-start sm:items-center sm:flex-row justify-between p-5 ">
            <span className="py-2 iflex text-white text-sm md:text-lg cursor-pointer">
              View Task
            </span>
            <div className="flex gap-2 flex-wrap">
              <span className=" text-[10px] sm:text-xs  text-white font-semibold">
                {overdueTasks} Overdue
              </span>
              <span className=" text-xs  text-white font-semibold">
                {incomingTasks} Incoming (Next 7 days)
              </span>
            </div>
          </div>
          {/* Task Overview 2nd Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 border-b-1 w-full mx-auto border-[#dddddd2d] py-10 sm:py-25">
            <div className="bg-white w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shadow-neumorphism rounded-full ">
              <img src={weddingPlans} alt="" className="w-10 h-10 sm:w-12 md:h-12" />
            </div>

            <div className="flex flex-col sm:flex-row items-center">
              <span className="text-6xl sm:text-8xl font-bold text-orange-300 sm:mr-5">
                {totalTasks}
              </span>
              <span className="text-2xl sm:text-4xl text-white font-semibold duration-500">
                Total Tasks
              </span>
            </div>
          </div>

          {/*Task Overview ThirdRow */}
          <div className="flex justify-between md:justify-evenly px-5 sm:px-10 py-5 ">
            {/* Third row items */}
            {/* Item1 */}
            <div className="flex items-center gap-3">
              <ListChecks
                color="white"
                className="w-[20%] hidden sm:inline-block sm:w-6 sm:h-6 lg:w-8 lg:h-8"
              />
              <div className="flex flex-col items-center">
                <span className="text-white font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                  {tasks.filter((t) => t.status === 'To Do').length}
                </span>
                <span className="text-white font-semibold text-[100%] sm:text-lg">Todo</span>
              </div>
            </div>
            {/* Item2 */}
            <div className="flex items-center gap-3">
              <LoaderCircle
                color="white"
                className="w-[20%] hidden sm:inline-block sm:w-6 sm:h-6 lg:w-8 lg:h-8"
              />
              <div className="flex flex-col items-center">
                <span className="text-white font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                  {tasks.filter((t) => t.status === 'In Progress').length}
                </span>
                <span className="text-white font-semibold text-[100%] sm:text-lg">In Progress</span>
              </div>
            </div>
            {/* Items3 */}
            <div className="flex items-center gap-3">
              <CircleCheckBig
                color="white"
                className="w-[20%] hidden sm:inline-block sm:w-6 sm:h-6 lg:w-8 lg:h-8"
              />
              <div className="flex flex-col items-center">
                <span className="text-white font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                  {doneTasks}
                </span>
                <span className="text-white font-semibold text-[100%] sm:text-lg">Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Widget */}
      <div className="col-span-12 sm:col-span-12 md:col-span-3 border bg-white  rounded-xl row-span-3 2xl:row-span-1 relative overflow-hidden ">
        <div className="flex flex-col 2xl:flex-row h-full w-full 2xl:gap-4  ">
          <div className="flex flex-col mt-10 2xl:mt-0 2xl:flex-row h-full w-full justify-center items-center gap-2  mx-auto">
            <div className="flex items-center justify-center w-30 h-30 2xl:w-20 2xl:h-20 z-5">
              {/* Heart Icon Background */}
              <Heart
                className="w-[100%] h-full"
                size={90}
                color="#fed234"
                strokeWidth={1.25}
                fill="#fed234"
              />
              {/* Days Number Overlay */}
              <span className="absolute text-white font-bold text-lg">{daysLeft}</span>
            </div>
            <span
              style={{ fontFamily: 'Parisienne' }}
              className="text-xl text-orange-400 font-semibold"
            >
              Days until wedding
            </span>
          </div>
          <div>
            <img
              src={wedCouple}
              alt="Couple"
              className="w-[full] 2xl:w-[40%] object-contain 2xl:absolute relative top-8 2xl:top-12 2xl:-bottom-6 2xl:-left-8"
            />
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="col-span-12 md:col-span-6 2xl:col-span-3 md:row-span-2 row-span-3 border border-[#dddddd2d] p-4 rounded-xl">
        <div className="flex flex-col py-5 ">
          <h2 className="sm:text-lg font-bold text-center mb-4 text-white">
            Task Cost by Category
          </h2>
          <CategoryCostDoughnut boardId={activeBoardObject} />
        </div>
      </div>

      {/* ================================================= */}
      {/* Bar Chart */}
      <div className="col-span-12 md:col-span-6 2xl:col-span-4 md:row-span-2 row-span-3 border border-[#dddddd2d] p-4 rounded-xl flex items-center justify-center ">
        <div className="flex flex-col h-full items-center justify-center ">
          <CategoryCostBar boardId={activeBoardObject} />
        </div>
      </div>
      {/* ================================================= */}

      <div className="col-span-12 2xl:col-span-8 2xl:row-span-2 border border-[#dddddd2d] p-4 rounded-xl">
        <div className="flex flex-col h-full">
          {/* Header Row */}
          <div className="flex sm:flex-row items-center flex-wrap sm:items-center gap-4 sm:gap-10 w-full p-4 md:p-6">
            {/* Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-neumorphism bg-[#e0e0e0]">
              <img src={moneyBag} alt="Money Bag" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold text-white">
              Budget Overview
            </h2>
          </div>

          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 w-full border-t border-[#dddddd2d] pt-4 mt-12">
            {/* Total Budget */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 p-2 sm:p-4">
              <PhilippinePeso className="w-6 h-6 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm sm:text-base text-white">Total Budget</h3>
                <p className="text-white font-bold text-xl sm:text-lg md:text-2xl">
                  {activeBoardObject?.totalBudget?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Total Spent */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 p-2 sm:p-4">
              <PhilippinePeso className="w-6 h-6 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm sm:text-base text-white">Total Spent</h3>
                <p className="text-white font-bold text-xl sm:text-lg md:text-2xl">
                  {tasksCost.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Remaining */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 p-2 sm:p-4">
              <PhilippinePeso className="w-6 h-6 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm sm:text-base text-white">Remaining</h3>
                <p className="text-white font-bold text-xl sm:text-lg md:text-2xl">
                  {remainingBudget.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewCard_Budget;
