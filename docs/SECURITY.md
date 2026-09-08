# Sécurité

Deux surfaces d'attaque réelles : **du code venant d'un CDN** et **des
paquets venant d'un inconnu**.

## Intégrité des dépendances (SRI)

three.js et PeerJS sont chargés avec `integrity="sha384-…"` et
`crossorigin="anonymous"`. Un CDN compromis ne peut plus injecter de code :
le navigateur compare l'empreinte et refuse un fichier modifié.

Les empreintes sont calculées par téléchargement réel du fichier. **En cas
de changement de version, il faut les recalculer** :

    curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A

## Politique de sécurité de contenu

Posée par `tools/build.js`. `default-src 'none'` : rien ne se charge par
défaut. Sont autorisés, et rien d'autre : les scripts de cdnjs, les polices
de Google Fonts, les images `data:` (le grain), et les connexions vers
l'annuaire PeerJS. `object-src`, `base-uri` et `form-action` sont fermés.

`'unsafe-inline'` reste nécessaire pour le script et le style du jeu. Le
durcir par empreinte est possible et documenté dans `build.js`, mais une
empreinte fausse rend la page **entièrement blanche** — à ne faire qu'avec
un navigateur sous la main pour vérifier.

`frame-ancestors` n'est pas applicable : cette directive n'a d'effet qu'en
en-tête HTTP, et GitHub Pages n'en pose pas.

## Paquets réseau

Tout ce qui arrive d'un pair est traité comme hostile :

- **Types validés** — un nombre doit être fini et dans les bornes du monde.
  `NaN`, `Infinity` et les coordonnées hors carte sont rejetés.
- **Chaînes nettoyées** — caractères de contrôle, marques bidirectionnelles
  et espaces de largeur nulle supprimés, longueur plafonnée.
- **Jamais d'HTML** — les messages sont insérés par `createTextNode`, jamais
  par `innerHTML`. Aucune injection possible.
- **Couleurs validées** par expression régulière stricte `#rrggbb`.
- **Débit limité** — 80 paquets/s au total, 2 messages/s. Un pair ne peut
  pas noyer la boucle de rendu.
- **Poignée de main** — l'hôte n'écoute rien tant que le visiteur n'a pas
  prouvé qu'il détient le code, et ferme les liaisons muettes après 6 s.

## Ce qui reste ouvert, honnêtement

Le code de partie fait 6 caractères sur un alphabet de 30, soit 7 × 10⁸
possibilités : le deviner est impraticable, mais **quiconque obtient le code
peut rejoindre**. Il n'y a ni compte ni mot de passe — c'est un jeu à deux,
pas un service.

L'annuaire PeerJS public voit les identifiants de pairs qui transitent. Il ne
voit **ni la voix, ni les positions, ni les messages** : tout cela passe en
direct entre les deux navigateurs, chiffré par WebRTC (DTLS-SRTP).
