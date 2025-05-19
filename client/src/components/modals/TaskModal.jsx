import { useState } from 'react';
import axios from 'axios';
import { NotepadText, CheckSquare, MessageSquare, X } from 'lucide-react';

const TaskModal = ({ task, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const saveTask = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/task/update-task/${task.id}`,
        editedTask,
        { withCredentials: true }
      );
      console.log('Task updated:', response.data);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:4000/api/task/delete-task/${taskId}`, {
        withCredentials: true,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="pr-6">
          {/* Header */}
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              className="text-2xl font-bold mb-4 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{task.title}</h2>
          )}

          {/* Meta Information */}
          <div className="text-sm text-gray-600 mb-6 flex flex-wrap gap-y-2">
            <div className="flex items-center mr-4">
              <span className="font-medium">Assigned To:</span>
              <span className="ml-1">{task.assignedTo || 'Not set'}</span>
            </div>

            <div className="flex items-center mr-4">
              <span className="font-medium">Due:</span>
              {isEditing ? (
                <input
                  type="date"
                  name="dueDate"
                  value={editedTask.dueDate || ''}
                  onChange={handleInputChange}
                  className="ml-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <span className="ml-1">{task.dueDate || 'No due date'}</span>
              )}
            </div>

            <div className="flex items-center mr-4">
              <span className="font-medium">Status:</span>
              <span className="ml-1">{task.status || 'None'}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium">Vendor:</span>
              <span className="ml-1">{task.vendorName || 'None'}</span>
            </div>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {task.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <NotepadText size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">Description</h3>
            </div>
            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Task List */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                <CheckSquare size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-700">Task List</h3>
              </div>
              <ul className="space-y-2 pl-1">
                {task.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="flex-shrink-0 w-4 h-4 mt-1 border border-gray-300 rounded-sm"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <MessageSquare size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">Comments</h3>
            </div>
            {task.comments?.length ? (
              <ul className="space-y-3">
                {task.comments.map((comment, i) => (
                  <li
                    key={i}
                    className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border-l-3 border-blue-400"
                  >
                    {comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No comments yet.</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            {isEditing ? (
              <button
                className="flex-1 border-1 border-gray-300 bg-white text-gray-700 py-2.5 px-4 rounded-lg ransition-colors font-medium cursor-pointer"
                onClick={saveTask}
              >
                Save Changes
              </button>
            ) : (
              <button
                className="flex-1 border-1 border-gray-300 bg-white text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Edit Task
              </button>
            )}

            <button
              className="flex-1 border-1 border-gray-300 bg-white text-gray-600 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              onClick={() => deleteTask(task.id)}
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
