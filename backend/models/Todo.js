
const mongoose = require('mongoose');

const subtaskSchema = mongoose.Schema({
  id: { type: String },
  content: { type: String },
  isCompleted: { type: Boolean, default: false }
});

const attachmentSchema = mongoose.Schema({
  id: { type: String },
  name: { type: String },
  url: { type: String },
  type: { type: String, enum: ['file', 'image'] }
});

const commentSchema = mongoose.Schema({
  id: { type: String },
  text: { type: String },
  createdAt: { type: String },
  author: { type: String }
});

const todoSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  description: { type: String },
  priority: { type: Number, default: 4 }, // 1, 2, 3, 4
  dueDate: { type: String }, // ISO string or 'today'/'tomorrow'
  projectId: { type: String, default: 'inbox' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: String },
  tags: [String],
  subtasks: [subtaskSchema],
  status: { type: String, default: 'todo' }, // todo, in-progress, done
  startDate: { type: String },
  isMilestone: { type: Boolean, default: false },
  reminderTime: { type: String },
  recurrence: { type: String, default: 'none' },
  isDeleted: { type: Boolean, default: false },
  linkedFeature: { type: String },
  attachments: [attachmentSchema],
  comments: [commentSchema],
  progress: { type: Number, default: 0 }
}, {
  timestamps: true,
});

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
