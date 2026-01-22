require('dotenv').config({ path: '.env' })

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET
const MONGO_URL = process.env.MONGO_URL
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const LINE_USER_ID = process.env.LINE_USER_ID
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET

module.exports = {
    JWT_SECRET,
    PORT,
    MONGO_URL,
    LINE_CHANNEL_ACCESS_TOKEN,
    LINE_USER_ID,
    LINE_CHANNEL_SECRET
}