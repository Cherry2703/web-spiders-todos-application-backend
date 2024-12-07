const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = 3000;
const MONGO_URI = "mongodb+srv://ramcharanamr2408:XPHQvpkAAYCQUW91@cluster0.pjllx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 
const JWT_SECRET = "my_secret_jwt_token";

let db;

// Connect to MongoDB
(async () => {
    try {
        const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB Atlas!");
        db = client.db("todosDatabase"); // Replace with your database name
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
})();

// Middleware for JWT token verification
const middleWare = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (authHeader) {
        const jwtToken = authHeader.split(" ")[1];
        jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
            if (error) {
                return response.status(401).send({ message: "Invalid Token" });
            }
            request.username = payload.username;
            next();
        });
    } else {
        response.status(401).send({ message: "Authorization header missing" });
    }
};

// Basic route to check server status
app.get("/", (req, res) => {
    res.send("Todos backend testing is working... go for different routes");
});

// Route for user signup
app.post("/signup/", async (request, response) => {
    const { username, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists." });
        }

        const user = {
            user_id: uuidv4(),
            username,
            email,
            password: hashedPassword,
            created_at: new Date(),
            role:"USER"
        };

        await db.collection("users").insertOne(user);
        response.status(201).send({ message: "User created successfully." });
    } catch (error) {
        console.error("Error in signup:", error.message);
        response.status(500).send({ message: "Internal server error." });
    }
});

// Route for user login
app.post("/login/", async (request, response) => {
    const { username, password } = request.body;

    try {
        const user = await db.collection("users").findOne({ username });
        if (!user) {
            return res.status(401).send({ message: "User not found." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            const token = jwt.sign({ username }, JWT_SECRET);
            response.status(200).send({ jwtToken: token });
        } else {
            response.status(400).send({ message: "Invalid Password" });
        }
    } catch (error) {
        console.error("Error in login:", error.message);
        response.status(500).send({ message: "Internal server error." });
    }
});

// Route to get user profile
app.get("/profile/", middleWare, async (req, res) => {
    try {
        const user = await db.collection("users").findOne({ username: req.username }, { projection: { password: 0 } });
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error in getting profile:", error.message);
        res.status(500).send({ message: "Internal server error." });
    }
});

// Route to update user profile
app.put("/profile/", middleWare, async (req, res) => {
    const { email, password, role } = req.body;
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (role) updates.role = role;

    try {
        const result = await db.collection("users").updateOne({ username: req.username }, { $set: updates });
        if (result.matchedCount) {
            res.status(200).send({ message: "Profile updated successfully." });
        } else {
            res.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error in updating profile:", error.message);
        res.status(500).send({ message: "Internal server error." });
    }
});

// Route to delete user profile
app.delete("/profile/", middleWare, async (req, res) => {
    try {
        const result = await db.collection("users").deleteOne({ username: req.username });
        if (result.deletedCount) {
            res.status(200).send({ message: "User deleted successfully." });
        } else {
            res.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error in deleting profile:", error.message);
        res.status(500).send({ message: "Internal server error." });
    }
});

// Route to get all todos
app.get("/todos/", middleWare, async (req, res) => {
    try {
        const user = await db.collection("users").findOne({ username: req.username });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const todos = await db.collection("todos").find({ user_id: user.user_id }).toArray();
        res.status(200).send({ todos });
    } catch (error) {
        console.error("Error in getting todos:", error.message);
        res.status(500).send({ message: "Internal server error." });
    }
});

// Route to create a new todo
app.post("/todos/", middleWare, async (req, res) => {
    const { title, description } = req.body;

    // Check if title and description are provided
    if (!title || !description) {
        return res.status(400).send({ message: "Title and description are mandatory." });
    }

    try {
        const user = await db.collection("users").findOne({ username: req.username });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const todo = {
            id: uuidv4(),
            user_id: user.user_id,
            title,
            description,
            created_at: new Date(),
            priority: "LOW",
            status: "TODO",
            is_deleted: 0
        };

        await db.collection("todos").insertOne(todo);
        res.status(201).send({ message: "Todo created successfully." });
    } catch (error) {
        console.error("Error in creating todo:", error.message);
        res.status(500).send({ message: "Internal server error." });
    }
});


app.put('/todos/:todoId/', middleWare, async (request, response) => {
    try {
        const { todoId } = request.params;
        const { title, description, status, priority, is_deleted } = request.body;

        const user = await db.collection("users").findOne({ username: request.username });

        if (!user) {
            return response.status(404).send({ message: "User not found." });
        } 
        // Finding the existing todo
        const todo = await db.collection("todos").findOne({ user_id: user.user_id, id: todoId });
        if (!todo) {
            return response.status(404).send({ message: "Todo not found." });
        }

        
        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (status !== undefined) updateFields.status = status;
        if (priority !== undefined) updateFields.priority = priority;
        if (is_deleted !== undefined) updateFields.is_deleted = is_deleted;

        // Updating the todo with the provided fields
        if (Object.keys(updateFields).length > 0) {
            await db.collection("todos").updateOne(
                { user_id: user.user_id, id: todoId },
                { $set: updateFields }
            );
        }
 
        response.status(200).send({ message: 'Task Updated Successfully.' });
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});


app.get("/todos/:todoId/", middleWare, async (request, response) => {
    const {todoId} = request.params
    try {
        const user = await db.collection("users").findOne({ username: request.username });
        if (!user) {
            return response.status(404).send({ message: "User not found." });
        }

        const todo = await db.collection("todos").findOne({ user_id: user.user_id ,id:todoId});
        response.status(200).send({ todo });
    } catch (error) {
        console.error("Error in getting todos:", error.message); 
        response.status(500).send({ message: "Internal server error." });
    }
});

app.delete('/todos/:todoId/',middleWare,async(request,response)=>{
    const {todoId} = request.params
    try {
        const user = await db.collection("users").findOne({ username: request.username });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        const result = await db.collection("todos").deleteOne({ user_id: user.user_id,id:todoId });
        if (result.deletedCount) {
            response.status(200).send({ message: "Task deleted successfully." });
        } else {
            response.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error in deleting profile:", error.message);
        response.status(500).send({ message: "Internal server error." });
    }
})


app.get('/users/', middleWare, async (request, response) => {
    try {
        const user = await db.collection("users").findOne({ username: request.username , role:'ADMIN' });
        if (!user) {
            return res.status(404).send({ message: "You cannot get all the users beacause you are not ADMIN." });
        }

        const todos = await db.collection("users").find().toArray();
        response.status(200).send({ todos });
    } catch (error) {
        console.error("Error in getting todos:", error.message); 
        response.status(500).send({ message: "Internal server error." });
    } 

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); 
});
