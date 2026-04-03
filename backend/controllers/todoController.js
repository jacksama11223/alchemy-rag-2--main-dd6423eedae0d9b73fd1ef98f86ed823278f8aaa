
const Todo = require('../models/Todo');

// @desc    Get todos
// @route   GET /api/todos
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    const mapped = todos.map(t => {
        const obj = t.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error in getTodos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create todo
// @route   POST /api/todos
const createTodo = async (req, res) => {
  try {
    const todoData = req.body;
    // Remove frontend temporary ID if it exists
    delete todoData.id; 
    
    const todo = new Todo({
      ...todoData,
      user: req.user._id
    });

    const createdTodo = await todo.save();
    const obj = createdTodo.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error('Error in createTodo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
const updateTodo = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const todo = await Todo.findById(req.params.id);

    if (todo) {
      if (todo.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      
      // Update fields
      Object.assign(todo, req.body);
      
      const updatedTodo = await todo.save();
      const obj = updatedTodo.toObject();
      obj.id = obj._id;
      delete obj._id;
      res.json(obj);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error in updateTodo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete todo (Hard delete or just update isDeleted flag via PUT)
// @route   DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const todo = await Todo.findById(req.params.id);

    if (todo) {
      if (todo.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      await todo.deleteOne();
      res.json({ message: 'Todo removed' });
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error in deleteTodo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
