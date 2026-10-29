<p align="center"><img src="assets/pixel-banner-v2.svg" width="520" alt="Pixel Banner"></p>

<h1 align="center">Make your README move.</h1>
<p align="center">Create bold pixel-art text as editable SVGs, with custom gradients and animation.</p>

<p align="center"><a href="https://iamangusu.github.io/pixel-banner/"><img src="assets/generator-button-pb.svg" width="360" alt="Open the Pixel Banner generator"></a></p>

<p align="center"><a href="README.de.md"><img src="docs/assets/readme-language-de.svg" height="40" alt="Diese README auf Deutsch lesen"></a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@iamangusu/pixel-banner"><img src="https://img.shields.io/npm/v/%40iamangusu%2Fpixel-banner?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/IamAngusU/pixel-banner?style=flat-square" alt="MIT license"></a>
</p>

<p align="center"><a href="#gallery">Gallery</a> · <a href="#quick-start">Quick start</a> · <a href="#terminal">Terminal</a> · <a href="#license">License</a></p>

## Gallery

| Neon · reveal and shimmer | Fire | Wave |
|:---:|:---:|:---:|
| <img src="examples/reveal-shimmer.svg" alt="Neon lettering that reveals, then shimmers" height="92"> | <img src="examples/fire.svg" alt="Fire gradient lettering" height="92"> | <img src="examples/wave.svg" alt="Waving pixel lettering" height="92"> |

| Gradient floor | Light mint | Classic neon |
|:---:|:---:|:---:|
| <img src="examples/floor.svg" alt="Gradient floor effect" height="92"> | <img src="examples/light-mint-clean.svg" alt="Mint lettering for a light background" height="92"> | <img src="examples/neon.svg" alt="Neon gradient lettering" height="92"> |

## Quick start

Make an SVG with Node.js 18+—no global install needed:

```sh
npx --yes @iamangusu/pixel-banner "HELLO" --preset neon --animation reveal+shimmer --colors "#24D6C8,#39A7FF,#C879FF" --out hello.svg
```

Use one or more comma-separated colors to choose the number of gradient stops. Then embed the SVG:

```md
![HELLO](hello.svg)
```

Every generated SVG includes a hidden source comment linking to this repository.

## Terminal

Print the pixel-art banner in color:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --ansi
```

Play the reveal and color shimmer live:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

For frequent use, install it once:

```sh
npm install --global @iamangusu/pixel-banner
pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

## Icon Marquee

<p align="center"><a href="https://github.com/IamAngusU/icon-marquee"><img src="https://angusu.de/icon-marquee/api/IamAngusU/pixel-banner.svg?include=javascript,nodejs,npm,github&height=56&gap=14&width=680&speed=40&edgeFade=24" alt="JavaScript, Node.js, npm and GitHub icons"></a></p>

## License

[MIT](LICENSE)
