const { User } = require("./userSchema")

const handelGetAllUser = async (req, res) => {
    const result = await User.find({})
    const noOfUsers = await result.length
    return res.status(200).json({ success: true, message: "All users !", data: result });
}

const handelGetUserById = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found", data: null });
    }
    return res.status(200).json({ success: true, message: "User found !", data: user })
}

const handelUpdateUser = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found !",
            data: null
        })
    }

    const body = await req.body;

    const updatedData = Object.keys(body);
    updatedData.map((key) => {
        user[key] = body[key]
    })

    try {

        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });

        return res.status(200).json({
            success: true,
            message: "User updated !",
            data: updatedUser
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: "Faild to update user data !",
            data: null
        })
    }
}

const makeUserInActive = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)

    if (!user) return res.status(404).json({ success: false, message: "User not found.", data: null })

    user.isActive = false

    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    console.log(updatedUser)

    return res.status(200).json(
        {
            success: true,
            message: "Status updated",
            data: updatedUser
        })
}

const handelDeleteUser = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)

    if (!user) return res.status(404).json({ success: false, message: "User not found.", data: null })


    const result = await User.findByIdAndDelete(id);

    console.log(result)

    return res.json({ success: true, message: "User deleted !", data: null })

}

module.exports = {
    handelGetAllUser,
    handelUpdateUser,
    handelGetUserById,
    makeUserInActive,
    handelDeleteUser
}