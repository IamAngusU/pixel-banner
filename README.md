<p align="center">
  <img src="assets/pixel-banner-v2.svg" alt="Pixel Banner: animated pixel-art lettering" width="520">
</p>

<p align="center">Make bold pixel-art text as a small, editable SVG. Choose a preset, tune the colors, then drop it into a README or a website.</p>

<p align="center">
  <a href="https://iamangusu.github.io/pixel-banner/"><img src="assets/generator-button-pb.svg" alt="Open the Pixel Banner generator" width="360"></a>
</p>

<p align="center"><a href="README.de.md"><img src="docs/assets/readme-language-de.svg" height="40" alt="Diese README auf Deutsch lesen"></a></p>

## Gallery

| Neon · reveal and shimmer | Fire | Wave |
|:---:|:---:|:---:|
| <img src="examples/reveal-shimmer.svg" alt="Neon lettering that reveals, then shimmers" height="92"> | <img src="examples/fire.svg" alt="Fire gradient lettering" height="92"> | <img src="examples/wave.svg" alt="Waving pixel lettering" height="92"> |

| Gradient floor | Light mint | Classic neon |
|:---:|:---:|:---:|
| <img src="examples/floor.svg" alt="Gradient floor effect" height="92"> | <img src="examples/light-mint-clean.svg" alt="Mint lettering for a light background" height="92"> | <img src="examples/neon.svg" alt="Neon gradient lettering" height="92"> |

## Quick start

Open the [web generator](https://iamangusu.github.io/pixel-banner/) to make a banner without installing anything.

Or generate one with Node.js 18+:

```sh
npx github:IamAngusU/pixel-banner "HELLO" \
  --preset neon \
  --animation reveal+shimmer \
  --colors "#24D6C8,#39A7FF,#C879FF" \
  --out hello.svg
```

Embed the SVG in your README:

```md
![HELLO](hello.svg)
```

Gradient stop count is up to you: pass one or more comma-separated colors with `--colors`.
Every generated SVG also includes a hidden source comment linking back to this repository.

## Terminal

Print your own colorful pixel banner directly in the terminal (Node.js 18+):

```sh
npx --yes github:IamAngusU/pixel-banner "HELLO" --ansi
```

## Icon Marquee

<p align="center"><a href="https://github.com/IamAngusU/icon-marquee"><img src="https://angusu.de/icon-marquee/api/IamAngusU/pixel-banner.svg?include=javascript,nodejs,npm,github&height=56&gap=14&width=680&speed=40&edgeFade=24" alt="JavaScript, Node.js, npm and GitHub icons"></a></p>

## License

[MIT](LICENSE)
