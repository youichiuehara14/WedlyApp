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
    const { name, category, address, phone, cost, email } = req.body;

    // if (!req.user || !req.user.id) {
    //   return res.status(401).json({ message: 'User not authenticated' });
    // }

    const newVendor = new Vendor({
      user: req.user.id,
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
      vendor: newVendor,
    });
  } catch (error) {
    console.error('Create Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Get vendor by board
//////////////////////////////////////////////////////

const getVendorListByBoard = async (req, res) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required' });
    }

    // Get the board and its owner
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const ownerId = board.owner;

    // Fetch vendors for the board owner
    const vendors = await Vendor.find({ user: ownerId });

    res.status(200).json({ vendors });
  } catch (error) {
    console.error('Get Vendor By Board Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getVendorListPerUser = async (req, res) => {
  try {
    // fetch the vendors for the logged-in user
    const vendors = await Vendor.find({ user: req.user.id });

    if (!vendors) {
      return res.status(404).json({ message: 'No vendors found' });
    }

    res.status(200).json({
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

    // Find and update vendor, return updated document in one step
    const updatedVendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, user: req.user.id },
      {
        $set: {
          name,
          category,
          address,
          phone,
          cost,
          email,
          updatedAt: Date.now(),
        },
      },
      { new: true } // return the updated document
    );

    if (!updatedVendor) {
      return res
        .status(404)
        .json({ message: 'Vendor not found or unauthorized' });
    }

    // Update all tasks using this vendor to sync cost and category
    const tasksUsingVendor = await Task.find({ vendor: vendorId });

    if (tasksUsingVendor.length > 0) {
      await Task.updateMany(
        { vendor: vendorId },
        {
          $set: {
            category: updatedVendor.category,
            cost: updatedVendor.cost,
            updatedAt: Date.now(),
          },
        }
      );
    }

    res.status(200).json({
      message: 'Vendor updated successfully',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('Update Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Delete Vendor
//////////////////////////////////////////////////////

const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Ensure vendor exists and belongs to user
    const vendor = await Vendor.findOne({ _id: vendorId, user: req.user.id });
    if (!vendor) {
      return res
        .status(404)
        .json({ message: 'Vendor not found or unauthorized' });
    }

    // Find tasks using this vendor
    const tasksUsingVendor = await Task.find({ vendor: vendorId });

    const affectedBoards = new Set();

    if (tasksUsingVendor.length > 0) {
      await Task.updateMany(
        { vendor: vendorId },
        {
          $unset: {
            vendor: '',
            category: '',
            cost: '',
          },
          $set: { updatedAt: Date.now() },
        }
      );

      for (const task of tasksUsingVendor) {
        affectedBoards.add(task.board.toString());
      }

      for (const boardId of affectedBoards) {
        await updateBoardBudget(boardId);
      }
    }

    // Delete vendor
    await Vendor.deleteOne({ _id: vendorId, user: req.user.id });

    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVendor,
  getVendorListByBoard,
  getVendorListPerUser,
  updateVendor,
  deleteVendor,
};
