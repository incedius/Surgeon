"use strict"

const DefaultSettings = {
	"characters": {},
	"presets": []
}

function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) {
            // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }

        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch (to_ver) {
            case 2:
                // Upgrade from v1 to v2
                // EXAMPLE: in v1, colors were specified like "reset_font_color": "green", but we support arbitrary hex colors now!
				for (let i = 0; i < settings.presets.length; i++) {
					let appearance = BigInt(settings.presets[i].appearance);
					settings.presets[i].unk1 = 		Number(appearance & 0xffn);
					settings.presets[i].skinColor =	Number(appearance >> 8n & 0xffn);
					settings.presets[i].faceStyle =	Number(appearance >> 16n & 0xffn);
					settings.presets[i].faceDecal =	Number(appearance >> 24n & 0xffn);
					settings.presets[i].hairStyle =	Number(appearance >> 32n & 0xffn);
					settings.presets[i].hairColor =	Number(appearance >> 40n & 0xffn);
					settings.presets[i].voice =		Number(appearance >> 48n & 0xffn);
					settings.presets[i].tattoos =	Number(appearance >> 56n & 0xffn);
					delete settings.presets[i].appearance;
				}
				/*
                switch (settings.preset) {
                    case "red": settings.reset_font_color = "#FF0000"; break;
                    case "green": settings.reset_font_color = "#00FF00"; break;
                    case "blue": settings.reset_font_color = "#0000FF"; break;
                    default: settings.reset_font_color = DefaultSettings.reset_font_color; break;
                }*/
                break;
			
            case 3:
                // upgrade from v2 to v3
                // EXAMPLE: setting "random_color" was removed (note that it's also absent from DefaultSettings, which should always correspond to the latest version!)
                for (let i = 0; i < settings.presets.length; i++) {
					settings.presets[i].appearance = {
						unk: 		settings.presets[i].unk1,
						skinColor: 	settings.presets[i].skinColor,
						faceStyle: 	settings.presets[i].faceStyle,
						faceDecal: 	settings.presets[i].faceDecal,
						hairStyle: 	settings.presets[i].hairStyle,
						hairColor: 	settings.presets[i].hairColor,
						voice: 		settings.presets[i].voice,
						tattoos: 	settings.presets[i].tattoos
					}
					delete settings.presets[i].unk1;
					delete settings.presets[i].skinColor;
					delete settings.presets[i].faceStyle;
					delete settings.presets[i].faceDecal;
					delete settings.presets[i].hairStyle;
					delete settings.presets[i].hairColor;
					delete settings.presets[i].voice;
					delete settings.presets[i].tattoos;
					settings.presets[i].shape = '';
				}
                break;
            // ...
            // TODO: whenever you increment your settings version, add an entry to the switch here.
            // ...
        }

        return settings;
    }
}

module.exports = MigrateSettings;