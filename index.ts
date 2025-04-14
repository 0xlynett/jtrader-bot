/*
Copyright (C) 2025 Arvensis Systems LLC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { configDotenv } from "dotenv";
import { normalizeHomoglyphs } from "supernormalize";
configDotenv();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

function sanitize(old: string): string {
  return normalizeHomoglyphs(old)
    .toLowerCase()
    .replaceAll(/[^a-zA-Z0-9]/g, "");
}

async function check(member: GuildMember) {
  if (member.user.bot) return;
  if (!member.bannable) return;

  if (
    sanitize(member.displayName).startsWith("jtrader") ||
    sanitize(member.user.displayName).startsWith("jtrader")
  ) {
    try {
      (await member.user.createDM()).send(
        "You've been banned for impersonation of J Trader. Please contact `jtrader14` for an appeal."
      );
      await member.ban({
        reason: "Impersonation of J Trader.",
      });
    } catch (e) {
      console.log(
        `Can't ban member: ${member.user.username} aka ${member.user.id}`
      );
    }
  }
}

client.on(Events.GuildMemberAdd, check);
client.on(Events.GuildMemberUpdate, (_, newMember) => check(newMember));

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
