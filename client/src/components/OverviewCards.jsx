import { useContext, useEffect } from 'react';
import { Context } from '../Context';
import {
  DollarSign,
  ArrowDownCircle,
  PieChart,
  CheckCircle,
  Calendar,
  AlarmClock,
  Clock,
} from 'lucide-react';

function OverviewCard_Budget() {
  const { activeBoardObject, tasksPerBoard, fetchTasksPerBoard } =
    useContext(Context);

  // Add useEffect to ensure fresh data
  useEffect(() => {
    if (activeBoardObject?._id) {
      fetchTasksPerBoard();
    }
  }, [activeBoardObject?._id, tasksPerBoard, fetchTasksPerBoard]);

  const tasks = tasksPerBoard?.tasks || [];

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
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium text-gray-600">Budget Overview</h2>
      {/* Row 1: Budget Cards */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-blue-50 border border-blue-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Total Budget</h2>
            <DollarSign className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            Php {activeBoardObject?.totalBudget?.toLocaleString() || 0}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-red-50 border border-red-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Total Spent</h2>
            <ArrowDownCircle className="text-red-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            Php {activeBoardObject?.totalSpent?.toLocaleString() || 0}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-green-50 border border-green-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              Remaining Budget
            </h2>
            <PieChart className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            Php {activeBoardObject?.totalRemaining?.toLocaleString() || 0}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-yellow-50 border border-yellow-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              Days Until Wedding
            </h2>
            <Calendar className="text-yellow-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {daysLeft !== null ? `${daysLeft} days` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Row 2: Task Progress, Overdue, Upcoming */}
      <h2 className="text-2xl font-medium text-gray-600 mt-16">
        Tasks Overview
      </h2>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-red-50 border border-red-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Total Tasks</h2>
            <CheckCircle className="text-red-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalTasks}</div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-orange-50 border border-orange-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">To-Do Tasks</h2>
            <CheckCircle className="text-orange-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {tasks.filter((t) => t.status === 'To Do').length}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-blue-50 border border-blue-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">In Progress</h2>
            <CheckCircle className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {tasks.filter((t) => t.status === 'In Progress').length}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-purple-50 border border-purple-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Done</h2>
            <CheckCircle className="text-purple-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{doneTasks}</div>
        </div>
      </div>

      {/* Row 3: Overdue / Incoming */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 mt-6">
        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-pink-50 border border-pink-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Overdue Tasks</h2>
            <AlarmClock className="text-pink-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{overdueTasks}</div>
        </div>

        <div className="flex flex-col justify-between gap-2 min-h-[120px] bg-indigo-50 border border-indigo-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">
              Incoming (Next 7 Days)
            </h2>
            <Clock className="text-indigo-500 w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {incomingTasks}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewCard_Budget;
