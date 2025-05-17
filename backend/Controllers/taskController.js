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
// Create a task (autofill category and cost)
//////////////////////////////////////////////////////

const createTask = async (req, res) => {
  try {
    const {
      boardId,
      title,
      description,
      taskColor,
      dueDate,
      status,
      priority,
      position,
      vendor: vendorId,
    } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const category = vendor.category;
    const cost = vendor.cost;

    const newTask = new Task({
      board: boardId,
      title,
      description,
      taskColor,
      dueDate,
      status,
      priority,
      position,
      vendor: vendorId,
      category,
      cost,
      createdAt: new Date(),
    });

    await newTask.save(); // Save the new task to the database

    await updateBoardBudget(boardId); // Update the board's budget after task creation

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Get all tasks for a board
//////////////////////////////////////////////////////

const getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({ board: boardId })
      .populate('vendor', 'name')
      .populate('board', 'title');

    //Check if board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if tasks exist
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this board' });
    }

    res.status(200).json({
      taskCount: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Update a task
//////////////////////////////////////////////////////

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      taskColor,
      dueDate,
      status,
      priority,
      position,
      vendor: vendorId,
    } = req.body;

    // Fetch the vendor details to get category and cost
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const category = vendor.category;
    const cost = vendor.cost;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        taskColor,
        dueDate,
        status,
        priority,
        position,
        vendor: vendorId,
        category,
        cost,
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate('vendor', 'name')
      .populate('board', 'title');

    // Update the board's budget after task update
    await updateBoardBudget(updatedTask.board._id);

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Delete a task
//////////////////////////////////////////////////////

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the board's budget after task deletion
    await updateBoardBudget(deletedTask.board);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByBoard,
  updateTask,
  deleteTask,
};
