/**
 * Create Beatmap object
 * @param {Object} beatmapData
 */
class Beatmap {
    #beatmapData;
    constructor(beatmapData) {
        this.#beatmapData = beatmapData;
    }

    /**
     * Get the beatmap URL
     * @returns {String} 
     */
    getUrl() {
        return `https://osu.ppy.sh/beatmapsets/${this.#beatmapData.beatmapset_id}#${this.getModName()}/${this.#beatmapData.beatmap_id}`
    }

    /**
     * Get background image of the beatmap
     * @returns {String} 
     */
    getCoverImageUrl() {
        return `https://assets.ppy.sh/beatmaps/${this.#beatmapData.beatmapset_id}/covers/cover.jpg?${this.#beatmapData.beatmap_id}`
    }

    /**
     * Get object of Beatmap.
     * @returns {Object}
     */
    getData() {
        return this.#beatmapData;
    }

    /**
     * Get map duration
     * @returns {String}
     */
    getDuration() {
        const mapDuration = this.#beatmapData.total_length;
        const hours = Math.floor(mapDuration / 3600);
        const minutes = Math.floor((mapDuration - (hours * 3600)) / 60);
        const seconds = mapDuration - (hours * 3600) - (minutes * 60);
        return (hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '') + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    /**
     * Get name of the mod with the number
     * @returns {String}
     */
    getModName() {
        return ['osu', 'taiko', 'fruits', 'mania'][this.#beatmapData.mode];
    }

    /**
     * Test if beatmap is ranked
     * @returns {Boolean}
     */
    isRanked() {
        return this.#beatmapData.approved > 0;
    }

    /**
     * Test if beatmap is loved
     * @returns {Boolean}
     */
    isLoved() {
        return this.#beatmapData.approved === 4;
    }

    /**
     * Get approved state of beatmap
     * @returns {String}
     */
    getApprovedState() {
        return {
            '4' : 'loved',
            '3' : 'qualified',
            '2' : 'approved',
            '1' : 'ranked',
            '0' : 'pending',
            '-1': 'WIP',
            '-2': 'graveyard'
        } [this.#beatmapData.approved];
    }
}

module.exports = Beatmap;