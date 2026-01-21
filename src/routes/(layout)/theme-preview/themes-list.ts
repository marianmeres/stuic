// Import all theme CSS files as raw strings
import neutralCss from "$lib/themes/neutral.css?raw";
import grayCss from "$lib/themes/gray.css?raw";
import rainbowCss from "$lib/themes/rainbow.css?raw";
import indigoAmberCss from "$lib/themes/indigo-amber.css?raw";
import tealRoseCss from "$lib/themes/teal-rose.css?raw";
import violetLimeCss from "$lib/themes/violet-lime.css?raw";
import blueOrangeCss from "$lib/themes/blue-orange.css?raw";
import emeraldPinkCss from "$lib/themes/emerald-pink.css?raw";
import skyAmberCss from "$lib/themes/sky-amber.css?raw";
import fuchsiaEmeraldCss from "$lib/themes/fuchsia-emerald.css?raw";
import slateCyanCss from "$lib/themes/slate-cyan.css?raw";
import purpleYellowCss from "$lib/themes/purple-yellow.css?raw";
import cyanRedCss from "$lib/themes/cyan-red.css?raw";
import roseTealCss from "$lib/themes/rose-teal.css?raw";
import redCyanCss from "$lib/themes/red-cyan.css?raw";
import cyanSlateCss from "$lib/themes/cyan-slate.css?raw";
import pinkEmeraldCss from "$lib/themes/pink-emerald.css?raw";
import redBlueCss from "$lib/themes/red-blue.css?raw";

const themes: Record<string, string> = {
	neutral: neutralCss,
	gray: grayCss,
	rainbow: rainbowCss,
	"indigo-amber": indigoAmberCss,
	"teal-rose": tealRoseCss,
	"rose-teal": roseTealCss,
	"violet-lime": violetLimeCss,
	"blue-orange": blueOrangeCss,
	"emerald-pink": emeraldPinkCss,
	"pink-emerald": pinkEmeraldCss,
	"sky-amber": skyAmberCss,
	"fuchsia-emerald": fuchsiaEmeraldCss,
	"slate-cyan": slateCyanCss,
	"cyan-slate": cyanSlateCss,
	"purple-yellow": purpleYellowCss,
	"cyan-red": cyanRedCss,
	"red-cyan": redCyanCss,
	"red-blue": redBlueCss,
};

const themeNames = Object.keys(themes);

export { themes, themeNames };
