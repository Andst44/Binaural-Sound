# Dépendances tierces

- Microsoft.Web.WebView2 SDK 1.0.2365.46 : distribué par Microsoft via NuGet,
  soumis à sa licence, copiée dans `WebView2-LICENSE.txt` du paquet compilé.
  Les DLL Microsoft ne sont pas couvertes par notre licence MIT.
- WebView2 Runtime : prérequis Microsoft installé séparément ; HRTF Web Audio
  fourni par ce moteur. Aucun filtre HRIR extrait du navigateur n'est distribué.
- VB-CABLE : prérequis propriétaire de VB-Audio, non inclus dans ce dépôt ou son
  installateur. https://vb-audio.com/Services/licensing.htm
- Inno Setup : outil de compilation, non inclus dans le dépôt ; respecter ses
  conditions d'utilisation. https://jrsoftware.org/
- Playwright : dépendance de test sous Apache-2.0, non livrée dans l'application.

L'éligibilité du paquet WebView2 à l'exception de bibliothèques système de
SignPath reste à confirmer par SignPath avant toute promesse de signature.
