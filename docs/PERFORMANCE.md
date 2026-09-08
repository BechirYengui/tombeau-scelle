# Performance

Cible : 60 images/s en 1080p sur GPU de portable. Compteur affiché en haut
à droite.

## Les trois coûts dominants, mesurés

| Poste | Avant | Après | Pourquoi |
|---|---|---|---|
| Cartes d'ombres | 2 recalculées 60 fois/s | 20 Hz | `shadowMap.autoUpdate=false`, rafraîchi une image sur trois. La scène est presque statique ; l'œil ne voit pas la différence. |
| Géométries de momie | 14 par gardien × 11 = **154** | **14 partagées** | Cache `gCyl/gSph/gPln/gBox` indexé par dimensions. |
| Requêtes DOM | 4 par image | 0 | Références mises en cache au démarrage. |

## Ce qui était déjà bon

- **Lancer de rayon de visée** : une image sur quatre (`fr & 3`), pas 60/s.
- **Murs et livres** en `InstancedMesh` : 2 appels de rendu au lieu de 55.
- **Textures peintes une seule fois** au démarrage, jamais par image.
- **Zéro allocation dans la boucle** : aucun `new Vector3` par image.
- **`dt` plafonné à 50 ms** : une image longue ne fait pas traverser les murs.

## Les arbitrages

**Rapport de pixels plafonné à 1,75.** Au-delà, le coût monte de ~30 % pour
un gain invisible sur un écran de portable.

**Lumières.** Le rendu direct de three.js fait boucler chaque matériau sur
toutes les lumières. Le trépied avait trois lampes superposées pour trois
flammes : une seule suffit. Il en reste 8 ponctuelles et 2 projecteurs.

**Ce qui n'a pas été fait, et pourquoi.** Fusionner les 111 maillages
statiques exigerait `BufferGeometryUtils`, une dépendance de plus pour un
gain modeste à ce nombre d'objets. Le post-traitement (occlusion ambiante,
bloom) a été essayé puis retiré : coût réel, rendu jugé moins bon.
