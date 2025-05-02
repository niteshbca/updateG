const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const attendee = require('../models/attendee.login.schema')

const attendeeHandler = {
    getauthority: async (req, res) => {
        try {
           
           const {username,password}= req.body;
            const user = await attendee.findOne({username})
            console.log(user)
            if (!user) {
                return res.status(404).send({message:"Invalid User"})
            }

            const isvalidUser = await bcrypt.compare(password, user.password)
            if (!isvalidUser) {
                return res.status(400).send({ message: "Incorrect Password" })
            }
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "5min" })
            return res.status(200).json({ token })
        } catch (error) {
            console.error(error)
            return res.status(500).send('internal server error')
        }

    },
    addauthority: async (req, res) => {
        try {
            const { username, password,name } = req.body
            console.log(username,password)
            console.log(username, password)
            const user = await attendee.findOne({ username:username })
            if (user) {
                return res.send("user exists")
            }
            const hashPassword = await bcrypt.hash(password,10)
            const newauthority = new attendee({
                name,
                username,
                password:hashPassword
            })
            await newauthority.save()
            return res.send("saves successfully")


        } catch (error) {
            console.error(error)
            return res.status(500).send("internal server error")
        }
    },
    getAllAuthority:async(req,res)=>{
        try{
        const {username,password}=req.body
        const users = await attendee.find()
        console.log(users)
        res.send(users)
        }catch(err){
            console.log(err)
        }
    },
    deleteuser: async (req, res) => {
        try {
            const userId = req.params.id;
            const deleteUser = await attendee.findByIdAndDelete(userId)
            if (!deleteUser) {
                return res.status(404).json({ message: 'user not found' })
            }
            res.status(200).json({ message: "user deleted successfully" })
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }
}
module.exports = attendeeHandler