import type { APIEmbed, APIEmbedField, Client } from "discord.js";
import { Colors } from "discord.js";
import type { Brawler, Map, Match, Player, Pun, Team } from "./types.ts";
import { EmbedBuilder } from "discord.js";
import { LiquidDB } from "./api.ts";
import { findPrintableName } from "./mediawiki.ts";
import { Helper, stringUtils as stringUtil } from "./helper.ts";

const helper = new Helper();
const stringUtils = new stringUtil();
export class MyEmbeds {
	matchEmbedFields(match: Match[], matchNumber: number, gameNumber: number) {
		const gameNum = gameNumber + 1;
		if (match[matchNumber].match2games.length == 0) {
			return [
				{
					name: "<:combat:1292086786872442973> Game not logged",
					value: "Games are not logged for this set.",
				},
			] as APIEmbedField[];
		}
		const game = match[matchNumber].match2games[gameNumber];
		if (Object.values(game.participants).length !== 0 && Object.values(game.scores).length !== 0) {
			return [
				{
					name: `<:combat:1292086786872442973> Game ${gameNum}`,
					value: "\u200b",
				},
				{
					name: "<:bs_map:1291686752569921546> **Played On**",
					value: game.map,
					inline: true,
				},
				{
					name: "<:score:1291686732621676605> **Game Score**",
					value: `**${match[matchNumber].match2opponents[game.winner - 1].name}** won - ${game.scores[0]}:${game.scores[1]}`,
					inline: true,
				},
				{
					name: "<:brawlers:1291686735906078861> **Picks**",
					value: `1. **${game.participants["1_1"].brawler}**, **${game.participants["1_2"].brawler}**, **${game.participants["1_3"].brawler}**\n2. **${game.participants["2_1"].brawler}**, **${game.participants["2_2"].brawler}**, **${game.participants["2_3"].brawler}**`,
				},
				{
					name: "<:bans:1291686740486131772> **Bans**",
					value: `${helper.getBanList(game.extradata)}`,
				},
			] as APIEmbedField[];
		}
		throw new Error("matchNumber/gameNumber out of bounds");
	}
	async searchBrawler(query: string) {
		const obj = await LiquidDB.get("brawler", query);
		const brawler = <Brawler>obj.result;
		if (!obj.queryExists || !obj.result) {
			return new EmbedBuilder()
				.setTitle("Brawler not found")
				.setColor(Colors.DarkRed)
				.setDescription("Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail.");
		}
		// Brawler definitely exists
		return new EmbedBuilder()
			.setTitle(`<:bsStar:1292082767848542208> ${brawler.name} <:bsStar:1292082767848542208>`)
			.setDescription(brawler.description)
			.setColor(Number("0x" + brawler.rarity.color.split("#")[1]))
			.setURL(("https://www.liquipedia.net/brawlstars/" + brawler.name).replace(/\s/g, "%20"))
			.setThumbnail(brawler.imageUrl)
			.addFields([
				{
					name: "<:star_power:1276418263911497810> " + brawler.starPowers[0].name,
					value: brawler.starPowers[0].description,
					inline: true,
				},
				{
					name: "<:star_power:1276418263911497810> " + brawler.starPowers[1].name,
					value: brawler.starPowers[1].description,
					inline: true,
				},
				{
					name: "\u200b",
					value: "\u200b",
					inline: true,
				},
				{
					name: `<:gadget:1276418294592573460> ${brawler.gadgets[0].name}`,
					value: brawler.gadgets[0].description,
					inline: true,
				},
				{
					name: `<:gadget:1276418294592573460> ${brawler.gadgets[1].name}`,
					value: brawler.gadgets[1].description,
					inline: true,
				},
				{
					name: "\u200b",
					value: "\u200b",
					inline: true,
				},
			]);
	}
	async searchMap(query: string) {
		const obj = await LiquidDB.get("map", query);
		const map = <Map>obj.result;
		if (!obj.queryExists || !obj.result) {
			return new EmbedBuilder()
				.setTitle("Map not found")
				.setColor(Colors.DarkRed)
				.setDescription("Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail.");
		}
		return new EmbedBuilder()
			.setTitle(`<:bs_map:1291686752569921546> ${map.name} <:bs_map:1291686752569921546>`)
			.setDescription(`> Gamemode: [${map.gamemode.name}](${map.gamemode.link})`)
			.setImage(map.imageUrl)
			.setURL(map.link)
			.setColor(Number("0x" + map.gamemode.color.split("#")[1]));
	}
	async searchPlayer(query: string) {
		const obj = await LiquidDB.get("player", query);
		const player = <Player>obj.result;
		if (!obj.queryExists || !obj.result) {
			return new EmbedBuilder()
				.setTitle("Player not found")
				.setColor(Colors.DarkRed)
				.setDescription("Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail.");
		}
		return new EmbedBuilder()
			.setTitle(`<:duels:1291683169569083392> ${player.id}`)
			.setDescription(`${player.pagename} is a member (player/coach/analyst) at **${await findPrintableName(player?.teampagename)}**.`)
			.setColor(player?.status == "Active" ? 0x4287f5 : 0xf54254)
			.setURL(`https://liquipedia.net/brawlstars/${player?.pagename}`)
			.setFooter({
				text: "We do not have licenses to use player images.",
			})
			.addFields([
				{
					name: "<:game:1291684262910885918> Team",
					value: `[${await findPrintableName(player?.teampagename)}](https://liquipedia.net/brawlstars/${player.teampagename})`,
					inline: true,
				},
				{
					name: "<:living:1292086781071593515> Living in",
					value: player.nationality,
					inline: true,
				},
				{
					name: "<:money:1292086783886233621> Earnings",
					value: "$" + player.earnings,
					inline: true,
				},
				{
					name: "<:score:1291686732621676605> Socials",
					value: `[Twitter](${player.twitter})`,
					inline: true,
				},
			]);
	}
	async searchTeam(query: string): Promise<EmbedBuilder> {
		const obj = await LiquidDB.get("team", query);
		const team = <Team>obj.result;
		if (team.status == "disbanded" ? true : false) {
			return new EmbedBuilder()
				.setTitle(`${helper.randomShieldEmoji()} ${team.name}`)
				.setDescription(team.name + " is a **disbanded** team.")
				.setThumbnail(team.logodarkurl)
				.setColor(0xf54254)
				.addFields([
					{
						name: "<:time:1292086778550812672> Disband date",
						value: stringUtils.formatDate(team.disbanddate),
						inline: true,
					},
					{
						name: "<:living:1292086781071593515>  Region",
						value: team.region,
						inline: true,
					},
					{
						name: "\u200b",
						value: "\u200b",
						inline: true,
					},
					{
						name: "<:game:1291684262910885918> Members",
						value: "Disbanded team, no active members.",
					},
					{
						name: "<:coach:1292130323806556272> Staff",
						value: "Disbanded team, no active staff members.",
					},
					{
						name: "<:score:1291686732621676605> Links",
						value: Object.entries(team.links)
							.map(([key, value]) => `[${key.charAt(0).toUpperCase() + key.slice(1)}](${value})`)
							.join(", "),
						inline: true,
					},
				]);
		}
		return new EmbedBuilder()
			.setTitle(`${helper.randomShieldEmoji()} ${team.name}`)
			.setURL(`https://liquipedia.net/brawlstars/${team.pagename}`)
			.setThumbnail(team.textlesslogodarkurl)
			.setColor(team.status == "Active" ? 0x4287f5 : 0xf54254)
			.addFields([
				{
					name: "<:time:1292086778550812672> Creation Date",
					value: stringUtils.formatDate(team.createdate),
					inline: true,
				},
				{
					name: "<:living:1292086781071593515>  Region",
					value: team.region,
					inline: true,
				},
				{
					name: "\u200b",
					value: "\u200b",
					inline: true,
				},
				{
					name: "<:game:1291684262910885918> Members",
					value: helper.activePlayers(team),
				},
				{
					name: "<:coach:1292130323806556272> Coaches",
					value: helper.activeStaff(team),
				},
				{
					name: "<:score:1291686732621676605> Links",
					value: Object.entries(team.links)
						.map(([key, value]) => `[${key.charAt(0).toUpperCase() + key.slice(1)}](${value})`)
						.join(", "),
					inline: true,
				},
			]);
	}
	predictEndEmbed(question: string, time: string): EmbedBuilder {
		const answer = new EmbedBuilder()
			.setTitle("Predictions Closed")
			.setDescription(`This prediction - ${question} - has received all the votes it could. Please come back for the next one!\nPrediction entries ran for ${time}.`)
			.setColor(0xf5428d)
			.setTimestamp();
		return answer;
	}
	predictCreateInitial(question: string, choice1: string, choice2: string, time: string): EmbedBuilder {
		const answer = new EmbedBuilder()
			.setTitle(question)
			.setDescription(`Entries for this prediction **end in ${time}**`)
			.setColor(0x6441a5)
			.setFooter({ text: "Predict now!" })
			.setTimestamp()
			.setFooter({ text: "Type /start to start an account!" })
			.addFields([
				{
					name: "Choice 1",
					value: choice1,
					inline: true,
				},
				{
					name: "Choice 2",
					value: choice2,
					inline: true,
				},
			]);
		return answer;
	}
	async makePun(pun: Pun, client: Client<boolean>) {
		const embed = EmbedBuilder.from(<APIEmbed>pun.embed);
		embed.setThumbnail("https://cdn.discordapp.com/avatars/" + pun.id + "/" + (await client.users.fetch(pun.id)).avatar);
		let catchp = "";
		for (const catcha of pun.random_quotes) {
			catchp += catcha + "\n";
		}
		embed.addFields([
			{
				name: "Things you might hear this person say",
				value: catchp,
			},
		]);
		return embed;
	}
}
//match.ts
