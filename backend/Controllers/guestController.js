const Guest = require('../Models/guests');
const User = require('../Models/users');

//////////////////////////////////////////////////////
// Create a guest
//////////////////////////////////////////////////////
const createGuest = async (req, res) => {
  try {
    const { name, phone, email, rsvp } = req.body;

    // Check if the user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new guest
    const newGuest = new Guest({
      user: req.user.id,
      name,
      phone,
      email,
      rsvp,
      createdAt: Date.now(),
    });

    await newGuest.save();

    res.status(201).json({
      message: 'Guest created successfully',
      guest: newGuest,
    });
  } catch (error) {
    console.error('Create Guest Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Get guests per user
//////////////////////////////////////////////////////

const getGuestListPerUser = async (req, res) => {
  try {
    // fetch the guests for the logged-in user
    const guests = await Guest.find({ user: req.user.id });
    if (!guests) {
      return res.status(404).json({ message: 'No guests found' });
    }
    res.status(200).json({
      guests,
    });
  } catch (error) {
    console.error('Get Guest List Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Update guest
//////////////////////////////////////////////////////

const updateGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { name, phone, email, rsvp } = req.body;

    // Find and update guest, return updated document in one step
    const updatedGuest = await Guest.findOneAndUpdate(
      { _id: guestId, user: req.user.id },
      {
        $set: {
          name,
          phone,
          email,
          rsvp,
          updatedAt: Date.now(),
        },
      },
      { new: true } // return the updated document
    );
    if (!updatedGuest) {
      return res
        .status(404)
        .json({ message: 'Guest not found or unauthorized' });
    }
    res.status(200).json({
      message: 'Guest updated successfully',
      guest: updatedGuest,
    });
  } catch (error) {
    console.error('Update Guest Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// delete guest
//////////////////////////////////////////////////////

const deleteGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    // Find and delete guest
    const deletedGuest = await Guest.findOneAndDelete({
      _id: guestId,
      user: req.user.id,
    });
    if (!deletedGuest) {
      return res
        .status(404)
        .json({ message: 'Guest not found or unauthorized' });
    }
    res.status(200).json({
      message: 'Guest deleted successfully',
      guest: deletedGuest,
    });
  } catch (error) {
    console.error('Delete Guest Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGuest,
  getGuestListPerUser,
  updateGuest,
  deleteGuest,
};
