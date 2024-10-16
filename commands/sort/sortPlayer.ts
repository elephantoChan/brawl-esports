import { readFile } from "node:fs/promises";
import type { Match } from "../../modules/moduleTypes.ts";
export async function sortByPlayer(name: string) {
    const udata = JSON.parse(
        await readFile("db/matches.json", "utf8"),
    ) as Match[];
    const data = sortMatchesByDate(udata);
    const answer: Match[] = [];
    try {
        for (const match of data) {
            for (const players of match.match2opponents) {
                for (const player of players.match2players) {
                    if (
                        player.displayname.toLowerCase() == name.toLowerCase()
                    ) {
                        answer.push(match);
                        if (answer.length == 20) {
                            return answer;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return answer;
}

function getLatestGameDate(match: Match): Date {
    if (!match.match2games || match.match2games.length === 0) {
        return new Date(0); // Return earliest possible date if no games
    }

    // Convert all game dates to Date objects and find the latest one
    const dates = match.match2games.map((game) => new Date(game.date));
    return new Date(Math.max(...dates.map((date) => date.getTime())));
}

// Main sorting function
function sortMatchesByDate(matches: Match[]): Match[] {
    return [...matches].sort((a, b) => {
        const dateA = getLatestGameDate(a);
        const dateB = getLatestGameDate(b);

        // Sort in descending order (latest first)
        return dateB.getTime() - dateA.getTime();
    });
}
