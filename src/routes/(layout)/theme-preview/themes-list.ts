// Import all theme CSS files as raw strings
import blueOrangeCss from "$lib/themes/css/blue-orange.css?raw";
import cyanRedCss from "$lib/themes/css/cyan-red.css?raw";
import cyanSlateCss from "$lib/themes/css/cyan-slate.css?raw";
import emeraldPinkCss from "$lib/themes/css/emerald-pink.css?raw";
import fuchsiaEmeraldCss from "$lib/themes/css/fuchsia-emerald.css?raw";
import grayCss from "$lib/themes/css/gray.css?raw";
import indigoAmberCss from "$lib/themes/css/indigo-amber.css?raw";
import stoneCss from "$lib/themes/css/stone.css?raw";
import zincCss from "$lib/themes/css/zinc.css?raw";
import pinkEmeraldCss from "$lib/themes/css/pink-emerald.css?raw";
import pinkTealCss from "$lib/themes/css/pink-teal.css?raw";
import purpleYellowCss from "$lib/themes/css/purple-yellow.css?raw";
import rainbowCss from "$lib/themes/css/rainbow.css?raw";
import redBlueCss from "$lib/themes/css/red-blue.css?raw";
import redCyanCss from "$lib/themes/css/red-cyan.css?raw";
import redSkyCss from "$lib/themes/css/red-sky.css?raw";
import roseTealCss from "$lib/themes/css/rose-teal.css?raw";
import skyAmberCss from "$lib/themes/css/sky-amber.css?raw";
import slateCyanCss from "$lib/themes/css/slate-cyan.css?raw";
import tealRoseCss from "$lib/themes/css/teal-rose.css?raw";
import violetLimeCss from "$lib/themes/css/violet-lime.css?raw";
//
import emeraldAmberForestCss from "$lib/themes/css/emerald-amber-forest.css?raw";
import limeFuchsiaNeonCss from "$lib/themes/css/lime-fuchsia-neon.css?raw";
import orangePinkSunsetCss from "$lib/themes/css/orange-pink-sunset.css?raw";
import slateTealOceanCss from "$lib/themes/css/slate-teal-ocean.css?raw";
import stoneOrangeEarthCss from "$lib/themes/css/stone-orange-earth.css?raw";
import violetRoseDuskCss from "$lib/themes/css/violet-rose-dusk.css?raw";

const themes: Record<string, string> = {
	stone: stoneCss,
	gray: grayCss,
	zinc: zincCss,
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
	// New themed variants
	"emerald-amber-forest": emeraldAmberForestCss,
	"lime-fuchsia-neon": limeFuchsiaNeonCss,
	"orange-pink-sunset": orangePinkSunsetCss,
	"slate-teal-ocean": slateTealOceanCss,
	"stone-orange-earth": stoneOrangeEarthCss,
	"violet-rose-dusk": violetRoseDuskCss,
};

const themeNames = Object.keys(themes);

export { themeNames, themes };
