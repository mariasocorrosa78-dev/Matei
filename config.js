require("dotenv").config();

const required = [
  "DISCORD_TOKEN",
  "CLIENT_ID",
  "GUILD_ID",
  "STAFF_ROLE_ID",
  "TICKET_CATEGORY_ID"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  staffRoleId: process.env.STAFF_ROLE_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID
};
