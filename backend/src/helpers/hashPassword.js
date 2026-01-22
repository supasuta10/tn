const bcrypt = require('bcrypt')

const hashPassword = async (password) => {
    try {
        const saltRounds = 10

        const hashedPassword = await bcrypt.hash(password, saltRounds)

        return hashedPassword
    } catch (error) {
        throw new Error(`Error hashing password: ${error}`);
    }
}

const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        throw new Error(`Error comparing passwords: ${error}`);
    }
}

module.exports = {
    hashPassword,
    comparePassword
}