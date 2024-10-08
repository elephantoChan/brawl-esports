import type { APIEmbedField } from "discord.js";
import type { Match } from "../../modules/moduleTypes";

export function matchEmbedFields(
    match: Match[],
    matchNumber: number,
    gameNumber: number,
) {
    const game = match[matchNumber].match2games[gameNumber];
    if (
        Object.values(game.participants).length !== 0 &&
        Object.values(game.scores).length !== 0
    ) {
        return {
            name: `<:combat:1292086786872442973> Game ${gameNumber + 1}`,
            value: `<:bs_map:1291686752569921546> **Played On** ${game.map}\n<:score:1291686732621676605> **Game Score**: ${game.scores[0]}:${game.scores[1]} - **${match[matchNumber].match2opponents[game.winner - 1].name}** won\n<:brawlers:1291686735906078861> **Picks**\n1. **${game.participants["1_1"].brawler}**, **${game.participants["1_2"].brawler}**, **${game.participants["1_3"].brawler}**\n2. **${game.participants["2_1"].brawler}**, **${game.participants["2_2"].brawler}**, **${game.participants["2_3"].brawler}**\n<:bans:1291686740486131772> **Bans**: ${getBanList(game.extradata)}`,
            inline: true,
        } as APIEmbedField;
    }
    throw new Error("Out of bounds.");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBanList(data: any): string {
    const team1Bans = Object.values(data.bans.team1);
    const team2Bans = Object.values(data.bans.team2);
    const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
    return uniqueBans.join(", ");
}
