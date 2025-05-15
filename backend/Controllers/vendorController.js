const Vendor = require('../Models/vendors');
const Board = require('../Models/boards');

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

    // Get the full board details separately (not populated in the vendor)
    const board = await Board.findById(updatedVendor.board);

    res.status(200).json({
      message: 'Vendor updated successfully',
      board,
      vendor: {
        ...updatedVendor.toObject(),
        board: updatedVendor.board, // only ObjectId here
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
    const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

    if (!deletedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res
      .status(200)
      .json({ message: 'Vendor deleted successfully', vendor: deletedVendor });
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
