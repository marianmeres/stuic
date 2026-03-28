// Import all theme CSS files as raw strings from @marianmeres/design-tokens
import blueOrangeCss from "@marianmeres/design-tokens/css/blue-orange.css?raw";
import cyanRedCss from "@marianmeres/design-tokens/css/cyan-red.css?raw";
import cyanSlateCss from "@marianmeres/design-tokens/css/cyan-slate.css?raw";
import emeraldPinkCss from "@marianmeres/design-tokens/css/emerald-pink.css?raw";
import fuchsiaEmeraldCss from "@marianmeres/design-tokens/css/fuchsia-emerald.css?raw";
import grayCss from "@marianmeres/design-tokens/css/gray.css?raw";
import indigoAmberCss from "@marianmeres/design-tokens/css/indigo-amber.css?raw";
import stoneCss from "@marianmeres/design-tokens/css/stone.css?raw";
import zincCss from "@marianmeres/design-tokens/css/zinc.css?raw";
import pinkEmeraldCss from "@marianmeres/design-tokens/css/pink-emerald.css?raw";
import pinkTealCss from "@marianmeres/design-tokens/css/pink-teal.css?raw";
import purpleYellowCss from "@marianmeres/design-tokens/css/purple-yellow.css?raw";
import rainbowCss from "@marianmeres/design-tokens/css/rainbow.css?raw";
import redBlueCss from "@marianmeres/design-tokens/css/red-blue.css?raw";
import redCyanCss from "@marianmeres/design-tokens/css/red-cyan.css?raw";
import redSkyCss from "@marianmeres/design-tokens/css/red-sky.css?raw";
import redSkySlateCss from "@marianmeres/design-tokens/css/red-sky-slate.css?raw";
import roseTealCss from "@marianmeres/design-tokens/css/rose-teal.css?raw";
import skyAmberCss from "@marianmeres/design-tokens/css/sky-amber.css?raw";
import slateCyanCss from "@marianmeres/design-tokens/css/slate-cyan.css?raw";
import tealRoseCss from "@marianmeres/design-tokens/css/teal-rose.css?raw";
import violetLimeCss from "@marianmeres/design-tokens/css/violet-lime.css?raw";
//
import emeraldAmberForestCss from "@marianmeres/design-tokens/css/emerald-amber-forest.css?raw";
import limeFuchsiaNeonCss from "@marianmeres/design-tokens/css/lime-fuchsia-neon.css?raw";
import orangePinkSunsetCss from "@marianmeres/design-tokens/css/orange-pink-sunset.css?raw";
import slateTealOceanCss from "@marianmeres/design-tokens/css/slate-teal-ocean.css?raw";
import stoneOrangeEarthCss from "@marianmeres/design-tokens/css/stone-orange-earth.css?raw";
import violetRoseDuskCss from "@marianmeres/design-tokens/css/violet-rose-dusk.css?raw";

// monokai
import monokaiPinkCss from "@marianmeres/design-tokens/css/monokai-pink.css?raw";
import monokaiGreenCss from "@marianmeres/design-tokens/css/monokai-green.css?raw";
import monokaiCyanCss from "@marianmeres/design-tokens/css/monokai-cyan.css?raw";

// new in design-tokens 1.1.2
import mauveCss from "@marianmeres/design-tokens/css/mauve.css?raw";
import mauveLimeElectricCss from "@marianmeres/design-tokens/css/mauve-lime-electric.css?raw";
import mauveTealCss from "@marianmeres/design-tokens/css/mauve-teal.css?raw";
import mistCss from "@marianmeres/design-tokens/css/mist.css?raw";
import mistIndigoFjordCss from "@marianmeres/design-tokens/css/mist-indigo-fjord.css?raw";
import mistVioletAuroraCss from "@marianmeres/design-tokens/css/mist-violet-aurora.css?raw";
import oliveCss from "@marianmeres/design-tokens/css/olive.css?raw";
import oliveAmberSafariCss from "@marianmeres/design-tokens/css/olive-amber-safari.css?raw";
import taupeCss from "@marianmeres/design-tokens/css/taupe.css?raw";
import taupeOliveClayCss from "@marianmeres/design-tokens/css/taupe-olive-clay.css?raw";
import taupeRoseBlushCss from "@marianmeres/design-tokens/css/taupe-rose-blush.css?raw";

const themes: Record<string, string> = {
	stone: stoneCss,
	gray: grayCss,
	zinc: zincCss,
	mauve: mauveCss,
	mist: mistCss,
	olive: oliveCss,
	taupe: taupeCss,
	rainbow: rainbowCss,
	"blue-orange": blueOrangeCss,
	"cyan-red": cyanRedCss,
	"cyan-slate": cyanSlateCss,
	"emerald-pink": emeraldPinkCss,
	"fuchsia-emerald": fuchsiaEmeraldCss,
	"indigo-amber": indigoAmberCss,
	"mauve-teal": mauveTealCss,
	"pink-emerald": pinkEmeraldCss,
	"pink-teal": pinkTealCss,
	"purple-yellow": purpleYellowCss,
	"red-blue": redBlueCss,
	"red-cyan": redCyanCss,
	"red-sky": redSkyCss,
	"red-sky-slate": redSkySlateCss,
	"rose-teal": roseTealCss,
	"slate-cyan": slateCyanCss,
	"sky-amber": skyAmberCss,
	"teal-rose": tealRoseCss,
	"violet-lime": violetLimeCss,
	// themed variants
	"emerald-amber-forest": emeraldAmberForestCss,
	"lime-fuchsia-neon": limeFuchsiaNeonCss,
	"mauve-lime-electric": mauveLimeElectricCss,
	"mist-indigo-fjord": mistIndigoFjordCss,
	"mist-violet-aurora": mistVioletAuroraCss,
	"olive-amber-safari": oliveAmberSafariCss,
	"orange-pink-sunset": orangePinkSunsetCss,
	"slate-teal-ocean": slateTealOceanCss,
	"stone-orange-earth": stoneOrangeEarthCss,
	"taupe-olive-clay": taupeOliveClayCss,
	"taupe-rose-blush": taupeRoseBlushCss,
	"violet-rose-dusk": violetRoseDuskCss,
	// monokai
	"monokai-pink": monokaiPinkCss,
	"monokai-green": monokaiGreenCss,
	"monokai-cyan": monokaiCyanCss,
};

const themeNames = Object.keys(themes);

export { themeNames, themes };
