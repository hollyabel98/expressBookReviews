const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
     const isbn = req.params.isbn;
      res.send(books[isbn]);
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
