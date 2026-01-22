const axios = require("axios");
const { LINE_CHANNEL_ACCESS_TOKEN } = require("../utils/constants");

async function sendLineMessage(to, text) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to,
        messages: [
          {
            type: "text",
            text
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.error("LINE Message Error:", error.response?.data || error.message);
  }
}

module.exports = { sendLineMessage };
