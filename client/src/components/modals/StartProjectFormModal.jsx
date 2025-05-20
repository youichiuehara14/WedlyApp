import { useState } from 'react';
import { useContext } from 'react';
import { Context } from '../../Context';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function StartProjectFormModal({ onClose = () => {} }) {
  const { user, setBoardsObjects } = useContext(Context);
  const [form, setForm] = useState({
    owner: `${user._id}`,
    name: '',
    members: [`${user._id}`],
    weddingDate: '',
    totalBudget: '',
  });

  const { name, weddingDate, totalBudget } = form;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/board/create-new-board',
        form,
        {
          withCredentials: true,
        }
      );
      console.log('Created board:', data);
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Board created successfully!');
        setBoardsObjects((prevBoards) => [...prevBoards, data]);
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An error occurred while creating the board.');
      }
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl font-semibold cursor-pointer"
        >
          x
        </button>
        {/* Board Header */}
        <div>
          <h1 className="text-xl font-semibold">Create New Board</h1>
          <span className="text-[#17171798] font-semibold text-sm">
            BoardOwner: {user.firstName}
          </span>
        </div>
        <form className="space-y-4">
          {/* Board Name */}
          <div>
            <label className="block font-medium">Board Name</label>
            <input
              type="text"
              required
              value={name}
              name="name"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. Website Redesign"
            />
          </div>

          {/* Total Budget */}
          <div>
            <label className="block font-medium">Total Budget</label>
            <input
              type="number"
              value={totalBudget}
              name="totalBudget"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 5000"
            />
          </div>

          {/* Wedding Date */}
          <div>
            <label className="block font-medium">Wedding Date</label>
            <input
              type="date"
              value={weddingDate}
              name="weddingDate"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
