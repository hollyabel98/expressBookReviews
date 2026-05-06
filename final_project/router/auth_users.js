const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
  }

  const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Attach user info to request object
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
};
const authenticatedUser = (username,password)=>{ //returns boolean
// Check if the user with the given username and password exists
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;  // get username from verified token
    const review = req.body.review;

    if (!isbn || !review) {
        return res.status(400).send("ISBN and review are required.");
    }

    if (!books[isbn]) {
        return res.status(404).send("Book not found.");
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update the user's review for this ISBN
    books[isbn].reviews[username] = review;

    res.status(200).send(`Review for ISBN ${isbn} by user ${username} has now been added/updated.`);
});
  

regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // get username from verified token

    if (books[isbn]) {
        const reviews = books[isbn].reviews;

        if (reviews && reviews[username]) {
            delete reviews[username]; // delete the user's review
            return res.send(`Review for user ${username} has been deleted.`);
        } else {
            return res.status(404).send("No review found for this user.");
        }
    } else {
        return res.status(404).send("Book not found.");
    }
});
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
