import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../Context';
import { toast } from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user, activeBoardObject, vendorsObjects } = useContext(Context);
  const [formData, setFormData] = useState({
    boardId: '',
    title: '',
    description: '',
    taskColor: 'red',
    dueDate: '',
    status: 'To Do',
    priority: 'Medium',
    position: 0,
    vendor: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeBoardObject) {
      setFormData((prev) => ({
        ...prev,
        boardId: activeBoardObject._id,
      }));
    }
  }, [activeBoardObject]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (
      !formData.boardId ||
      !formData.title ||
      !formData.description ||
      !formData.vendor
    ) {
      const errorMsg = 'Board, title, description, and vendor are required';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/task/create-task',
        { ...formData },
        { withCredentials: true }
      );
      console.log('Task created:', response.data);
      toast.success('Task created successfully!');

      setFormData({
        boardId: '',
        title: '',
        description: '',
        taskColor: 'red',
        dueDate: '',
        status: 'To Do',
        priority: 'Medium',
        position: 0,
        vendor: '',
      });

      onClose();
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create task';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Task Color */}
          <div>
            <label className="block text-sm font-medium">Task Color</label>
            <select
              name="taskColor"
              value={formData.taskColor}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="red">Red</option>
              <option value="orange">Orange</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <select
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={vendorsObjects.length === 0}
            >
              <option value="">Select a vendor</option>
              {vendorsObjects.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name} ({vendor.category}) - Cost: P
                  {vendor.cost || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
