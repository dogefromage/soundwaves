const crypto = require("crypto");

module.exports = (length = 3) =>
{
    return crypto.randomBytes(length).toString("hex");
}