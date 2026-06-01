const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if user already exists 
const doesExist = (username) => {
    return users.some(user => user.username === username);
};

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. You can now login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    new Promise((resolve, reject) => {
      resolve(books);  
    })
    .then((successMessage) => {
      res.json(successMessage);  
    })
    .catch((error) => {
      return res.status(400).json({ message: error });
    });
  });


// Get book by ISBN 
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
      res.json(book);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
  });

  
// Get book based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    new Promise((resolve, reject) => {
      const booksByAuthor = [];
  
      for (let isbn in books) {
        if (books[isbn].author === author) {
          booksByAuthor.push({ isbn: isbn, ...books[isbn] });
        }
      }
  
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found by this author");
      }
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
  }); 


// Get books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];

    for (let isbn in books) {
        if (books[isbn].title === title) {
            booksByTitle.push({ isbn: isbn, ...books[isbn] });
        }
    }

    if (booksByTitle.length > 0) {
        res.json(booksByTitle);
    } else {
        res.status(404).json({ message: "No books found with the given title" });
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
