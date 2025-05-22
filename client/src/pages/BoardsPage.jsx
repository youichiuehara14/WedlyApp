import { useState, useContext, useEffect } from 'react';
import { Context } from '../Context';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function BoardsPage() {
  const {
    boardsObjects,
    setBoardsObjects,
    activeBoardObject,
    setActiveBoardObject,
    addMemberToBoardInContext,
    user,
  } = useContext(Context);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalBudget: 0,
    weddingDate: '',
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (selectedBoard) {
      setFormData({
        name: selectedBoard.name,
        totalBudget: selectedBoard.totalBudget,
        weddingDate: selectedBoard.weddingDate?.slice(0, 10),
      });
    }
  }, [selectedBoard]);

  const deleteBoard = async (boardId) => {
    try {
      await axios.delete(`http://localhost:4000/api/board/${boardId}`, {
        withCredentials: true,
      });
      return true; // Success
    } catch (error) {
      console.error('Failed to delete board:', error);
      return false;
    }
  };

  const openEditModal = (board) => {
    setSelectedBoard(board);
    setModalType('edit');
    setModalOpen(true);
  };

  const openDeleteModal = (board) => {
    setSelectedBoard(board);
    setModalType('delete');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBoard(null);
    setModalType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedBoard) return;

    const updatedBoard = {
      ...selectedBoard,
      name: formData.name,
      totalBudget: Number(formData.totalBudget),
      weddingDate: new Date(formData.weddingDate).toISOString(),
    };

    try {
      const result = await axios.put(
        `http://localhost:4000/api/board/${selectedBoard._id}`,
        updatedBoard,
        { withCredentials: true }
      );

      setBoardsObjects((prev) =>
        prev.map((b) => (b._id === result.data._id ? result.data : b))
      );

      if (activeBoardObject?._id === result.data._id) {
        setActiveBoardObject(result.data);
      }

      toast.success('Board updated successfully!');
      closeModal();
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('Failed to update board. Please try again.');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBoard) return;

    const deletedId = selectedBoard._id;

    const success = await deleteBoard(deletedId);

    if (success) {
      setBoardsObjects((prev) => prev.filter((b) => b._id !== deletedId));

      if (activeBoardObject?._id === deletedId) {
        setActiveBoardObject(null);
      }
    }
    toast.success('Board deleted successfully!');

    closeModal();
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedBoard) {
      toast.error('Please enter a valid email.');
      return;
    }

    // Check if the email is already in the members array
    const isAlreadyMember = selectedBoard.members.some(
      (member) => member.email === inviteEmail
    );

    if (isAlreadyMember) {
      toast.error('This user is already a member of the board.');
      return;
    }

    setIsInviting(true);
    try {
      // Validate if the user exists in the database
      const validateRes = await axios.post(
        'http://localhost:4000/api/user/validate-email',
        { email: inviteEmail },
        { withCredentials: true }
      );

      if (!validateRes.data.exists) {
        toast.error('User does not exist in the database.');
        return;
      }

      // Send the invite request to the backend
      const addRes = await axios.post(
        `http://localhost:4000/api/board/add-board-member/${selectedBoard._id}/members`,
        { email: inviteEmail },
        { withCredentials: true }
      );

      // Verify response contains expected data
      if (!addRes.data?.addedMember) {
        throw new Error('Invalid response from server');
      }

      // Update the members array in the context
      addMemberToBoardInContext(selectedBoard._id, addRes.data.addedMember);
      setInviteEmail('');
      toast.success(`Added ${addRes.data.addedMember.firstName} to the board!`);
    } catch (err) {
      console.error('Invite error:', err);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          'Failed to invite user. Please try again.'
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedBoard) return;

    const confirmRemove = window.confirm(
      'Are you sure you want to remove this member?'
    );
    if (!confirmRemove) return;

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/board/remove-board-member/${selectedBoard._id}/members/${memberId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Update the members array in the context
        setSelectedBoard((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member._id !== memberId),
        }));
        toast.success('Member removed successfully!');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(
        error.response?.data?.error ||
          'Failed to remove member. Please try again.'
      );
    }
  };

  const handleDeleteConfirmation = (board) => {
    const userInput = window.prompt(
      `WARNING: Deleting this board will permanently delete all tasks and related data.\n\nTo confirm, type DELETE below:`
    );

    if (userInput === 'DELETE') {
      const confirmDelete = window.confirm(
        'Are you absolutely sure you want to delete this board? This action cannot be undone.'
      );

      if (confirmDelete) {
        openDeleteModal(board); // Proceed to delete the board
      } else {
        toast.error('Board deletion canceled.');
      }
    } else {
      toast.error('Board deletion canceled. You must type DELETE to confirm.');
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Manage Boards</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Budget</th>
              <th className="p-3 border-b">Spent</th>
              <th className="p-3 border-b">Remaining</th>
              <th className="p-3 border-b">Wedding Date</th>
              <th className="p-3 border-b">Owner</th>
              <th className="p-3 border-b">Member/s</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boardsObjects?.length > 0 ? (
              boardsObjects.map((board) => (
                <tr key={board._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{board.name}</td>
                  <td className="p-3 border-b">
                    {board.totalBudget.toLocaleString()}
                  </td>
                  <td className="p-3 border-b">
                    {board.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-3 border-b">
                    {board.totalRemaining.toLocaleString()}
                  </td>
                  <td className="p-3 border-b">
                    {new Date(board.weddingDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b">
                    {`${board.owner.firstName} ${board.owner.lastName}`}
                  </td>
                  <td className="p-3 border-b">
                    {board.members.map((member) => {
                      return (
                        <div key={member._id}>
                          {`${member.firstName} ${member.lastName}`}
                        </div>
                      );
                    })}
                  </td>

                  <td className="p-3 border-b space-x-2">
                    {board.owner._id === user._id && (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => openEditModal(board)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => handleDeleteConfirmation(board)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No boards available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto relative">
            {modalType === 'edit' && selectedBoard && (
              <>
                <h2 className="text-xl font-semibold mb-4">Edit Board</h2>
                <label className="block mb-2">
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </label>
                <label className="block mb-2">
                  Total Budget:
                  <input
                    type="number"
                    name="totalBudget"
                    value={formData.totalBudget}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded p-2"
                    min={0}
                  />
                </label>
                <label className="block mb-4">
                  Wedding Date:
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </label>

                {/* Show Invite Member Section Only if Current User is the Owner */}
                {selectedBoard.owner._id === user._id && (
                  <>
                    <label className="block mb-4">Member/s:</label>
                    <ul className="mb-4">
                      {selectedBoard.members.map((member) => (
                        <li
                          key={member._id}
                          className="flex items-center justify-between border-b py-2"
                        >
                          <span>{`${member.firstName} ${member.lastName} (${member.email})`}</span>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleRemoveMember(member._id)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <label className="block mb-2">
                      Invite member by email:
                    </label>
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="flex-1 border p-2 rounded"
                      />
                      <button
                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                        onClick={handleInviteMember}
                        disabled={isInviting}
                      >
                        {isInviting ? 'Inviting...' : 'Invite'}
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleEditSubmit}
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {modalType === 'delete' && selectedBoard && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-red-600">
                  Delete Board
                </h2>
                <p>
                  Are you sure you want to delete{' '}
                  <strong>{selectedBoard.name}</strong>?
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={handleDeleteSubmit}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BoardsPage;
