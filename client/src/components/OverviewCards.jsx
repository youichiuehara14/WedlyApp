import { useContext, useEffect } from 'react';
import { Context } from '../Context';
import { PhilippinePeso, ListChecks, LoaderCircle, CircleCheckBig, Heart } from 'lucide-react';
import weddingPlans from '../assets/icons/wedding-plans.png';
import moneyBag from '../assets/icons/money-bag.png';
import CategoryCostDoughnut from '../charts/CategoryCostDoughnut';
import CategoryCostBar from '../charts/CategoryCostBar';
import wedCouple from '../assets/icons/wedcouple.svg';
import { NavLink } from 'react-router-dom';

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
    <div className="min-h-[calc(85vh-2rem)]  p-2 sm:p-4 grid grid-cols-12 grid-rows-auto gap-2 sm:gap-4 rounded-2xl overflow-hidden shadow-neumorphism-inset">
      {/* Task Overview */}
      <div className="col-span-12 sm:col-span-7 xl:col-span-6 p-2 sm:p-3 rounded-2xl row-span-3 sm:row-span-4 border-1  border-gray-500/30 shadow-smoverflow-hidden">
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3">
            <span className="py-1 text-[#2d2f25] text-[2.5vw] sm:text-sm md:text-base lg:text-md cursor-pointer rounded-sm mb-1 sm:mb-0 hover:text-gray-600">
              <NavLink to={'/home/tasks'}>View Task</NavLink>
            </span>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <span className="border px-2 sm:px-3 bg-red-500 text-white text-[2vw] sm:text-xs md:text-sm lg:text-base font-semibold break-words">
                {overdueTasks} Overdue
              </span>
              <span className="text-[2vw] sm:text-xs md:text-sm lg:text-base px-2 sm:px-3 bg-orange-500 text-white font-semibold break-words">
                {incomingTasks} Incoming
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 p[] py-2 sm:py-3 mb-5 sm:mb-0">
            <div className="bg-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center shadow-neumorphism-white ">
              <img
                src={weddingPlans}
                alt=""
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain"
              />
            </div>
            <div className="flex flex-row items-center">
              <span className="text-[7vw] sm:text-[5vw] md:text-4xl lg:text-5xl font-bold text-orange-300 sm:mr-2 break-words">
                {totalTasks}
              </span>
              <span className="text-[3.5vw] sm:text-base md:text-lg lg:text-xl text-[#2d2f25] font-semibold break-words">
                Total Tasks
              </span>
            </div>
          </div>
          <div className="flex justify-evenly px-2 sm:px-3 py-2 sm:py-3 border-t border-gray-300">
            <div className="flex items-center gap-1 sm:gap-2">
              <ListChecks
                color="white"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 hidden sm:inline-block"
              />
              <div className="flex flex-col items-center">
                <span className="text-[#2d2f25] font-semibold text-[2.5vw] sm:text-sm md:text-base lg:text-lg break-words">
                  {tasks.filter((t) => t.status === 'To Do').length}
                </span>
                <span className="text-[#2d2f25] font-semibold text-[2vw] sm:text-xs md:text-sm break-words">
                  Todo
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <LoaderCircle
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 hidden sm:inline-block"
                color="white"
              />
              <div className="flex flex-col items-center">
                <span className="text-[#2d2f25] font-semibold text-[2.5vw] sm:text-sm md:text-base lg:text-lg break-words">
                  {tasks.filter((t) => t.status === 'In Progress').length}
                </span>
                <span className="text-[#2d2f25] font-semibold text-[2vw] sm:text-xs md:text-sm break-words">
                  In Progress
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CircleCheckBig
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 hidden sm:inline-block"
                color="white"
              />
              <div className="flex flex-col items-center">
                <span className="text-[#2d2f25] font-semibold text-[2.5vw] sm:text-sm md:text-base lg:text-lg break-words">
                  {doneTasks}
                </span>
                <span className="text-[#2d2f25] font-semibold text-[2vw] sm:text-xs md:text-sm break-words">
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Widget */}
      <div className="col-span-12 relative sm:col-span-5 xl:col-span-6 bg-white border-1 border-gray-500/30 shadow-sm rounded-lg row-span-1 overflow-hidden">
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 h-full w-full">
          <div className="flex relative  items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
            <Heart
              className="w-full h-full"
              size={30}
              color="#fed234"
              strokeWidth={1}
              fill="#fed234"
            />
            <span className="absolute text-[#2d2f25] font-bold text-[2.5vw] sm:text-xs md:text-sm lg:text-base break-words">
              {daysLeft}
            </span>
          </div>
          <span
            style={{ fontFamily: 'Parisienne' }}
            className="text-[3vw] sm:text-sm md:text-base lg:text-lg text-orange-400 font-semibold text-center break-words"
          >
            Days until wedding
          </span>
          <img src={wedCouple} alt="Couple" className="w-10 sm:w-12 md:w-14 object-contain" />
        </div>
      </div>

      {/* Budget Overview */}
      <div className="col-span-12 sm:col-span-5 xl:col-span-6 row-span-3 border-1  border-gray-500/30 shadow-smp-2 sm:p-3 rounded-lg overflow-hidden">
        <div className="flex flex-col h-full w-[90%] mx-auto">
          <div className="flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3">
            <div className="mt-5 w-12 h-12 sm:w-12 sm:h-12 md:w-18 md:h-18  flex items-center justify-center shadow-neumorphism-white">
              <img
                src={moneyBag}
                alt="Money Bag"
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain "
              />
            </div>
            <h2 className="text-[3.5vw] sm:text-base md:text-lg lg:text-xl font-semibold text-[#2d2f25] text-center break-words">
              Budget Overview
            </h2>
          </div>
          <div className="flex flex-row flex-wrap gap-1 sm:gap-2 w-full border-t border-[#2d2f2583] pt-2 sm:pt-3 mt-2 sm:mt-3 xl:mt-auto mb-3 sm:mb-0  ">
            <div className="flex items-center just gap-1 sm:gap-2 p-1 sm:p-1 flex-1 min-w-[70px]">
              <PhilippinePeso
                className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#2d2f25] flex-shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <h3 className="text-[1.8vw] sm:text-[9px] md:text-[10px] lg:text-xs text-[#2d2f25] break-words">
                  Total Budget
                </h3>
                <p className="text-[#2d2f25] font-bold text-[1.6vw] sm:text-[10px] md:text-[11px] lg:text-sm break-words">
                  ₱{activeBoardObject?.totalBudget?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1 flex-1 min-w-[70px]">
              <PhilippinePeso
                className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#2d2f25] flex-shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <h3 className="text-[1.8vw] sm:text-[9px] md:text-[10px] lg:text-xs text-[#2d2f25] break-words">
                  Total Spent
                </h3>
                <p className="text-[#2d2f25] font-bold text-[1.6vw] sm:text-[10px] md:text-[11px] lg:text-sm break-words">
                  ₱{tasksCost.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1 flex-1 min-w-[70px]">
              <PhilippinePeso
                className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#2d2f25] flex-shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <h3 className="text-[1.8vw] sm:text-[9px] md:text-[10px] lg:text-xs text-[#2d2f25] break-words">
                  Remaining
                </h3>
                <p className="text-[#2d2f25] font-bold text-[1.6vw] sm:text-[10px] md:text-[11px] lg:text-sm break-words">
                  ₱{remainingBudget.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="col-span-12 sm:col-span-7 xl:col-span-6 row-span-2 sm:row-span-3 p-2 sm:p-3 rounded-lg border-1  border-gray-500/30 shadow-smoverflow-hidden md:h-[90%]">
        <div className="flex flex-col h-full items-center justify-center w-full max-w-full max-h-full">
          <CategoryCostBar boardId={activeBoardObject} />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="col-span-12 sm:col-span-5 xl:col-span-6 row-span-2 sm:row-span-3 border-1  border-gray-500/30 shadow-smp-2 sm:p-3 rounded-lg overflow-hidden md:h-[90%]">
        <div className="flex flex-col py-2 sm:py-3 h-full my-5 sm:my-0">
          <h2 className="text-[3vw] sm:text-sm md:text-base lg:text-lg font-bold text-center mb-2 sm:mb-3 text-[#2d2f25] break-words">
            Task Cost by Category
          </h2>
          <div className="flex-1  flex w-full h-full max-h-[200px] sm:max-h-[300px]">
            <CategoryCostDoughnut boardId={activeBoardObject} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewCard_Budget;
