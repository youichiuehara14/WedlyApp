const User = require('../Models/users');
const Board = require('../Models/boards');

//////////////////////////////////////////////////////
// Create a board
//////////////////////////////////////////////////////

const createNewBoard = async (req, res) => {
  try {
    const { name, owner, members, totalBudget, weddingDate } = req.body;

    // Check if all fields are provided
    if (!name || !owner || !members || !totalBudget || !weddingDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the owner exists
    const ownerExists = await User.findById(owner);
    if (!ownerExists) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Check if the members exist
    const membersExist = await User.find({ _id: { $in: members } });
    if (members.length !== membersExist.length) {
      return res.status(404).json({ error: 'Members not found' });
    }

    // Create a new board
    const board = await Board.create({
      name,
      owner,
      members,
      totalBudget,
      weddingDate,
      createdAt: new Date(),
    });

    // Return the created board
    res.status(201).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// Get Board by User
//////////////////////////////////////////////////////

const getBoardByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find boards where the user is either the owner or a member
    const boards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    if (boards.length === 0) {
      return res.status(404).json({ error: 'No boards found for this user' });
    }

    // Return the boards
    res.status(200).json({ boardsLength: boards.length, boards: boards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// Get Board details
//////////////////////////////////////////////////////

const getBoardDetails = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//////////////////////////////////////////////////////
// Add Member to Board
//////////////////////////////////////////////////////
const addMemberToBoard = async (req, res) => {
  const { boardId } = req.params;
  const { email } = req.body;

  try {
    // Check if the board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is already a member of the board
    const isAlreadyMember = board.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );
    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ error: 'User is already a member of the board' });
    }

    // Add the user to the board's members array
    board.members.push(user._id);
    await board.save();

    // Optionally, populate the added member's details
    const addedMember = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    res.status(200).json({ message: 'Member added successfully', addedMember });
  } catch (error) {
    console.error('Error adding member to board:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//////////////////////////////////////////////////////
// Remove Member to Board
//////////////////////////////////////////////////////

const removeMemberFromBoard = async (req, res) => {
  const { boardId, memberId } = req.params;

  console.log('req user: ----- ', req.user.id);

  try {
    // Check if the board exists
    const board = await Board.findById(boardId).populate('owner');
    console.log('board: ----- ', board);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if the current user is the owner of the board
    if (board.owner._id.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: 'Only the owner can remove members' });
    }

    // Prevent the owner from removing themselves
    if (board.owner._id.toString() === memberId) {
      return res
        .status(403)
        .json({ error: 'The owner cannot remove themselves from the board' });
    }

    // Check if the member exists in the board's members array
    const isMember = board.members.some(
      (member) => member.toString() === memberId
    );
    if (!isMember) {
      return res.status(404).json({ error: 'Member not found in the board' });
    }

    // Remove the member from the board's members array
    board.members = board.members.filter(
      (member) => member.toString() !== memberId
    );
    await board.save();
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member from board:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalBudget, weddingDate } = req.body;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Update fields
    board.name = name || board.name;
    board.totalBudget = totalBudget || board.totalBudget;
    board.weddingDate = weddingDate || board.weddingDate;

    // Save the updated board
    await board.save();

    // Populate the owner and members fields
    const updatedBoard = await Board.findById(id)
      .populate('owner')
      .populate('members');

    res.status(200).json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error updating board' });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    await board.deleteOne();
    res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error deleting board' });
  }
};

module.exports = {
  createNewBoard,
  getBoardByUser,
  getBoardDetails,
  addMemberToBoard,
  updateBoard,
  deleteBoard,
  removeMemberFromBoard,
};
