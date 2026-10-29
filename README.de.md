<p align="center"><img src="assets/pixel-banner-v2.svg" width="520" alt="Pixel Banner"></p>

<h1 align="center">Bring Bewegung in deine README.</h1>
<p align="center">Erstelle kräftige Pixel-Art-Schrift als bearbeitbare SVG – mit eigenen Farbverläufen und Animationen.</p>

<p align="center"><a href="https://iamangusu.github.io/pixel-banner/"><img src="assets/generator-button-pb.svg" width="360" alt="Pixel-Banner-Generator öffnen"></a></p>

<p align="center"><a href="README.md"><img src="docs/assets/readme-language-en.svg" height="40" alt="Read this README in English"></a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@iamangusu/pixel-banner"><img src="https://img.shields.io/npm/v/%40iamangusu%2Fpixel-banner?style=flat-square" alt="npm-Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/IamAngusU/pixel-banner?style=flat-square" alt="MIT-Lizenz"></a>
</p>

<p align="center"><a href="#galerie">Galerie</a> · <a href="#schnellstart">Schnellstart</a> · <a href="#cli-optionen">CLI-Optionen</a> · <a href="#terminal">Terminal</a> · <a href="#lizenz">Lizenz</a></p>

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

Die Pixel-Schrift unterstützt alle druckbaren ASCII-Tastaturzeichen sowie typische deutsche Tasten wie `§`, `€`, `°` und `²`. Akzentbuchstaben werden auf ihren Grundbuchstaben abgebildet (zum Beispiel wird `ä` zu `A`); nicht unterstützte Schriftsysteme und Emojis erscheinen als `?`.

## CLI-Optionen

`pixel-banner --help` zeigt eine Kurzfassung. Hier findest du alle Optionen; die Standardwerte sind **fett** markiert und gelten, sofern ein Preset sie nicht überschreibt.

### Text, Ausgabe und Presets

| Flag | Funktion |
|---|---|
| `TEXT` | Zu rendernder Text. Nicht unterstützte Zeichen werden als `?` dargestellt. |
| `-o, --out DATEI` | SVG in eine Datei schreiben. Ohne diese Option wird die SVG auf stdout ausgegeben. |
| `-p, --preset NAME` | Einen eingebauten Stil laden: `aiphone`, `neon`, `fire`, `mono`, `floor`, `reveal`, `light`, `light-sun`, `light-mint` oder `light-ink`. Andere Flags können Preset-Werte überschreiben. |
| `-h, --help` | Kurzhilfe anzeigen. |

### Form und Tiefe

| Flag | Standard | Funktion |
|---|---:|---|
| `--scale N` | **8** | Ausgabepixel pro Zelle der Pixel-Schrift. Ein größerer Wert vergrößert die SVG, ohne das Design zu ändern. |
| `--glyph-width N` | **100** | Zeichenbreite in Prozent: `60` ist schmal, `140` ist breit. |
| `--weight N` | **1** | `1` nutzt die normale dünne Schrift, `2` macht die Zeichen kräftiger. |
| `--depth N` | **3** | Anzahl diagonaler 3D-Tiefenstufen in Pixel-Schriftzellen. `0` ergibt flache Schrift; höhere Werte erzeugen mehr Tiefe. Der Web-Regler reicht von `0–8`; in der CLI sind auch größere nicht-negative Ganzzahlen möglich. |
| `--spacing N` | **1** | Abstand zwischen Buchstaben in Zellen. `0` verbindet sie, höhere Werte vergrößern den Abstand. |
| `--padding N` | **1** | Freier Rand um das Banner in Zellen. |
| `--taper` | aus | Verengt die Zeichen schrittweise zum Ende hin um bis zu 28 Prozent. |

### Farben, Hintergrund und Animation

| Flag | Standard | Funktion |
|---|---:|---|
| `--colors "HEX,HEX,..."` | **`#5B6CFF,#A66BFF`** | Setzt eine oder mehrere Verlauf-Farben. Weitere kommagetrennte Farben fügen Verlaufstufen hinzu; eine Farbe ergibt eine einfarbige Füllung. |
| `--vertical` | aus | Lässt den Farbverlauf von oben nach unten statt von links nach rechts laufen. |
| `--shadow HEX` | **`#2B2A6B`** | Farbe der 3D-Tiefenstufen. |
| `--highlight N` | **0.25** | Stärke der hellen Oberkante von `0` (aus) bis `1` (maximal). |
| `--bg HEX` | keiner | Füllt den Hintergrund mit einer Farbe. |
| `--transparent` | aus | Hält den SVG-Hintergrund transparent, auch wenn `--bg` gesetzt ist. |
| `--light` | aus | Passt den Kontrast für helle Seiten an und macht den Hintergrund transparent, sofern kein `--bg` angegeben ist. |
| `--dark` | — | Deaktiviert den Hellseiten-Stil, zum Beispiel zum Überschreiben eines `light-*`-Presets. |
| `--animation NAME` | **`none`** | Wählt `none`, `wave`, `shimmer`, `blink`, `floor` oder `reveal`. Effekte lassen sich mit `+` kombinieren, zum Beispiel `reveal+shimmer`. |
| `--footer` | aus | Fügt unter dem Banner einen sichtbaren „powered by“-Hinweis mit Repository-Link hinzu. |

### Terminal-Ausgabe

| Flag | Funktion |
|---|---|
| `--ansi` | Gibt ein statisches Pixelbild mit 24-Bit-Farben im Terminal aus. |
| `--tui` | Spielt Animationen im Terminal ab. Mit Strg+C beenden. |
| `--live` | Öffnet das interaktive Live-Studio. Gib Text ein und drücke Tab, um Preset, Animation, Farben, Tiefe, Größe, Abstand, Schatten, Hintergrund und weitere Ausgabeoptionen bei sofortiger Vorschau anzupassen. Enter beendet im Textmodus, Strg+S in den Einstellungen, Strg+C bricht ab. Mit `-o DATEI` kannst du den SVG-Ausgabepfad vorgeben. |
| `--width N` | Legt die Zeilenbreite für `--ansi`, `--tui` oder `--live` fest. Standardmäßig wird die aktuelle Terminalbreite genutzt. |

Auch der Web-Generator aktualisiert die SVG-Vorschau während der Eingabe und bei Änderungen an den Reglern. Der Tiefenregler reicht von `0` (flach) bis `8` (starker 3D-Effekt).

## Terminal

Zeige das Pixel-Art-Banner farbig im Terminal an:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --ansi
```

Spiele Reveal und Farb-Schimmer live ab:

```sh
npx --yes @iamangusu/pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

Öffne das Live-Studio. Gib deinen Bannertext ein, drücke Tab für die Einstellungen und sieh jede Änderung sofort in der Vorschau:

```sh
npx --yes @iamangusu/pixel-banner --live
```

In den Einstellungen wählst du mit Oben/Unten eine Option, änderst Auswahlwerte und Zahlen mit Links/Rechts und bearbeitest Farben oder den Ausgabepfad mit Enter. Mit Tab geht es zurück zum Text. Du kannst auch mit Text und Flags starten, zum Beispiel `pixel-banner "HALLO" --live --preset neon`.

Lange Terminal-Banner werden automatisch an die Fensterbreite angepasst. Mit `--width 100` kannst du die Breite selbst festlegen.

Bei häufiger Nutzung installierst du es einmal:

```sh
npm install --global @iamangusu/pixel-banner
pixel-banner "PIXEL-BANNER" --preset neon --animation reveal+shimmer --tui
```

## Icon Marquee

<p align="center"><a href="https://github.com/IamAngusU/icon-marquee"><img src="https://angusu.de/icon-marquee/api/IamAngusU/pixel-banner.svg?include=javascript,nodejs,npm,github&height=56&gap=14&width=680&speed=40&edgeFade=24" alt="JavaScript-, Node.js-, npm- und GitHub-Icons"></a></p>

## Lizenz

[MIT](LICENSE)
