# Le Tombeau Scellé

Escape room 3D en temps réel — WebGL, jouable à deux avec voix.

**Jouer : https://bechiryengui.github.io/tombeau-scelle/**

## Le jeu

Une antichambre à déverrouiller, trois chambres à sceaux, vingt minutes,
et des gardiens momifiés. Aucun asset externe : décor, hiéroglyphes, mains,
pistolet et momies sont générés par le code au démarrage.

    ZQSD / WASD   marcher          Maj    courir
    Souris        regarder         Clic   tirer
    E             examiner         T      parler
    I             indice           R      recommencer (2x)

## Jouer à deux

1. Un joueur clique **Créer une partie** et reçoit un code.
2. L'autre clique **Rejoindre**, entre le code, valide.
3. Chacun clique **Activer le micro** pour la voix.

Mise en relation par l'annuaire public PeerJS, puis **WebRTC pair-à-pair** :
positions, messages et voix passent directement d'un navigateur à l'autre.
Aucun serveur, aucun coût.

## Technique

Un seul fichier, aucun build. three.js r128 + PeerJS 1.5.4 depuis CDN.

    npm run check    # exécute le script hors navigateur, détecte les erreurs au chargement
