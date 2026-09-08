# Architecture

## Le principe

Un seul fichier livré, aucun bundler, deux dépendances chargées par CDN.
`tools/build.js` concatène les modules de `src/` dans l'ordre de `order.json`
à l'intérieur d'une unique IIFE. Il n'y a donc **ni modules ES, ni portée par
fichier** : toutes les déclarations partagent la même portée.

> C'est le piège principal du projet. Deux collisions de noms ont déjà cassé
> le jeu au chargement (`bump()` texture / `bump()` labyrinthe, puis `room`
> variable / `room()` fonction). `npm run check` les détecte, et un audit
> compare les noms de fonctions et de variables.

## Le monde

`02-world.js` construit tout depuis une **grille de tuiles** de 29 × 31, pas
de 3 unités. `carve(x,z,w,h)` creuse une salle ; les murs sont les tuiles
pleines qui touchent une tuile creusée, réunies en un seul `InstancedMesh`.
Les collisions relisent la **même grille** : décor et solide ne peuvent pas
diverger.

    antichambre  x 9-19  z 21-28      grande salle  x 9-19  z 11-19
    nord         x 9-19  z 1-8        ouest  x 1-7   est  x 21-27

## La chaîne d'énigmes

    natte ──▸ clé de bronze ──▸ coffret ──▸ papyrus
                  ↓
      3 torches · 7 scarabées · gnomon sur V · 2 Anubis  =  3752
                  ↓
      stèle ──▸ niche [3752] ──▸ clé de la dalle + amulette
                  ↓
      4 vases canopes  I·A II·N III·K IV·H  ──▸ dalle [ANKH]
                  ↓
      3 chambres ──▸ 3 sceaux ──▸ sarcophage ──▸ sortie

Les codes ne sont **pas arbitraires** : ils se déduisent d'objets réellement
présents dans la salle. Un script de vérification extrait le nombre de
torches, de scarabées rouges, la position du gnomon et le nombre d'Anubis du
code source, et les confronte au code du coffre.

## Le modèle de vue

Les mains sont rendues dans **une scène et une caméra séparées**, dessinées
après un effacement du tampon de profondeur. Sans cela, un objet tenu à 40 cm
de l'œil traverse les murs.

Tout y est construit **doigts vers −Z**, le sens du regard de la caméra.
Aucune rotation de rattrapage : ajouter π sur Y miroite les inclinaisons X et
Z et casse les poignets — cette faute a coûté trois itérations.

## Le réseau

`11-net.js` : PeerJS ne sert qu'à l'accroche. Ensuite tout passe en WebRTC
direct — positions (14 Hz), messages, coups de feu, et le flux audio.
L'hôte prend l'identifiant `tombeau-<CODE>` ; le visiteur s'y connecte et
prouve qu'il détient le code par une poignée de main.
