# Daisyland
Projet nuit de l'info 2025-2026

# Notre démarche RSE

## Choix du framework : PIXIJS
Nous avons choisi **PIXIJS** pour plusieurs raisons liées à la sobriété numérique :
- **Performance côté client** : PIXIJS exploite efficacement le GPU pour l’affichage 2D, ce qui permet d’obtenir un rendu fluide sans surconsommation de ressources.
- **Framework léger** : par rapport à des moteurs de jeu plus lourds, PIXIJS reste minimaliste et évite d’embarquer des fonctionnalités inutiles à notre cas d’usage.
- **Optimisation des ressources** : la gestion fine des textures et sprites limite le nombre de chargements et de recalculs graphiques, réduisant l’empreinte énergétique côté utilisateur.

## Choix de la sauvegarde : fichier local à télécharger
Nous avons volontairement écarté l’utilisation d’un backend, d’un login ou d’un service cloud pour la sauvegarde de la progression. À la place, nous utilisons un **fichier de sauvegarde local** à télécharger.

- **Aucune infrastructure serveur dédiée** : pas de base de données à maintenir, pas de requêtes réseau pour les sauvegardes, donc moins de consommation d’énergie côté datacenters.
- **Minimisation des données** : seules les données strictement nécessaires à la progression de la partie sont stockées. Aucune donnée personnelle, aucun profil, aucun tracking.
- **Contrôle total par l’utilisateur** : le fichier de sauvegarde est stocké sur l’appareil de l’utilisateur. Il peut le conserver, le supprimer ou le restaurer quand il le souhaite.
- **Confidentialité par conception** : comme aucune donnée de jeu n’est envoyée vers nos serveurs, il n’y a pas de risque de fuite ou de réutilisation non souhaitée des données.
