import { findPageName } from "./findPage";
import { type SquadPlayer, type Team } from "../moduleTypes";
import { DatabaseTeam } from "../../database/DatabaseTeam";
export class TeamInfo {
    currentObject: Team | undefined;
    constructor(data: Team | undefined) {
        this.currentObject = data;
    }
    static async setTeam(query: string) {
        const name = await findPageName(query);
        const db = new DatabaseTeam();
        const teams = await db.getTeam(null, name);
        if (teams.length != 0) {
            return new TeamInfo(teams[0]);
        }
        const headers = { Authorization: `Apikey ${process.env.LIQUID_TOKEN}` };
        const teamData = await fetch(
            `https://api.liquipedia.net/api/v3/team?wiki=brawlstars&conditions=%5B%5Bpagename%3A%3A${name}%5D%5D`,
            { headers: headers },
        )
            .then((response) => response.json())
            .then((data) => {
                const {
                    pagename,
                    name,
                    region,
                    logodarkurl,
                    textlesslogodarkurl,
                    status,
                    createdate,
                    links,
                } = data.result[0];
                const returnable: Team = {
                    pagename,
                    name,
                    region,
                    logodarkurl,
                    textlesslogodarkurl,
                    status,
                    createdate,
                    links,
                    players: [],
                };
                return returnable;
            });
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]] AND [[status::active]]`,
        });
        await fetch(
            `https://api.liquipedia.net/api/v3/squadplayer?${param.toString()}`,
            { headers: headers },
        )
            .then((response) => response.json())
            .then((data) => {
                for (const memberNumber in Object.values(data.result)) {
                    const {
                        link,
                        status,
                        joindate,
                        nationality,
                        role,
                        type,
                        id,
                    } = data.result[memberNumber];
                    teamData.players.push({
                        link,
                        status,
                        joindate,
                        nationality,
                        role,
                        type,
                        id,
                    } as SquadPlayer);
                }
            });
        db.pushTeam(teamData);
        return new TeamInfo(teamData);
    }
    get pagename() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.pagename;
    }
    get name() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.name;
    }
    get region() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.region;
    }
    get logo() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.logodarkurl;
    }
    get textlesslogo() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.textlesslogodarkurl;
    }
    get links(): object {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.links;
    }
    get status() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        return cap(this.currentObject.status);
    }
    get createdate(): string {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        return this.currentObject.createdate;
    }
    get players() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        const answer: SquadPlayer[] = [];
        for (const player of this.currentObject.players) {
            if (player.type == "player") {
                answer.push(player);
            }
        }
        return answer;
    }
    get staff() {
        if (!this.currentObject) {
            throw new Error("Did not find value");
        }
        const answer: SquadPlayer[] = [];
        for (const player of this.currentObject.players) {
            if (player.type == "staff") {
                answer.push(player);
            }
        }
        return answer;
    }
}
