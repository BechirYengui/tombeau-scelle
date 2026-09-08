# Le Tombeau Scellé

Escape room 3D temps réel, jouable à deux avec la voix.
**→ [bechiryengui.github.io/tombeau-scelle](https://bechiryengui.github.io/tombeau-scelle/)**

Une antichambre à déverrouiller, trois chambres à sceaux, vingt minutes,
et des gardiens momifiés. **Aucun asset externe** : pierre, hiéroglyphes,
cadran solaire, mains, pistolet et momies sont générés par le code au
démarrage — canevas 2D pour les textures, géométrie extrudée pour les formes.

## Commandes

| Touche | Action | Touche | Action |
|---|---|---|---|
| `ZQSD` / `WASD` | marcher | `Maj` | courir |
| Souris | regarder | Clic gauche | tirer |
| `E` | examiner | `T` | parler |
| `I` | indice | `R` `R` | recommencer |

## Jouer à deux

1. **Activez le micro** (le navigateur demandera l'autorisation).
2. Un joueur clique **Créer une partie** → un code de 6 lettres s'affiche et reste
   visible en jeu, en haut à gauche.
3. L'autre clique **Rejoindre**, entre le code, valide.

Mise en relation par l'annuaire public PeerJS, puis **WebRTC pair-à-pair** :
positions, messages et voix passent directement d'un navigateur à l'autre.
Aucun serveur, aucun coût.

> Le micro exige **HTTPS**. Il ne fonctionnera pas par double-clic sur le
> fichier, ni sur `http://localhost`.

## Développer

    npm run build     # assemble src/ → index.html
    npm run check     # exécute le script hors navigateur, détecte les erreurs de chargement
    npm start         # sert le dossier sur http://localhost:5173

**On ne modifie jamais `index.html` ni `game.js` : ils sont générés.**
Éditez `src/`, puis `npm run build`.

## Structure

    src/
      head.html            titre, polices
      style.css            toute l'interface
      body.html            balisage de l'ATH
      vendor.html          scripts CDN, avec empreintes SRI
      01-boot.js           rendu, textures peintes, environnement
      02-world.js          grille de tuiles → murs, sol, lumières
      03-utils.js          poches, panneaux, son
      04-room-antechamber  l'escape room et sa chaîne d'indices
      05-room-shards       anamorphose
      06-room-shadows      doubles ombres
      07-room-maze         labyrinthe invisible
      08-seals.js          sceaux, sarcophage
      09-viewmodel.js      mains, torche, pistolet, douilles
      10-mummies.js        gardiens, tir, dégâts
      11-net.js            PeerJS, voix, messagerie
      12-player.js         déplacement, visée, chrono, boucle
      order.json           ordre de concaténation
    tools/
      build.js             assembleur (aucune dépendance)
      harness.js           banc d'essai de chargement
    docs/
      ARCHITECTURE.md  PERFORMANCE.md  SECURITY.md  SOLUTIONS.md

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — comment le monde, les énigmes et le réseau s'articulent
- [Performance](docs/PERFORMANCE.md) — les coûts mesurés et ce qui les réduit
- [Sécurité](docs/SECURITY.md) — SRI, CSP, durcissement des paquets
- [Solutions](docs/SOLUTIONS.md) — ⚠️ divulgâche intégral

MIT.
