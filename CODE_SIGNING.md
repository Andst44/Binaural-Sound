# Code signing policy

Statut : candidature en préparation ; aucun certificat ni service de signature
SignPath attribué. Ne pas présenter les versions actuelles comme signées.

Mainteneur, auteur, relecteur et approbateur proposé :
[Andst44](https://github.com/Andst44). Toute contribution externe sera relue.
La double authentification GitHub et SignPath doit être activée avant candidature.
Chaque future demande de signature nécessitera une approbation manuelle.

Les binaires doivent provenir d'une compilation des sources de ce dépôt. Seuls
nos exécutables seront soumis à la signature ; les DLL Microsoft conservent leur
signature d'origine. VB-CABLE, les profils locaux et les expériences APO/HRIR
ne sont pas inclus dans le paquet public.

Avant candidature : valider le workflow, publier une version, documenter son
usage, confirmer avec SignPath l'éligibilité des dépendances WebView2 et fournir
les éléments de réputation du projet. La candidature n'a pas encore été envoyée.

Après acceptation seulement, ajouter l'attribution demandée par SignPath et
configurer les identifiants du projet et les secrets de signature dans GitHub.
Ne jamais placer de jeton ou clé privée dans le dépôt.

Conditions : https://signpath.org/terms.html
Confidentialité : [PRIVACY.md](PRIVACY.md).
