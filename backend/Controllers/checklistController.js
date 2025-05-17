const Task = require('../Models/tasks');

//////////////////////////////////////////////////////
// Add a checklist to a task
//////////////////////////////////////////////////////

const addChecklist = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, isCompleted = false } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.checklists.push({ text, isCompleted }); // push data on the checklist array inside the task schema
    await task.save();

    res.status(200).json({ message: 'Checklist added successfully', task });
  } catch (error) {
    console.error('Add Checklist Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Edit a checklist
//////////////////////////////////////////////////////

const editChecklist = async (req, res) => {
  try {
    const { taskId, checklistId } = req.params;
    const { text, isCompleted } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const checklist = task.checklists.id(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    checklist.text = text;
    checklist.isCompleted = isCompleted;
    await task.save();

    res.status(200).json({ message: 'Checklist edited successfully', task });
  } catch (error) {
    console.error('Edit Checklist Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Delete a checklist
//////////////////////////////////////////////////////

const deleteChecklist = async (req, res) => {
  try {
    const { taskId, checklistId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const checklist = task.checklists.id(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    task.checklists.pull(checklistId);
    await task.save();

    res.status(200).json({ message: 'Checklist deleted successfully', task });
  } catch (error) {
    console.error('Delete Checklist Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Toggle a checklist
//////////////////////////////////////////////////////

const toggleChecklist = async (req, res) => {
  try {
    const { taskId, checklistId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const checklist = task.checklists.id(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    checklist.isCompleted = !checklist.isCompleted;
    await task.save();

    res.status(200).json({ message: 'Checklist toggled successfully', task });
  } catch (error) {
    console.error('Toggle Checklist Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// get all checklists for a task
//////////////////////////////////////////////////////

const getAllChecklists = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({
      checklistLength: task.checklists.length,
      checklists: task.checklists,
    });
  } catch (error) {
    console.error('Get Checklists Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addChecklist,
  editChecklist,
  deleteChecklist,
  toggleChecklist,
  getAllChecklists,
};
