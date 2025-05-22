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

    // Check if the email is already in the members array
    const isAlreadyMember = selectedBoard.members.some((member) => member.email === inviteEmail);

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
        // Update the members array in the context
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
    // Main container with dark background and padding
    <div className="min-h-screen rounded-4xl text-white p-4 shadow-neumorphism-inset">
      <div className="h-screen border-1 rounded-4xl border-[#dddddd2d] p-5">
        <div className="rounded-lg shadow-lg   ">
          <h1 className="text-xl sm:text-3xl font-bold mb-6 inline-block px-5 py-2 border-[#dddddd2d]">
            Manage Boards
          </h1>
          <table className="min-w-full  text-white border-[#dddddd2d] border-1  ">
            <thead>
              <tr className="text-left text-xs sm:text-base">
                <th className="p-3 sm:p-4">Name</th>
                <th className="p-3 sm:p-4">Budget</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Spent</th>
                <th className="p-3 sm:p-4">Remaining</th>
                {/* Wedding Date: Smaller text on small screens, base on larger */}
                <th className="p-3 sm:p-4 text-sm sm:text-base hidden sm:table-cell">
                  Wedding Date
                </th>
                {/* Hidden on small screens, visible from md breakpoint */}
                <th className="p-3 sm:p-4 hidden lg:table-cell">Owner</th>
                {/* Hidden on small screens, visible from md breakpoint */}
                <th className="p-3 sm:p-4 hidden lg:table-cell">Member/s</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boardsObjects?.length > 0 ? (
                boardsObjects.map((board) => (
                  <tr
                    key={board._id}
                    className="border-t border-[#dddddd2d] duration-200 hover:bg-[#323529] transition-all"
                  >
                    <td className="p-3 sm:p-4 text-xs sm:text-sm">{board.name}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm">
                      {board.totalBudget.toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm hidden sm:table-cell">
                      {board.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm">
                      {board.totalRemaining.toLocaleString()}
                    </td>
                    {/* Wedding Date: Smaller text on small screens, base on larger */}
                    <td className="p-3 sm:p-4 text-xs sm:text-sm hidden sm:table-cell">
                      {new Date(board.weddingDate).toLocaleDateString()}
                    </td>
                    {/* Hidden on small screens, visible from md breakpoint */}
                    <td className="p-3 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">
                      {`${board.owner.firstName} ${board.owner.lastName}`}
                    </td>
                    {/* Hidden on small screens, visible from md breakpoint */}
                    <td className="p-3 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">
                      {board.members.map((member) => {
                        return (
                          <div key={member._id}>{`${member.firstName} ${member.lastName}`}</div>
                        );
                      })}
                    </td>

                    <td className="p-3 sm:p-4 space-x-2">
                      {board.owner._id === user._id && (
                        <>
                          <button
                            className="text-white cursor-pointer hover:underline text-xs sm:text-sm"
                            onClick={() => openEditModal(board)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-white cursor-pointer hover:underline text-xs sm:text-sm"
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
                  <td
                    colSpan="6" // Colspan is now 6 (original 8 - 2 hidden columns)
                    className="text-center p-4 text-gray-500 text-sm sm:text-base"
                  >
                    No boards available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal (No changes needed for modal hiding columns) */}
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

                    {/* Show Invite Member Section Only if Current User is the Owner */}
                    {selectedBoard.owner._id === user._id && (
                      <>
                        <label className="md:block text-sm font-medium mb-1">Member/s:</label>
                        <ul className="mb-4 space-y-2">
                          {selectedBoard.members.map((member) => (
                            <li
                              key={member._id}
                              className="flex items-center justify-between text-sm border border-gray-300 p-2 rounded-lg"
                            >
                              <span>{`${member.firstName} ${member.lastName} (${member.email})`}</span>
                              <button
                                className="text-red-600 hover:text-red-800 text-xs sm:text-sm ml-2"
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
                              className="flex-1 border border-gray-300 p-2 rounded-lg  focus:outline-none text-sm"
                            />
                            <button
                              className="border-1 hover:bg-[#2d2f25] hover:text-white cursor-pointer text-[#2d2f25] px-4 py-2 rounded-lg transition-all duration-300 text-sm"
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
                      className="border-1 hover:bg-[#2d2f25] hover:text-white cursor-pointer text-[#2d2f25] px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={closeModal}
                      className="border-1 hover:bg-[#2d2f25] hover:text-white cursor-pointer text-[#2d2f25] px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalType === 'delete' && selectedBoard && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Board</h2>
                  <p className="text-base mb-6">
                    Are you sure you want to delete <strong>{selectedBoard.name}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleDeleteSubmit}
                      className="bg-red-600 text-[#2d2f25] px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-300 text-sm"
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
