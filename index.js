const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000

const mongoose = require('mongoose');
const { Books, Authors } = require('./BookAutherShema');
mongoose.connect('mongodb://localhost:27017/local')
    .then(() => {
        console.log('Mongoose Connected successfully');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(express.json())

const globalErrorHandling = async (err, req, res, next) => {
    res.json(err.message)
    next();
}

app.post("/BookAuthor/book", async (req, res) => {
    try {
        console.log(req.body.Rating);
        const books = await Books.create({
            title: req.body.title,
            publishedYear: req.body.publishedYear,
            rating: req.body.rating,
            pageCount: req.body.pageCount,
            Authors: req.body.Authors
        })
        res.status(201).json(books)
    } catch (err) {
        res.json(err.message);
    }
})

app.post("/BookAuthor/Author", async (req, res) => {
    try {
        const authors = await Authors.create({
            name: req.body.name,
            BirthYear: req.body.BirthYear,
            gender: req.body.gender,
            location: req.body.location,
            Books: req.body.Books
        })
        res.status(201).json(authors)
    }
    catch (err) {
        res.json(err.message);
    }
})

app.get("/BookAuthor/Book", async (req, res) => {
    try {
        const Book = await Books.aggregate([
            {
                $lookup: {
                    from: 'authors',
                    localField: 'Authors',
                    foreignField: '_id',
                    as: 'Authors',
                }
            },
            {
                $project: {
                    title: true,
                    publishedYear: true,
                    pageCount: true,
                    rating: true,
                    Authors:
                    {
                        name: true,
                        BirthYear: true,
                    },
                },
            }
        ]);
        res.json({
            length: Book.length,
            Book
        })
    }
    catch (err) {
        res.json(err.message);
    }
})
app.get("/BookAuthor/Author", async (req, res) => {
    try {
        const authors = await Authors.aggregate([
            {
                $lookup: {
                    from: 'books',
                    localField: "Books",
                    foreignField: "_id",
                    as: "Books"
                }
            },
            {
                $project: {
                    name: true,
                    BirthYear: true,
                    gender: true,
                    location: true,
                    Books: {
                        title: true,
                        publishedYear: true,
                    }

                }
            }
        ])

        res.json({
            count: authors.length,
            authors
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.put("/BookAuthor/Book/:bookid", async (req, res) => {
    try {
        const bookId = req.params.bookid;
        const { authors, title, publishedYear, rating, pageCount } = req.body;

        const updatedBook = await Books.findByIdAndUpdate(bookId, {
            title: title,
            publishedYear: publishedYear,
            rating: rating,
            pageCount: pageCount,
            Authors: authors
        }, { new: true });
        res.json(updatedBook)
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
)

app.put("/BookAuthor/Author/:authorid", async (req, res) => {
    try {
        const authorId = req.params.authorid;
        console.log(authorId);
        const updatedAuthor = await Authors.findByIdAndUpdate(authorId, {
            name: req.body.name,
            BirthYear: req.body.BirthYear,
            location: req.body.location,
            gender: req.body.gender,
            Books: req.body.Books
        }, { new: true });
        res.json(updatedAuthor)
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})
app.delete("/BookAuthor/Book/:id", async (req, res) => {
    try {
        const deletedBookId = req.params.id
        const deletedBooks = await Books.findByIdAndDelete(deletedBookId)
        if (!deletedBooks) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "Book deleted successfully", deletedBooks });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.delete("/BookAuthor/Author/:id", async (req, res) => {
    try {
        const deletedAuthorId = req.params.id
        const deletedAuthor = await Authors.findByIdAndDelete(deletedAuthorId)
        if (!deletedAuthor) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "Author deleted successfully", deletedAuthor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.listen(port, (err) => {
    if (err) {

        console.error("Error starting the server:", err);
    } else {
        console.log("Server has started on port " + port);
    }
});