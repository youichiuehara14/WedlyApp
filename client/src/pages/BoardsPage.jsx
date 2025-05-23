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

      setBoardsObjects((prev) => prev.map((b) => (b._id === result.data._id ? result.data : b)));

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

    const isAlreadyMember = selectedBoard.members.some((member) => member.email === inviteEmail);

    if (isAlreadyMember) {
      toast.error('This user is already a member of the board.');
      return;
    }

    setIsInviting(true);
    try {
      const validateRes = await axios.post(
        'http://localhost:4000/api/user/validate-email',
        { email: inviteEmail },
        { withCredentials: true }
      );

      if (!validateRes.data.exists) {
        toast.error('User does not exist in the database.');
        return;
      }

      const addRes = await axios.post(
        `http://localhost:4000/api/board/add-board-member/${selectedBoard._id}/members`,
        { email: inviteEmail },
        { withCredentials: true }
      );

      if (!addRes.data?.addedMember) {
        throw new Error('Invalid response from server');
      }

      addMemberToBoardInContext(selectedBoard._id, addRes.data.addedMember);
      setInviteEmail('');
      toast.success(`Added ${addRes.data.addedMember.firstName} to the board!`);
    } catch (err) {
      console.error('Invite error:', err);
      toast.error(
        err.response?.data?.error || err.message || 'Failed to invite user. Please try again.'
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedBoard) return;

    const confirmRemove = window.confirm('Are you sure you want to remove this member?');
    if (!confirmRemove) return;

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/board/remove-board-member/${selectedBoard._id}/members/${memberId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSelectedBoard((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member._id !== memberId),
        }));
        toast.success('Member removed successfully!');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member. Please try again.');
    }
  };

  const handleDeleteConfirmation = (board) => {
    const userInput = window.prompt(
      'WARNING: Deleting this board will permanently delete all tasks and related data.\n\nTo confirm, type DELETE below:'
    );

    if (userInput === 'DELETE') {
      const confirmDelete = window.confirm(
        'Are you absolutely sure you want to delete this board? This action cannot be undone.'
      );

      if (confirmDelete) {
        openDeleteModal(board);
      } else {
        toast.error('Board deletion canceled.');
      }
    } else {
      toast.error('Board deletion canceled. You must type DELETE to confirm.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2d2f25] rounded-4xl text-black p-4 shadow-neumorphism-inset">
      <div className="h-screen rounded-4xl p-5">
        <h1 className="text-xl sm:text-3xl font-bold mb-6 inline-block px-5 py-2">Manage Boards</h1>
        <div className="rounded-4xl shadow-lg shadow-neumorphism-inset p-8">
          <table className="min-w-full text-black">
            <thead>
              <tr className="text-left text-xs sm:text-base">
                <th className="p-3 sm:p-4 sm:text-lg">Name</th>
                <th className="p-3 sm:p-4 sm:text-lg hidden md:table-cell">Budget</th>
                <th className="p-3 sm:p-4 sm:text-lg hidden md:table-cell">Spent</th>
                <th className="p-3 sm:p-4 sm:text-lg">Remaining</th>
                <th className="p-3 sm:p-4 sm:text-lg hidden sm:table-cell">Wedding Date</th>
                <th className="p-3 sm:p-4 sm:text-lg hidden lg:table-cell">Owner</th>
                <th className="p-3 sm:p-4 sm:text-lg hidden lg:table-cell">Member/s</th>
                <th className="p-3 sm:p-4 sm:text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boardsObjects?.length > 0 ? (
                boardsObjects.map((board) => (
                  <tr
                    key={board._id}
                    className="border-t border-[#323529] duration-200 transition-all"
                  >
                    <td className="p-3 sm:p-4 text-xs sm:text-lg">{board.name}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg hidden md:table-cell">
                      {board.totalBudget.toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg hidden md:table-cell">
                      {board.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg">
                      {board.totalRemaining.toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg hidden sm:table-cell">
                      {new Date(board.weddingDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg hidden lg:table-cell">
                      {`${board.owner.firstName} ${board.owner.lastName}`}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-lg hidden lg:table-cell">
                      {board.members.map((member) => (
                        <div key={member._id}>{`${member.firstName} ${member.lastName}`}</div>
                      ))}
                    </td>
                    <td className="p-3 sm:p-4 space-x-2">
                      {board.owner._id === user._id && (
                        <div className="flex flex-col lg:flex-row gap-2">
                          <button
                            className="text-black cursor-pointer hover:underline text-xs sm:text-lg"
                            onClick={() => openEditModal(board)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-black cursor-pointer hover:underline text-xs sm:text-lg"
                            onClick={() => handleDeleteConfirmation(board)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500 text-sm sm:text-base">
                    No boards available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-800">
              {modalType === 'edit' && selectedBoard && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Edit Board</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Budget</label>
                      <input
                        type="number"
                        name="totalBudget"
                        value={formData.totalBudget}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Wedding Date</label>
                      <input
                        type="date"
                        name="weddingDate"
                        value={formData.weddingDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                      />
                    </div>
                    {selectedBoard.owner._id === user._id && (
                      <>
                        <label className="block text-sm font-medium mb-1">Member/s:</label>
                        <ul className="mb-4 space-y-2">
                          {selectedBoard.members.map((member) => (
                            <li
                              key={member._id}
                              className="flex items-center justify-between text-sm border border-gray-300 p-2 rounded-lg"
                            >
                              <span>{`${member.firstName} ${member.lastName} (${member.email})`}</span>
                              <button
                                className="text-red-600 hover:text-red-800 cursor-pointer text-xs sm:text-sm"
                                onClick={() => handleRemoveMember(member._id)}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Invite member by email:
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="Enter user email"
                              className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                            />
                            <button
                              className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
                              onClick={handleInviteMember}
                              disabled={isInviting}
                            >
                              {isInviting ? 'Inviting...' : 'Invite'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleEditSubmit}
                      className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={closeModal}
                      className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalType === 'delete' && selectedBoard && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Delete Board</h2>
                  <p className="text-sm sm:text-base mb-6">
                    Are you sure you want to delete <strong>{selectedBoard.name}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleDeleteSubmit}
                      className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#d8d8d885] cursor-pointer transition-all duration-300 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#d8d8d885] cursor-pointer transition-all duration-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardsPage;
