<p align="center"><img src="assets/pixel-banner-v2.svg" width="520" alt="Pixel Banner"></p>

<h1 align="center">Bring Bewegung in deine README.</h1>
<p align="center">Erstelle kräftige Pixel-Art-Schrift als bearbeitbare SVG – mit eigenen Farbverläufen und Animationen.</p>

<p align="center"><a href="https://iamangusu.github.io/pixel-banner/"><img src="assets/generator-button-pb.svg" width="360" alt="Pixel-Banner-Generator öffnen"></a></p>

<p align="center"><a href="README.md"><img src="docs/assets/readme-language-en.svg" height="40" alt="Read this README in English"></a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@iamangusu/pixel-banner"><img src="https://img.shields.io/npm/v/%40iamangusu%2Fpixel-banner?style=flat-square" alt="npm-Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/IamAngusU/pixel-banner?style=flat-square" alt="MIT-Lizenz"></a>
</p>

<p align="center"><a href="#galerie">Galerie</a> · <a href="#schnellstart">Schnellstart</a> · <a href="#terminal">Terminal</a> · <a href="#lizenz">Lizenz</a></p>

## Galerie

| Neon · Reveal und Schimmer | Feuer | Welle |
|:---:|:---:|:---:|
| <img src="examples/reveal-shimmer.svg" alt="Neon-Schrift mit Reveal und anschließendem Schimmer" height="92"> | <img src="examples/fire.svg" alt="Schrift mit Feuerverlauf" height="92"> | <img src="examples/wave.svg" alt="Animierte Pixel-Schrift mit Welle" height="92"> |

| Farbiger Boden | Helles Mint | Klassisches Neon |
|:---:|:---:|:---:|
| <img src="examples/floor.svg" alt="Farbverlauf unter der Schrift" height="92"> | <img src="examples/light-mint-clean.svg" alt="Mint-Schrift für hellen Hintergrund" height="92"> | <img src="examples/neon.svg" alt="Neon-Schrift mit Farbverlauf" height="92"> |

## Schnellstart

Erstelle eine SVG mit Node.js 18+ – ganz ohne globale Installation:

```sh
npx --yes @iamangusu/pixel-banner "HALLO" --preset neon --animation reveal+shimmer --colors "#24D6C8,#39A7FF,#C879FF" --out hallo.svg
```

Mit einer oder mehreren kommagetrennten Farben bestimmst du die Anzahl der Verlaufsstufen. Binde die SVG anschließend ein:

```md
![HALLO](hallo.svg)
```

Jede generierte SVG enthält einen unsichtbaren Quelltext-Kommentar mit dem Link zu diesem Repository.

## Terminal

Zeige das Pixel-Art-Banner farbig im Terminal an:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --ansi
```

Spiele Reveal und Farb-Schimmer live ab:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

Bei häufiger Nutzung installierst du es einmal:

```sh
npm install --global @iamangusu/pixel-banner
pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

## Icon Marquee

<p align="center"><a href="https://github.com/IamAngusU/icon-marquee"><img src="https://angusu.de/icon-marquee/api/IamAngusU/pixel-banner.svg?include=javascript,nodejs,npm,github&height=56&gap=14&width=680&speed=40&edgeFade=24" alt="JavaScript-, Node.js-, npm- und GitHub-Icons"></a></p>

## Lizenz

[MIT](LICENSE)
