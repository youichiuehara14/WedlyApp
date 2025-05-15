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
    res.status(200).json(boards);
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
  try {
    const { boardId, memberId } = req.body;

    // Check if the board exists (no populate yet)
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if the member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if already a member
    const isMember = board.members.some((m) => m.toString() === memberId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add the member and save
    board.members.push(memberId);
    await board.save();

    // Now populate the updated board
    const updatedBoard = await Board.findById(boardId)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    // Get the newly added member details
    const newMember = updatedBoard.members.find(
      (m) => m._id.toString() === memberId
    );

    res.status(200).json({
      message: 'User added to board',
      addedMember: newMember,
      board: updatedBoard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// Remove Member to Board
//////////////////////////////////////////////////////

const removeMemberToBoard = async (req, res) => {
  try {
    const { boardId, memberId } = req.body;

    // Check if the board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if the member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if the user is actually a member
    const isMember = board.members.includes(memberId);
    if (!isMember) {
      return res
        .status(400)
        .json({ error: 'User is not a member of the board' });
    }

    // Remove the member
    board.members.pull(memberId);
    await board.save();

    // Fetch updated board with populated data
    const updatedBoard = await Board.findById(boardId)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    res.status(200).json({
      message: 'User removed from board',
      removedMember: {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
      },
      board: updatedBoard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNewBoard,
  getBoardByUser,
  getBoardDetails,
  addMemberToBoard,
  removeMemberToBoard,
};
