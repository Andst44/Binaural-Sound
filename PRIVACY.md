# Confidentialité

Immersion Sound traite localement l'audio sélectionné. Le code du projet ne
transmet pas l'audio à un serveur et ne contient pas de télémétrie. L'accès à
l'entrée audio nécessite l'autorisation de l'utilisateur.

Les réglages et identifiants des périphériques sont conservés dans le stockage
local WebView2, dans le dossier `profile` à côté du programme. Ce dossier n'est
pas distribué. La désinstallation le conserve ; il peut être supprimé après
fermeture du logiciel pour effacer les réglages et permissions enregistrés.

Microsoft WebView2 peut avoir ses propres communications de maintenance et
services ; politique Microsoft : https://privacy.microsoft.com/privacystatement.
Les téléchargements de dépendances pendant la compilation contactent NuGet et
GitHub. L'installation séparée des prérequis relève de leurs éditeurs.
