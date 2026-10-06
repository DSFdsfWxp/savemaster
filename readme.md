# SaveMaster

**English** | [简体中文](./readme.zh_cn.md)

A Mindustry mod to manage saves, with a variety of practical functions.

Mindustry gives you only one campaign save slot, and everything lives inside it: every sector, every custom map, your schematics, and the part of your settings that belongs to your progress. SaveMaster packs all of that up for you, so you can back it up, swap it around, edit the maps inside it, and keep it in sync between devices.

# Functions

 - Saves Manager: back up, restore, delete and edit whole saves.
 - Save editor: edit any map inside a save or a backup, without leaving the game.
 - Multiplayer: several players on one device, each with its own saves, schematics, settings and cloud save config.
 - Cloud save: sync your save between devices through a server you deploy yourself (a Cloudflare Worker, or a small Python program).

# Requirements

 - Mindustry v136 or newer (the mod asks for `minGameVersion` 136).
 - This is a plugin mod: it is marked `hidden` in `mod.json`, adds no game content, and does not affect net multiplayer.
 - Only cloud save needs the network; everything else works offline.

# How to install
The mod has to be installed manually: download the release from GitHub, then import it.

 1. Open the [releases page](https://github.com/DSFdsfWxp/savemaster/releases) and download the released `.zip`.
 2. In game: `Mods` -> `Import Mod`, then pick that file.
 3. Restart the game if it asks you to.

The mod source lives in `/src`. If you want to run it from source, copy the contents of `/src` into a folder named `savemaster` in your mods directory.

# How to use
Everything lives under `Settings` -> `SaveMaster`, which holds three entries: `Saves Manager`, `Multiplayer` and `About`. Each of them is described below. The mod follows the game's language, and `About` shows the running version and its change log.

## Saves Manager

The first row is your current save. Its second line tells you whether the cloud save is on (`Cloud`) or off (`Local`), and it has two buttons:

 - back up the current save. You are asked for a name (leave it empty and the backup is called `Untitled`), then everything is written into a `.smsf` file in `saveMaster/saves`.
 - edit the maps of the current save (see below).

Below the line is the list of backup saves. Each one shows its name, the time it was made and how many files it holds, with three buttons:

 - restore: use this backup as your current save. It overwrites everything: the map you are playing is closed and saved first, the game's `saves` and `schematics` folders are emptied, the files from the backup are written back, the settings packed inside it are applied, and the game reloads its save list and research tree.
 - edit the maps inside this backup (see below).
 - delete the backup file.

Backups are plain files, so you can carry them between devices by hand. Any `.smsf` you drop into `saveMaster/saves` shows up in this list. A file the mod cannot read is skipped, and the reason is printed to the game log.

## Edit Maps in Save

This dialog lists every `.msav` inside the save you picked and opens any of them in the game's editor.

 - `Cat:` cycles through the categories: `All`, then `Custom Maps`, then one entry per planet that has sectors in this save.
 - `Backup:` shows or hides the `-backup` maps.
 - Click a map and the game editor opens on it. Play, brush, save, everything works as usual.
 - When you leave the editor your change is written back: straight into the `.msav` while you are editing the current save, or into the backup file (the `.smsf` is written again when the dialog closes) while you are editing a backup.
 - Sector names are resolved from the game's content, so a sector shows up as `Planet Sector <id> <name>`.

## Multiplayer

Every player is a separate profile, so two people (or two playthroughs) can share one device without fighting over one save. This page is about profiles on your own machine, not about net multiplayer.

 - The first run gives you a `Default Player`.
 - Each player has its own game saves, schematics, settings, backups and cloud save config.
 - Players do not get separate identities on servers: every player created here shares the same UUID, the id the game uses in net multiplayer. Switching players does not change it, and this mod does not provide a way to modify or reset the UUID, so a server sees the same identity whichever player you are using.
 - The current player's name is shown as a fade message whenever the planet dialog shows up.
 - `Add Player`, rename (pencil), `Switch Player` and delete (trash) are all on this page. You cannot switch to or delete the player you are using right now, and two players cannot share one name.
 - Switching packs the current player up, unpacks the one you chose, then reloads the saves, schematics, sectors and the research tree. It takes a moment, and you should not do it in the middle of a net game.

## Cloud Save

### deploy on cloudflare
Use cloudflare's workers and kv to build a free server.  The code needed is in `/cloud`.  

 1. Make sure you have a cloudflare account.
 2. Create a worker.
 3. Create a kv.
 4. Bind the kv to the worker with a variable name `db`.
 5. Create environment variable `key` for the worker and put the key that grants access to this server in it (the key works like a password).
 6. Paste the code in `/cloud/worker.js` into your worker (delete the code that is already there first), then deploy.

That implementation allows a 25 MiB save and a 512 byte save name; change the `limit` object in `worker.js` if you want other numbers.

`/cloud/local.py` is a small FastAPI program that runs the same server on your own machine, see [cloud/readme.md](./cloud/readme.md).

### config in game

 1. Settings -> SaveMaster -> Saves Manager -> Cloud Save Option
 2. Paste the url of your worker to `Server Address` (e.g. `example.workers.dev`); `https://` is added for you if you leave it out. 
 3. Input the key you set in your worker. (environment variable `key`)
 4. Pick a name for you save. Note that different devices with the same save name will use the same cloud save slot (linked to the same cloud save).
 5. Enable the cloud save (it's enabled when it shows `CloudSave: Enable`)
 6. Save the config

`Test` checks that the server answers and that it accepts your key, `Clear` deletes the cloud save on the server. `Upload`, `Download` and `Clear` all want a saved config first, so press `Save Config` after you change anything.

### sync
Cloud save is off until the server address, the key and the save name are all filled in and the cloud save is enabled.

 - When the game client finishes loading, you are asked whether to download the cloud save. `Download` overwrites your local save with the cloud one.
 - When you quit a campaign back to the menu, you are asked whether to upload. `Upload` packs your current save (the same thing a backup does) and pushes it to the server.
 - Nothing is synced on a net client.

Upload and download both overwrite the other side, so do not point two different progresses at the same save name.

### notes
 - The save name must fit into the server's `maxNameSize`, otherwise the config is refused; a save bigger than `maxPayloadSize` fails while uploading. The client reads both numbers from your server's `/limit`.
 - The key travels as a plain request header, so use `https://`.
 - A device that has never uploaded anything cannot download the cloud save: upload once from it first (or move a save to it by hand). The known symptom is an error like `Too much data for declared Content-Length`.

### protocol
You can also write a server by yourself. Follow this protocol so it will work for this mod.

Every request carries the key in the `key` header, and a wrong key should get an error status (`403` with the bundled worker). `time` is in the form of `20240101123000` and comes from the local clock of the game. The client uses a browser-like `User-Agent` and waits up to one hour for a reply.

### read
Function: Read save  
Interface: `/read`  
Method: `GET`  
Header:

 - `key`: the key to access the server
 - `name`: save name
 - `time`: The time when the save was last synchronized, in the form of `20240101123000`, used to determine whether the local save needs to be updated (not sent on the first read)

Returns: The request returns only `304` if the `time` passed in is newer than the one on the server.  If a save named `name` is not found on the server, the request simply returns `404`.  Otherwise return the save file with  `Content-Type: application/octet-stream`.  
The mod treats `304` and `204` the same way (nothing to do), so answering `204` for a save that does not exist is fine too; the bundled worker does exactly that.

### write
Function: Write save  
Interface: `/write`  
Method: `POST`  
Header:

 - `key`: the key to access the server
 - `name`: save name
 - `time`: save creation time
 - `Content-Type`: `application/octet-stream`

Payload: save file  
Return: `200` is returned if the writing is successful.  
The server has to store the payload and the `time` together, because the next `/read` compares against that `time`.

### remove
Function: Delete save  
Interface: `/remove`  
Method: `GET`  
Header:

 - `key`: the key to access the server
 - `name`: save name
Return: `200` is returned if the deletion is successful.  

### limit
Function: Get server limits  
Interface: `/limit`  
Method: `GET`  
Header:

 - `key`: the key to access the server

Return the limitations of the server (only include `maxPayloadSize` and `maxNameSize`) with `Content-Type: application/json`, for example:

 ```json
{
    "maxPayloadSize": 26214400,
    "maxNameSize": 512
}
 ```

`maxPayloadSize`: max size of the save (byte).  
`maxNameSize`: max size of the save name (byte).

### example
With `curl`, and a save file you exported by hand:

```bash
# check the key and read the limits
curl -i -H "key: your-key" https://example.workers.dev/limit

# upload a save
curl -i -X POST \
  -H "key: your-key" -H "name: my-save" -H "time: 20240101123000" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@my-save.smsf" \
  https://example.workers.dev/write

# download it again (the worker treats a missing time as "give me whatever you have")
curl -o my-save.smsf -H "key: your-key" -H "name: my-save" https://example.workers.dev/read
```

# File format
A backup is a `.smsf` file (SaveMaster save file), a small binary package:

```txt
'SMSF'                 magic, 4 bytes
int                    version, 100 for now
UTF                    save name
int                    year
byte x5                month, day, hour, minute, second
int                    file count
then, file count times:
  UTF                  file name
  long                 file size
  byte[file size]      file data
```

The file names inside the package can point outside the save folder:

 - `xxxx.msav`: a map
 - `../schematics/xxxx`: a schematic
 - `$setting`: the packed game settings
 - `../saveMaster/config/cloudsave.json`: cloud save config, used when switching players
 - `../saveMaster/saves/xxxx.smsf`: a backup, used when switching players

# Files and directories
The mod keeps its own folder as a sibling of the game's `saves` folder:

```txt
Mindustry/
  saves/                 # the game's saves (what a restore overwrites)
  schematics/
  maps/
  saveMaster/
    saves/               # your backups (*.smsf)
    players/             # player profiles
    config/              # cloudsave.json, player.json, editor.json
    tmp/                 # temporary files used while editing maps
```

The game reads these folders while it runs, so close the game before you move files around by hand.

# Change log
`Settings` -> `SaveMaster` -> `About` shows the version and the change log of the version you are running.

# License
MIT, see [LICENSE](./LICENSE).
