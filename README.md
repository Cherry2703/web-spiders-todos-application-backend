####  Todo App API   #####


### Overview
This is a simple RESTful API built using Node.js, Express, and MongoDB. The application provides user authentication, profile management, and a CRUD functionality for managing todo items. Users can create, read, update, and delete todos, with user roles and authentication using JWT tokens.

### Features
User Registration and Login: Secure user authentication with JWT tokens and password hashing.
User Profile Management: Update and delete user profiles.
Todo Management: Create, read, update, and delete todo items.
Role-Based Access Control: Limited access based on user roles (e.g., admin can view all users).
Secure Routes: Protected routes using JWT-based middleware.


### Tech Stack
Backend Framework: Node.js with Express
Database: MongoDB (via MongoDB Atlas)
Authentication: JWT (JSON Web Tokens)
Password Hashing: bcrypt
UUID Generation: UUID library for unique identifiers


### Prerequisites
Ensure you have the following installed:
Node.js (version 14 or above)
MongoDB Atlas account with a cluster set up


### Installation
Clone the repository:

git clone https://github.com/Cherry2703/web-spiders-todos-application-backend.git
cd todo-app

Install dependencies:
npm install

Set up your environment:
Replace MONGO_URI and JWT_SECRET in the code with your MongoDB connection string and a secure secret for JWT.
Run the application:

npm start

The server will start and be accessible at http://localhost:3000.



### API Endpoints

## 1. User Routes

# POST /signup/
Description: Register a new user.

Request Body:

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
201 Created - User created successfully.
400 Bad Request - User already exists.
500 Internal Server Error - Error in user creation.


# POST /login/
Description: Log in a user and receive a JWT token.

Request Body:

{
  "username": "string",
  "password": "string"
}

Response:
200 OK - JWT token returned.
401 Unauthorized - User not found.
400 Bad Request - Invalid password.


# GET /profile/
Description: Get the current user's profile. Requires JWT token for authorization.

Response:
200 OK - User profile details.
404 Not Found - User not found.
500 Internal Server Error - Error fetching profile.


# PUT /profile/
Description: Update the current user's profile.

Request Body:

{
  "email": "string",
  "password": "string",
  "role": "string"
}

Response:
200 OK - Profile updated successfully.
404 Not Found - User not found.
500 Internal Server Error - Error updating profile.


# DELETE /profile/
Description: Delete the current user's profile.

Response:
200 OK - User deleted successfully.
404 Not Found - User not found.
500 Internal Server Error - Error deleting profile.



## 2. Todo Routes

# GET /todos/
Description: Get all todos for the authenticated user.
Response:

200 OK - List of todos.
404 Not Found - User not found.
500 Internal Server Error - Error fetching todos.


# POST /todos/
Description: Create a new todo item.

Request Body:
{
  "title": "string",
  "description": "string"
}

Response:
201 Created - Todo created successfully.
404 Not Found - User not found.
500 Internal Server Error - Error creating todo.


# GET /todos/:todoId/
Description: Get a specific todo item by ID.

Response:

200 OK - Todo item details.
404 Not Found - Todo not found.
500 Internal Server Error - Error fetching todo.


# PUT /todos/:todoId/
Description: Update a specific todo item by ID.

Request Body:
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "is_deleted": "boolean"
}

Response:
200 OK - Todo updated successfully.
404 Not Found - Todo not found.
500 Internal Server Error - Error updating todo.


# DELETE /todos/:todoId/
Description: Delete a specific todo item by ID.

Response:
200 OK - Todo deleted successfully.
404 Not Found - Todo not found.
500 Internal Server Error - Error deleting todo.


## 3. Admin Routes

# GET /users/
Description: Get a list of all users. Restricted to admin users only.

Response:
200 OK - List of users.
404 Not Found - Admin user not found.
500 Internal Server Error - Error fetching users.

### Security Considerations
The JWT_SECRET must be kept secure and not shared publicly.
Ensure the MONGO_URI is kept secure and not included in public repositories.
