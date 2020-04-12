# ✨ OsuEvent

Vous pouvez créer des <strong>Events</strong> à l'aide de ce code. Il faut au préalable <strong>Discord.js@12.1.1</strong> et <strong>axios</strong>. Discord.js est nécessaire pour envoyer des messages dans le salon et récupérer le nom du joueur à l'aide de son ID.<br>Vous avez besoin d'une <strong>clé d'api</strong>, pour plus d'informations consultez https://github.com/ppy/osu-api/wiki
<br><br>Vous pouvez retrouver un exemple dans le dossier <strong>example</strong>.

# Installation

Ajoutez les fichiers <strong>OsuEvent.js</strong> ainsi que <strong>Beatmap.js</strong> dans le même dossier.
```JS
const OsuEvent = require('./OsuEvent'); //Chemin d'accès vers OsuEvent.js

const event = new OsuEvent(
  client, //Discord client
  'osuApiKey', //Osu api key
  ['NF', 'HT'] //Banned mods
);
```

# Beatmap

Vous pouvez récupérer diverses informations à propos de la beatmap.
```JS
<Beatmap>.getDuration() //=> Donne la durée de la beatmap sous forme (hh)mm:ss
<Beatmap>.getUrl() //=> Donne l'url de la beatmap
<Beatmap>.isRanked() //=> Retourne un booléen pour savoir si une beatmap est ranked
<Beatmap>.getCoverImageUrl() //=> Donne l'url de l'image de fond d'une beatmap
<Beatmap>.getData() //=> Retourne les données brutes de la beatmap
//...
```

# Aide/Améliorations

Si vous souhaitez proposer des améliorations ajoutez moi sur discord: <strong>ImFireGod#8276</strong>
