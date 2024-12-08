
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 3005;
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// // Middleware to parse JSON requests
// app.use(express.json());

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Schemas
// const todosSchema = new mongoose.Schema({
//   taskId: { type: String, unique: true },
//   title: String,
//   description: String,
//   user_id: String,
//   priority: String,
//   status: String,
//   created_at: { type: Date, default: Date.now },
// });

// const userSchema = new mongoose.Schema({
//   user_id:{type:String,unique:true},
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   created_at: { type: Date, default: Date.now },
//   role: { type: String, default: "USER" },
// });

// // Models
// const TodosModel = mongoose.model('todos', todosSchema);
// const UserModel = mongoose.model('users', userSchema);

// // Routes
// app.get('/', async (req, res) => {
//   res.send(' application is working go for different routes.... thank you!');
// });



// // Signup Route
// app.post('/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   if (!username || !email || !password) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     // Check if the username or email already exists
//     const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username or email already exists." });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const newUser = new UserModel({
//       user_id:uuidv4(),
//       username,
//       email,
//       password: hashedPassword,
//       created_at: new Date(),
//       role: "USER",
//     });

//     // Save the user to the database
//     await newUser.save();
//     res.status(201).json({ message: "User created successfully." });
//   } catch (error) {
//     console.error("Error during signup:", error.message);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// // Login Route
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: "Username and password are required." });
//   }

//   try {
//     // Find the user by username
//     const user = await UserModel.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Compare the provided password with the stored hashed password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ username: user.username, userId: user.user_id }, JWT_SECRET, { expiresIn: "1h" });

//     res.status(200).json({ message: "Login successful", jwtToken: token });
//   } catch (error) {
//     console.error("Error during login:", error.message);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });




// const Middleware = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (authHeader) {
//       const token = authHeader.split(" ")[1];
//       jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//           return res.status(401).json({ message: "Invalid or expired token." });
//         }
//         req.userId = decoded.userId; // Attach userId to the request object
//         next();
//       });
//     } else {
//       return res.status(401).json({ message: "Authorization token required." });
//     }
//   };



//   app.get('/tasks/', Middleware, async (req, res) => {
//     try {
//       const userId = req.userId; // Extract userId from the middleware
//       const todos = await TodosModel.find({ user_id: userId });
  
//       if (todos.length === 0) {
//         return res.status(404).json({ message: "There are no Tasks to show. Create new tasks!" });
//       }
  
//       res.status(200).json(todos);
//     } catch (error) {
//       console.error("Error retrieving todos:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });

//   app.post("/tasks/", Middleware, async (req, res) => {
//     const { title, description, priority = "LOW", status = "TODO" } = req.body;
  
//     // Validate input
//     if (!title || !description) {
//       return res.status(400).json({ message: "Title and description are mandatory." });
//     }
  
//     try {
//       // Use `req.userId` set by the Middleware to identify the user
//       const user = await UserModel.find({user_id:req.userId});
//       if (!user) {
//         return res.status(404).json({ message: "User not found." });
//       }
  
//       // Create the new todo object
//       const todo = new TodosModel({
//         user_id: req.userId,
//         taskId:uuidv4(),
//         title,
//         description,
//         priority,
//         status,
//       });
  
//       // Save the todo to the database
//       await todo.save();
//       res.status(201).json({ message: "Todo created successfully.", todo });
//     } catch (error) {
//       console.error("Error in creating todo:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });



//   app.put('/tasks/:taskId', Middleware, async (req, res) => {
//     try {
//       const { taskId } = req.params;
//       const { title, description, status, priority } = req.body;
  
//       // Find user using the `req.userId` set by the middleware
//       const user = await UserModel.find({user_id:req.userId});
//       if (!user) {
//         return res.status(404).json({ message: "User not found." });
//       }
  
//       // Find the todo belonging to the user
//       const todo = await TodosModel.findOne({ taskId: taskId, user_id: req.userId });
//       if (!todo) {
//         return res.status(404).json({ message: "Todo not found." });
//       }
  
//       // Build the update object dynamically
//       const updateFields = {};
//       if (title !== undefined) updateFields.title = title;
//       if (description !== undefined) updateFields.description = description;
//       if (status !== undefined) updateFields.status = status;
//       if (priority !== undefined) updateFields.priority = priority;
  
//       if (Object.keys(updateFields).length > 0) {
//         // Update the todo
//         const updatedTodo = await TodosModel.findOneAndUpdate(
//           { taskId: taskId, user_id: req.userId }, // Query to ensure we only update the correct todo
//           { $set: updateFields }, // Update object
//           { new: true } // Return the updated document
//         );
//         return res.status(200).json({ message: "Todo updated successfully.", updatedTodo });
//       } else {
//         return res.status(400).json({ message: "No valid fields to update." });
//       }
//     } catch (error) {
//       console.error("Error in updating todo:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });
  


//   app.delete('/tasks/:taskId', Middleware, async (req, res) => {
//     try {
//       const { taskId } = req.params;
  
//       // Find user using the `req.userId` set by the middleware
//       const user = await UserModel.find({user_id:req.userId});
//       if (!user) {
//         return res.status(404).json({ message: "User not found." });
//       }
  
//       // Find and delete the todo belonging to the user
//       const result = await TodosModel.findOneAndDelete({ taskId: taskId, user_id: req.userId });
  
//       if (result) {
//         return res.status(200).json({ message: "Todo deleted successfully." });
//       } else {
//         return res.status(404).json({ message: "Todo not found or already deleted." });
//       }
//     } catch (error) {
//       console.error("Error in deleting todo:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });
  
  
//   app.get('/tasks/:taskId/',Middleware,async(req,res)=>{
//     try {
//       const {taskId} = req.params
//       const todos = await TodosModel.find({ user_id: req.userId,taskId:taskId });
  
//       if (todos.length===0) {
//         return res.status(404).json({ message: "Cannot find the task..." });
//       }
  
//       res.status(200).json(todos);
//     } catch (error) {
//       console.error("Error retrieving task:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   })


//   app.get('/profile/', Middleware, async (req, res) => {
//     try {
//       const profile = await UserModel.find({ user_id: req.userId });
//       if (profile.length === 0) {
//         return res.status(404).json({ message: "No todos found for this user." });
//       }
//       res.status(200).json(profile); 
//     } catch (error) {
//       console.error("Error retrieving todos:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });


//   app.put('/profile/', Middleware, async (req, res) => {
//     try {
//       const { username, email, password, role } = req.body;
  
//       // Build the update object dynamically
//       const updateFields = {};
  
//       if (username !== undefined) updateFields.username = username;
//       if (email !== undefined) updateFields.email = email;
//       if (password !== undefined) {
//         // Hash the password only if it's provided in the request
//         updateFields.password = await bcrypt.hash(password, 10);
//       }
//       if (role !== undefined) updateFields.role = role;
  
//       // Check if there are any fields to update
//       if (Object.keys(updateFields).length === 0) {
//         return res.status(400).json({ message: "No valid fields provided to update." });
//       }
  
//       // Update the user's profile
//       const result = await UserModel.updateOne(
//         { user_id: req.userId },
//         { $set: updateFields }
//       );
  
//       if (result.matchedCount > 0) {
//         res.status(200).json({ message: "Profile updated successfully." });
//       } else {
//         res.status(404).json({ message: "User not found." });
//       }
//     } catch (error) {
//       console.error("Error in updating profile:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   });
  





//   app.delete("/profile/", Middleware, async (req, res) => {
//     try {
//         const result = await db.collection("users").deleteOne({ user_id: req.userId }); 
//         if (result.deletedCount) {
//             res.status(200).send({ message: "User deleted successfully." });
//         } else {
//             res.status(404).send({ message: "User not found." });
//         }
//     } catch (error) {
//         console.error("Error in deleting profile:", error.message);
//         res.status(500).send({ message: "Internal server error." });
//     }
// });


// app.get('/users/',Middleware,async(req,res)=>{
//   try {
//     const users = await UserModel.find({ user_id: req.userId,role:'ADMIN' });



//     if (users.length === 0) {
//       return res.status(404).json({ message: "You are not an ADMIN to get all the Users." });
//     }

//     const allUsers = await UserModel.find({})

//     res.status(200).json(allUsers);
//   } catch (error) {
//     console.error("Error retrieving todos:", error.message);
//     res.status(500).json({ message: "Internal server error." });
//   }
// })

// // Start Server
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}/`);
// });









const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  role: { type: String, default: "USER" },
});

const todosSchema = new mongoose.Schema({
  taskId: { type: String, unique: true },
  title: String,
  description: String,
  user_id: String,
  priority: String,
  status: String,
  created_at: { type: Date, default: Date.now },
});

// Models
const UserModel = mongoose.model('users', userSchema);
const TodosModel = mongoose.model('todos', todosSchema);

// Validation schemas
const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('USER', 'ADMIN'),
});

const todoValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('LOW'),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default('TODO'),
});

// Middleware for authentication and role-based access control
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
      req.userId = decoded.userId;
      req.role = decoded.role;
      next();
    });
  } else {
    return res.status(401).json({ message: "Authorization token required." });
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.role !== role) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

// Routes
app.get('/', (req, res) => {
  res.send('Application is working. Go to different routes. Thank you!');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate input
  const { error } = userValidationSchema.validate({ username, email, password, role });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      user_id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: role || "USER",
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ username: user.username, userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", jwtToken: token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Middleware to validate request data for creating/updating todos
const validateTodoData = (req, res, next) => {
  const { error } = todoValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Task Routes
app.get('/tasks/', authenticateToken, async (req, res) => {
  try {
    const todos = await TodosModel.find({ user_id: req.userId });
    if (todos.length === 0) {
      return res.status(404).json({ message: "No tasks found. Create new tasks!" });
    }
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error retrieving todos:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post('/tasks/', authenticateToken, validateTodoData, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const newTodo = new TodosModel({
      user_id: req.userId,
      taskId: uuidv4(),
      title,
      description,
      priority,
      status,
    });
    await newTodo.save();
    res.status(201).json({ message: "Todo created successfully.", newTodo });
  } catch (error) {
    console.error("Error creating todo:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put('/tasks/:taskId', authenticateToken, validateTodoData, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority } = req.body;

    const todo = await TodosModel.findOne({ taskId, user_id: req.userId });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    const updatedTodo = await TodosModel.findOneAndUpdate(
      { taskId, user_id: req.userId },
      { $set: { title, description, status, priority } },
      { new: true }
    );

    res.status(200).json({ message: "Todo updated successfully.", updatedTodo });
  } catch (error) {
    console.error("Error updating todo:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await TodosModel.findOneAndDelete({ taskId, user_id: req.userId });

    if (result) {
      res.status(200).json({ message: "Todo deleted successfully." });
    } else {
      res.status(404).json({ message: "Todo not found." });
    }
  } catch (error) {
    console.error("Error deleting todo:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Profile Routes
app.get('/profile/', authenticateToken, async (req, res) => {
  try {
    const profile = await UserModel.findOne({ user_id: req.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error retrieving profile:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put('/profile/', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedProfile = await UserModel.findOneAndUpdate(
      { user_id: req.userId },
      { $set: updates },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully.", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.delete('/profile/', authenticateToken, async (req, res) => {
  try {
    const result = await UserModel.findOneAndDelete({ user_id: req.userId });
    if (result) {
      res.status(200).json({ message: "Profile deleted successfully." });
    } else {
      res.status(404).json({ message: "Profile not found." });
    }
  } catch (error) {
    console.error("Error deleting profile:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Admin-only Route
app.get('/users/', authenticateToken, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



