const express = require('express');
const {
  addChecklist,
  editChecklist,
  deleteChecklist,
  toggleChecklist,
  getAllChecklists,
} = require('../Controllers/checklistController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/add-checklist/:taskId', authenticateUser, addChecklist);
router.put('/edit-checklist/:taskId/:checklistId', authenticateUser, editChecklist);
router.delete('/delete-checklist/:taskId/:checklistId', authenticateUser, deleteChecklist);
router.put('/toggle-checklist/:taskId/:checklistId', authenticateUser, toggleChecklist);
router.get('/get-checklist/:taskId', authenticateUser, getAllChecklists);

module.exports = router;
