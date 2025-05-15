const Vendor = require('../Models/vendors');
const Board = require('../Models/boards');
const Task = require('../Models/tasks');

//////////////////////////////////////////////////////
// Helper Function to compute the total cost of all tasks during creation, update, and delete
// Make sure that totals are always up to date
//////////////////////////////////////////////////////

const updateBoardBudget = async (boardId) => {
  const tasks = await Task.find({ board: boardId });
  const totalSpent = tasks.reduce((sum, task) => sum + (task.cost || 0), 0);

  const board = await Board.findById(boardId);
  if (!board) throw new Error('Board not found while updating budget');

  board.totalSpent = totalSpent;
  board.totalRemaining = board.totalBudget - totalSpent;
  await board.save();
};

//////////////////////////////////////////////////////
// Create a Vendor
//////////////////////////////////////////////////////
const createVendor = async (req, res) => {
  try {
    const { name, category, address, phone, cost, email, boardId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newVendor = new Vendor({
      board: boardId,
      name,
      category,
      address,
      phone,
      cost,
      email,
    });

    await newVendor.save();

    res.status(201).json({
      message: 'Vendor created successfully',
      board,
      vendor: {
        ...newVendor.toObject(),
        board: boardId, // only ObjectId here
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Get vendor by board
//////////////////////////////////////////////////////

const getVendorByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    // Find the board by ID
    const board = await Board.findById(boardId)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Find all vendors related to this board
    const vendors = await Vendor.find({ board: boardId });

    res.status(200).json({
      board,
      vendors,
    });
  } catch (error) {
    console.error('Get Vendor By Board Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Update Vendor
//////////////////////////////////////////////////////

const updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { name, category, address, phone, cost, email } = req.body;

    // Update the vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        name,
        category,
        address,
        phone,
        cost,
        email,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update all tasks using this vendor to sync cost and category
    const tasksUsingVendor = await Task.find({ vendor: vendorId });

    if (tasksUsingVendor.length > 0) {
      await Task.updateMany(
        { vendor: vendorId },
        {
          category: updatedVendor.category,
          cost: updatedVendor.cost,
          updatedAt: Date.now(),
        }
      );

      // Recalculate board budget after cost update
      await updateBoardBudget(updatedVendor.board);
    }

    // Get the updated board details
    const board = await Board.findById(updatedVendor.board);

    res.status(200).json({
      message: 'Vendor updated successfully',
      board,
      vendor: {
        ...updatedVendor.toObject(),
        board: updatedVendor.board,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Delete Vendor
//////////////////////////////////////////////////////

const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const boardId = vendor.board;

    // Find tasks using this vendor
    const tasksUsingVendor = await Task.find({ vendor: vendorId });

    if (tasksUsingVendor.length > 0) {
      // Unlink vendor from tasks
      await Task.updateMany(
        { vendor: vendorId },
        {
          $unset: {
            vendor: '',
            category: '',
            cost: '',
          },
          updatedAt: Date.now(),
        }
      );

      // Recalculate the board budget
      await updateBoardBudget(boardId);
    }

    // Finally, delete the vendor
    await Vendor.findByIdAndDelete(vendorId);

    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVendor,
  getVendorByBoard,
  updateVendor,
  deleteVendor,
};
