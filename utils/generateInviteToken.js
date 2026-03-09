
const { v4: uuidv4 } = require("uuid");

module.exports = function generateInviteToken() {
  return uuidv4();
};
