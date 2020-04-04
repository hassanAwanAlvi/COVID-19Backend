const mongoose = require('mongoose')
console.log(process.env.MONGODB_URL)
// const mongoDBURL =
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
})

