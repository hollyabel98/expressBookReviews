const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if user exists 
const doesExist = (username) => {
    return users.some(user => user.username === username);
};

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. You can now login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    })
    .then((book) => {
      console.log("Book found:", book);
      res.json(book);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
  });  

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];


        for (let isbn in books) {
        if (books[isbn].author === author) {
            booksByAuthor.push({ isbn: isbn, ...books[isbn] });
        }
    }


    if (booksByAuthor.length > 0) {
        res.send(booksByAuthor);
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title= req.params.title;
    const booksByTitle = [];


        for (let isbn in books) {
        if (books[isbn].title === title) {
            booksByTitle.push({ isbn: isbn, ...books[isbn] });
        }
    }


    if (booksByTitle.length > 0) {
        res.send(booksByTitle);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;


    if (books[isbn]) {
       res.send(books[isbn].reviews);  
       } else {
           res.send({ message: "No reviews available for this book." });  
   }
});


module.exports.general = public_users;
