const { get } = require('axios');
const Beatmap = require('./Beatmap');

/**
 * Create new osu event
 * @param {Client} client
 * @param {Array} bannedMods
 * @param {String} osuApiKey
 */
class OsuEvent {
    #client;
    #eventStartDate;
    #beatmap;
    constructor(client, osuApiKey, bannedMods) {
        this.bannedMods = bannedMods || [];
        this.scores = [];
        this.players = new Map();
        this.apiKey = osuApiKey;
        this.#client = client;
    }

    /**
     * Start the osu event.
     * @param {String} beatmapURL 
     */
    start(beatmapURL) {
        return new Promise(async (resolve, reject) => {
            if(!beatmapURL || !beatmapURL.match(/^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d*#(osu|taiko|fruits|mania)\/\d*/)) {
                return reject(new Error('Beatmap URL provided is not valid'));
            }
            const beatmapID = beatmapURL.split("/")[5];
            const beatmapRequest = await get(`https://osu.ppy.sh/api/get_beatmaps?k=${this.apiKey}&b=${beatmapID}`).catch(e => {
                if(e.response.data.error === 'Please provide a valid API key.') {
                    return reject(new Error('API key provided is not valid'));
                }
                return reject(new Error('Cannot find beatmap informations'));
            });
            this.#beatmap = new Beatmap(beatmapRequest.data[0]);
            this.#eventStartDate = Date.now() - 7200000;
            if(!this.#beatmap.isRanked()) {
                return reject(new Error('Cannot get scores of unranked map'));
            }
            return resolve(this.#beatmap);
        })
    }

    /**
     * Add player in the event.
     * @param {User} user 
     * @param {String} osuID
     * @returns {Promise}
     */
    addPlayer(user, osuID) {
        return new Promise((resolve, reject) => {
            if(!this.players.has(user.id)) {
                this.players.set(user.id, osuID);
                return resolve('User added');
            }
            return reject(new Error('User is already registered'));
        });
    }

    /**
     * Remove player in the event.
     * @param {User} user
     * @returns {Promise}
     */
    removePlayer(user) {
        return new Promise((resolve, reject) => {
            if(this.players.has(user.id)) {
                this.players.delete(user.id);
                return resolve('User removed');
            }
            return reject(new Error('User is not registered'));
        });
    }

    /**
     * Get the beatmap informations
     * @returns {Beatmap} beatmap informations
     */
    getBeatmap() {
        return this.#beatmap;
    }

    /**
     * Get results of the event
     * @returns {Array} Results of the event
     */
    async getResults() {
        if(this.scores.length > 0) {
            return this.scores;
        } 

        for(let [userID, osuID] of this.players.entries()) {
            const userRecentScores = await get(`https://osu.ppy.sh/api/get_user_recent?k=${this.apiKey}&u=${osuID}`).catch(e => {});
            if(userRecentScores.data[0]) {
                const bestScore = userRecentScores.data
                .filter(
                  score =>
                    new Date(score.date) > this.#eventStartDate &&
                    score.beatmap_id === this.#beatmap.getData().beatmap_id &&
                    this._osuMods(parseInt(score.enabled_mods)).some(
                      r => !this.bannedMods.includes(r)
                    )
                )
                .sort((a, b) => b.score - a.score)[0];
                const username = this.#client.users.cache.get(userID).username;
                if(!bestScore) {
                    this.scores.push({
                        username: username,
                        accuracy: "0.00%",
                        note: 'F',
                        score: 0,
                        mods: ['NoMod'],
                        maxcombo: 0,
                        count50: 0,
                        count100: 0,
                        count300: 0
                    });
                } else {
                    this.scores.push({
                        username: username,
                        accuracy: (this._getAccuracy(Number(bestScore.countmiss), Number(bestScore.count50), Number(bestScore.count100), Number(bestScore.count300)).toFixed(2) + "%"),
                        note: bestScore.rank,
                        score: bestScore.score,
                        mods: this._osuMods(parseInt(bestScore.enabled_mods)),
                        maxcombo: bestScore.maxcombo,
                        count50: bestScore.count50,
                        count100: bestScore.count100,
                        count300: bestScore.count300
                    });
                }           
            }
        }
        this.scores = this.scores.sort((a, b) => b.score - a.score);
        return this.scores;
    }

    /**
     * Get the accuracy of player.
     * @param {Number} misses 
     * @param {Number} count50 
     * @param {Number} count100 
     * @param {Number} count300 
     */
    _getAccuracy(misses, count50, count100, count300) {
        return ((50 * count50 + 100 * count100 + 300 * count300) / (300 * (misses + count50 + count100 + count300))) * 100;
    }

    /**
     * Convert number to mods
     * @param {Number} number
     * @returns {Array}
     */
    _osuMods(number) {
        if(number === 0) {
            return ['NoMod'];
        }
        const modsOsu = {
            Mirror  : 1073741824,
            V2      : 536870912,
            Key2    : 268435456,
            Key3    : 134217728,
            Key1    : 67108864,
            KeyCoop : 33554432,
            Key9    : 16777216,
            Target  : 8388608,
            Cinema  : 4194304,
            Random  : 2097152,
            FadeIn  : 1048576,
            Key8    : 524288,
            Key7    : 262144,
            Key6    : 131072,
            Key5    : 65536,
            Key4    : 32768,
            PF      : 16384,
            Auto    : 8192, 
            SO      : 4096, 
            Auto    : 2048,
            FL      : 1024,
            NC      : 512,
            HF      : 256,
            RX      : 128,
            DT      : 64,
            SD      : 32,
            HR      : 16,
            HD      : 8,
            TD      : 4,
            EZ      : 2, 
            NF      : 1,
        }
        const mods = [];
        for (let i in modsOsu ) {
            while (number >= modsOsu[i] ) {
                mods.push(i);
                number -= modsOsu[i];
            }
        }
        return mods;
    }
}

module.exports = OsuEvent; 
