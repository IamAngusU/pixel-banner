<p align="center">
  <img src="assets/pixel-banner-v2.svg" alt="Pixel Banner: animierte Pixel-Art-Schrift" width="520">
</p>

<p align="center">Kräftige Pixel-Art-Schrift als kleine, bearbeitbare SVG. Stil wählen, Farben anpassen und direkt in einer README oder Website nutzen.</p>

<p align="center">
  <a href="https://iamangusu.github.io/pixel-banner/"><img src="assets/generator-button-pb.svg" alt="Pixel-Banner-Generator öffnen" width="360"></a>
</p>

<p align="center"><a href="README.md"><img src="docs/assets/readme-language-en.svg" height="40" alt="Read this README in English"></a></p>

## Galerie

| Neon · Reveal und Schimmer | Feuer | Welle |
|:---:|:---:|:---:|
| <img src="examples/reveal-shimmer.svg" alt="Neon-Schrift mit Reveal und anschließendem Schimmer" height="92"> | <img src="examples/fire.svg" alt="Schrift mit Feuerverlauf" height="92"> | <img src="examples/wave.svg" alt="Animierte Pixel-Schrift mit Welle" height="92"> |

| Farbiger Boden | Helles Mint | Klassisches Neon |
|:---:|:---:|:---:|
| <img src="examples/floor.svg" alt="Farbverlauf unter der Schrift" height="92"> | <img src="examples/light-mint-clean.svg" alt="Mint-Schrift für hellen Hintergrund" height="92"> | <img src="examples/neon.svg" alt="Neon-Schrift mit Farbverlauf" height="92"> |

## Schnellstart

Öffne den [Web-Generator](https://iamangusu.github.io/pixel-banner/), um ohne Installation ein Banner zu erstellen.

Oder erzeuge es mit Node.js 18+:

```sh
npx github:IamAngusU/pixel-banner "HALLO" \
  --preset neon \
  --animation reveal+shimmer \
  --colors "#24D6C8,#39A7FF,#C879FF" \
  --out hallo.svg
```

Füge die SVG in deine README ein:

```md
![HALLO](hallo.svg)
```

Die Anzahl der Verlaufsfarben bestimmst du selbst: Übergib mit `--colors` eine oder mehrere kommagetrennte Farben.
Jede generierte SVG enthält außerdem einen unsichtbaren Quelltext-Kommentar mit dem Link zu diesem Repository.

## Terminal

Gib das Repo-Banner mit Pixel-Schrift und Neonfarben direkt im Terminal aus (Node.js 18+):

```sh
npx --yes github:IamAngusU/pixel-banner "PIXEL-BANNER" --preset neon --ansi
```

Reveal und Farb-Schimmer live im Terminal abspielen, mit `Ctrl+C` beenden:

```sh
npx --yes github:IamAngusU/pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

Bei häufiger Nutzung einmal installieren und danach `pixel-banner` direkt starten:

```sh
npm install --global github:IamAngusU/pixel-banner
pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

## Icon Marquee

<p align="center"><a href="https://github.com/IamAngusU/icon-marquee"><img src="https://angusu.de/icon-marquee/api/IamAngusU/pixel-banner.svg?include=javascript,nodejs,npm,github&height=56&gap=14&width=680&speed=40&edgeFade=24" alt="JavaScript-, Node.js-, npm- und GitHub-Icons"></a></p>

## Lizenz

[MIT](LICENSE)
