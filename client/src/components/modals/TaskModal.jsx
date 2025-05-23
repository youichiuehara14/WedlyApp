import { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { NotepadText, CheckSquare, MessageSquare, X, Edit2, Trash2 } from 'lucide-react';
import { Context } from '../../Context';

const TaskModal = ({ task, onClose, onTaskUpdate, onTaskDelete }) => {
  const {
    user,
    loading: userLoading,
    vendorsObjects,
    vendorsObjectsPerUser,
    activeBoardObject,
  } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    ...task,
    checklists: task.checklists || [],
    comments: task.comments || [],
  });
  const [checklistText, setChecklistText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');

  const [editingCommentText, setEditingCommentText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine if the logged-in user is the owner of the active board
  const isBoardOwner = user?._id === activeBoardObject?.owner?._id;
  // Choose the correct list of vendors based on user role
  const vendorList = isBoardOwner ? vendorsObjectsPerUser : vendorsObjects;

  const selectedVendor = vendorList?.find((v) => v._id === editedTask.vendor);

  console.log(vendorList);

  // Calculate checklist completion percentage
  const completionPercentage = editedTask.checklists?.length
    ? (editedTask.checklists.filter((item) => item.isCompleted).length /
        editedTask.checklists.length) *
      100
    : 0;

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/comment/get-comment/${task._id}`,
          { withCredentials: true }
        );
        const comments = response.data.task?.comments || response.data.comments || [];
        const enhancedComments = comments.map((comment) => ({
          ...comment,
          user:
            typeof comment.user === 'string' && user?.user?._id === comment.user
              ? { _id: user.user._id, firstName: user.user.firstName }
              : comment.user && comment.user.firstName
              ? comment.user
              : { firstName: 'Unknown User' },
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: comment.updatedAt || new Date().toISOString(),
        }));
        setEditedTask((prev) => ({
          ...prev,
          comments: enhancedComments,
        }));
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch comments');
        console.error('Fetch comments error:', error);
      } finally {
        setLoading(false);
      }
    };
    setEditedTask({
      ...task,
      checklists: task.checklists || [],
      comments: task.comments || [],
    });
    fetchComments();
  }, [task, user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddChecklist = async () => {
    if (!checklistText.trim()) {
      setError('Checklist text cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/checklist/add-checklist/${task.id}`,
        { text: checklistText, isCompleted: false },
        { withCredentials: true }
      );

      const updatedTask = response.data.task;
      setEditedTask((prev) => ({
        ...prev,
        checklists: updatedTask.checklists || prev.checklists,
      }));

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
      setChecklistText('');
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add checklist');
      console.error('Add checklist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (checklistId) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/checklist/toggle-checklist/${task.id}/${checklistId}`,
        {},
        { withCredentials: true }
      );

      const updatedTask = response.data.task;

      setEditedTask((prev) => ({
        ...prev,
        checklists: updatedTask.checklists || prev.checklists,
      }));

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle checklist');
      console.error('Toggle checklist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/checklist/delete-checklist/${task.id}/${checklistId}`,
        { withCredentials: true }
      );

      const updatedTask = response.data.task;

      setEditedTask((prev) => ({
        ...prev,
        checklists: updatedTask.checklists || prev.checklists,
      }));

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete checklist item');
      console.error('Delete checklist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChecklist = async (checklistId, newText) => {
    if (!newText.trim()) {
      setError('Checklist text cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/checklist/edit-checklist/${task._id}/${checklistId}`,
        { text: newText },
        { withCredentials: true }
      );

      const updatedTask = response.data.task;

      setEditedTask((prev) => ({
        ...prev,
        checklists: updatedTask.checklists || prev.checklists,
      }));

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      setEditingChecklistId(null);
      setEditingChecklistText('');

      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to edit checklist item');
      console.error('Edit checklist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setError('Comment text cannot be empty');
      return;
    }

    const createdAt = new Date().toISOString();
    const tempId = Date.now().toString();
    const newComment = {
      _id: tempId,
      text: commentText,
      user: user?.user
        ? { _id: user.user._id, firstName: user.user.firstName }
        : { firstName: 'Unknown User' },
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    setEditedTask((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setCommentText('');
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/comment/add-comment/${task.id}`,
        { text: commentText },
        { withCredentials: true }
      );
      const newComments = response.data.task?.comments || response.data.comments || [];
      const enhancedComments = newComments.map((comment) => ({
        ...comment,
        user:
          typeof comment.user === 'string' && user?.user?._id === comment.user
            ? { _id: user.user._id, firstName: user.user.firstName }
            : comment.user && comment.user.firstName
            ? comment.user
            : { firstName: 'Unknown User' },
        createdAt: comment.createdAt || new Date().toISOString(),
        updatedAt: comment.updatedAt || comment.createdAt,
      }));
      setEditedTask((prev) => ({
        ...prev,
        comments: enhancedComments,
      }));
      setError(null);
    } catch (error) {
      setEditedTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== tempId),
      }));
      setError(error.response?.data?.message || 'Failed to add comment');
      console.error('Add comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      setError('Comment text cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/comment/edit-comment/${task.id}/${commentId}`,
        { text: editingCommentText },
        { withCredentials: true }
      );
      const newComments = response.data.task?.comments || response.data.comments || [];
      const enhancedComments = newComments.map((comment) => ({
        ...comment,
        user:
          typeof comment.user === 'string' && user?.user?._id === comment.user
            ? { _id: user.user._id, firstName: user.user.firstName }
            : comment.user && comment.user.firstName
            ? comment.user
            : { firstName: 'Unknown User' },
        createdAt: comment.createdAt || new Date().toISOString(),
        updatedAt: comment.updatedAt || new Date().toISOString(),
      }));
      setEditedTask((prev) => ({
        ...prev,
        comments: enhancedComments,
      }));
      setEditingCommentId(null);
      setEditingCommentText('');
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to edit comment');
      console.error('Edit comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:4000/api/comment/delete-comment/${task.id}/${commentId}`,
        { withCredentials: true }
      );
      setEditedTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment._id !== commentId),
      }));
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete comment');
      console.error('Delete comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/task/update-task/${task.id}`,
        editedTask,
        { withCredentials: true }
      );
      setIsEditing(false);
      onTaskUpdate(response.data.task); // Update the task in the parent component
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save task');
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/task/delete-task/${task.id}`, {
        withCredentials: true,
      });
      onTaskDelete(task.id); // Remove the task from the parent component
      onClose(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
      console.error('Delete task error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown Date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Unknown Date';
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          onClick={() => onClose()}
          aria-label="Close modal"
          disabled={loading || userLoading}
        >
          <X size={20} className="cursor-pointer" />
        </button>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedTask.title || ''}
              onChange={handleInputChange}
              className="text-2xl font-bold mb-4 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Task title"
              disabled={loading || userLoading}
            />
          ) : (
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-200">
              {editedTask.title || 'Untitled'}
            </h2>
          )}

          <div className="text-sm text-gray-600 mb-6 flex flex-wrap gap-y-2">
            <div className="flex items-center mr-4">
              <span className="font-medium">Priority:</span>
              {isEditing ? (
                <select
                  name="priority"
                  value={editedTask.priority || 'Medium'}
                  onChange={handleInputChange}
                  className="ml-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Task priority"
                  disabled={loading || userLoading}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <span className="ml-1">{editedTask.priority || 'Medium'}</span>
              )}
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
                  aria-label="Due date"
                  disabled={loading || userLoading}
                />
              ) : (
                <span className="ml-1">{formatDate(editedTask.dueDate) || 'No due date'}</span>
              )}
            </div>
            <div className="flex items-center mr-4">
              <span className="font-medium">Status:</span>
              <span className="ml-1">{editedTask.status || 'To Do'}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium">Vendor:</span>
              {isEditing ? (
                <select
                  name="vendor"
                  value={editedTask.vendor || ''}
                  onChange={handleInputChange}
                  className="ml-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Vendor"
                >
                  <option value="" disabled>
                    Select a vendor
                  </option>
                  {vendorList.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} ({vendor.category}) - Cost: P{vendor.cost || 'N/A'}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="ml-1">
                  {selectedVendor ? `${selectedVendor.name} (${selectedVendor.category})` : 'None'}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <NotepadText size={18} className="text-gray [text-gray-500]" />
              <h3 className="font-semibold text-gray-700">Description</h3>
            </div>
            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                aria-label="Task description"
                disabled={loading || userLoading}
              />
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {editedTask.description || 'No description'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <CheckSquare size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">Task List</h3>
            </div>

            {editedTask.checklists?.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1 ">
                  Progress: {Math.round(completionPercentage)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full duration-900 ease-in-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={checklistText}
                onChange={(e) => setChecklistText(e.target.value)}
                placeholder="Add checklist item"
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="New checklist item"
                disabled={loading || userLoading}
              />
              <button
                onClick={handleAddChecklist}
                disabled={loading || userLoading}
                className={`border border-gray-300 bg-white text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer ${
                  loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>

            {editedTask.checklists?.length > 0 ? (
              <ul className="space-y-2 pl-1">
                {editedTask.checklists.map((item) => (
                  <li
                    key={item._id}
                    className="flex justify-between items-center text-sm text-gray-700"
                  >
                    {editingChecklistId === item._id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingChecklistText}
                          onChange={(e) => setEditingChecklistText(e.target.value)}
                          className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleEditChecklist(item._id, editingChecklistText)}
                          disabled={loading}
                          className="text-green-500 hover:text-green-700 p-1"
                        >
                          <CheckSquare size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setEditingChecklistId(null);
                            setEditingChecklistText('');
                          }}
                          disabled={loading}
                          className="text-gray-500 hover:text-gray-700 p-1 "
                        >
                          <X size={16} className="cursor-pointer" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.isCompleted || false}
                            onChange={() => handleToggleChecklist(item._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            disabled={loading || userLoading}
                          />
                          <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                            {item.text}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingChecklistId(item._id);
                              setEditingChecklistText(item.text || '');
                            }}
                            disabled={loading || userLoading}
                            className="text-gray-500 hover:text-blue-500 p-1 cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteChecklist(item._id)}
                            disabled={loading || userLoading}
                            className="text-gray-500 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No checklist items.</p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <MessageSquare size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">Comments</h3>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment"
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="New comment"
                disabled={loading || userLoading}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || userLoading}
                className={`border border-gray-300 bg-white text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer${
                  loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
            {editedTask.comments?.length ? (
              <ul className="space-y-3">
                {editedTask.comments.map((comment) => (
                  <li
                    key={comment._id}
                    className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border-l-3 border-blue-400 flex flex-col gap-2"
                  >
                    {editingCommentId === comment._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          aria-label="Edit comment"
                          disabled={loading || userLoading}
                        />
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          disabled={loading || userLoading}
                          className={`border border-gray-300 bg-white text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                            loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentText('');
                          }}
                          disabled={loading || userLoading}
                          className={`border border-gray-300 bg-white text-gray-600 py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                            loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="flex-1">{comment.text}</span>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditingCommentText(comment.text);
                            }}
                            disabled={loading || userLoading}
                            className="text-gray-500  p-1  hover:text-blue-500"
                            aria-label={`Edit comment: ${comment.text}`}
                          >
                            <Edit2 size={16} className="cursor-pointer " />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={loading || userLoading}
                            className="text-gray-500 hover:text-red-500 p-1"
                            aria-label={`Delete comment: ${comment.text}`}
                          >
                            <Trash2 size={16} className="cursor-pointer" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Posted by {user.firstName || 'Unknown User'} on{' '}
                          {formatDate(comment.createdAt)}
                          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (
                            <> (Edited {formatDate(comment.updatedAt)})</>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No comments yet.</p>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            {isEditing ? (
              <button
                className={`flex-1 border border-gray-300  bg-white text-gray-700 py-2.5 px-4 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-colors font-medium ${
                  loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={saveTask}
                disabled={loading || userLoading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                className={`flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 px-4 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-colors font-medium ${
                  loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => setIsEditing(true)}
                disabled={loading || userLoading}
              >
                Edit Task
              </button>
            )}
            <button
              className={`flex-1 border border-gray-300 bg-white text-gray-600 py-2.5 px-4 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-colors font-medium ${
                loading || userLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={deleteTask}
              disabled={loading || userLoading}
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
