// Import all theme CSS files as raw strings
import blueOrangeCss from "$lib/themes/blue-orange.css?raw";
import cyanRedCss from "$lib/themes/cyan-red.css?raw";
import cyanSlateCss from "$lib/themes/cyan-slate.css?raw";
import emeraldPinkCss from "$lib/themes/emerald-pink.css?raw";
import fuchsiaEmeraldCss from "$lib/themes/fuchsia-emerald.css?raw";
import grayCss from "$lib/themes/gray.css?raw";
import indigoAmberCss from "$lib/themes/indigo-amber.css?raw";
import neutralCss from "$lib/themes/neutral.css?raw";
import pinkEmeraldCss from "$lib/themes/pink-emerald.css?raw";
import pinkTealCss from "$lib/themes/pink-teal.css?raw";
import purpleYellowCss from "$lib/themes/purple-yellow.css?raw";
import rainbowCss from "$lib/themes/rainbow.css?raw";
import redBlueCss from "$lib/themes/red-blue.css?raw";
import redCyanCss from "$lib/themes/red-cyan.css?raw";
import redSkyCss from "$lib/themes/red-sky.css?raw";
import roseTealCss from "$lib/themes/rose-teal.css?raw";
import skyAmberCss from "$lib/themes/sky-amber.css?raw";
import slateCyanCss from "$lib/themes/slate-cyan.css?raw";
import tealRoseCss from "$lib/themes/teal-rose.css?raw";
import violetLimeCss from "$lib/themes/violet-lime.css?raw";

const themes: Record<string, string> = {
	neutral: neutralCss,
	gray: grayCss,
	rainbow: rainbowCss,
	"blue-orange": blueOrangeCss,
	"cyan-red": cyanRedCss,
	"cyan-slate": cyanSlateCss,
	"emerald-pink": emeraldPinkCss,
	"fuchsia-emerald": fuchsiaEmeraldCss,
	"indigo-amber": indigoAmberCss,
	"pink-emerald": pinkEmeraldCss,
	"pink-teal": pinkTealCss,
	"purple-yellow": purpleYellowCss,
	"red-blue": redBlueCss,
	"red-cyan": redCyanCss,
	"red-sky": redSkyCss,
	"rose-teal": roseTealCss,
	"slate-cyan": slateCyanCss,
	"sky-amber": skyAmberCss,
	"teal-rose": tealRoseCss,
	"violet-lime": violetLimeCss,
};

const themeNames = Object.keys(themes);

export { themeNames, themes };
