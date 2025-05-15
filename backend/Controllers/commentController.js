const Task = require('../Models/tasks');

//////////////////////////////////////////////////////
// Add a comment to a task
//////////////////////////////////////////////////////

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { user, text, createdAt } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({ user, text, createdAt: new Date() });
    await task.save();

    res.status(200).json({ message: 'Comment added successfully', task });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Edit a comment
//////////////////////////////////////////////////////

const editComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text, updatedAt } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.text = text;
    comment.updatedAt = new Date();

    await task.save();

    res.status(200).json({ message: 'Comment edited successfully', task });
  } catch (error) {
    console.error('Edit Comment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Delete a comment
//////////////////////////////////////////////////////

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    task.comments.pull(commentId);
    await task.save();

    res.status(200).json({ message: 'Comment deleted successfully', task });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// Get all comments for a task
//////////////////////////////////////////////////////

const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ comments: task.comments });
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  getComments,
};
