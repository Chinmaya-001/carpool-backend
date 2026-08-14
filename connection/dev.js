const mongoose = require("mongoose")

const connectToDb = async () => {
    return await mongoose.connect("mongodb://localhost:27017/carpool")
}

module.exports = {
    connectToDb,
};