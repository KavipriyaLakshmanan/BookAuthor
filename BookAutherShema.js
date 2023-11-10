const mongoose = require("mongoose")

const BookSchema = new mongoose.Schema({
    title: String,
    publishedYear: Number,
    rating: Number,
    pageCount: Number,
    Authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authors'
    }]
});
const Books = mongoose.model('Books', BookSchema);

const AuthorSchema = new mongoose.Schema({
    name: String,
    BirthYear: Number,
    gender: String,
    location: String,
    Books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books'
    }]
});
const Authors = mongoose.model('Authors', AuthorSchema);


module.exports = { Books, Authors }