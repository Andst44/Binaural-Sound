# Immersion Sound / Binaural-Sound

Application expérimentale Windows 11 x64 de spatialisation binaurale au casque.
Profils : **Film, Musique, Communication, Jeu, Vidéo / POV et Concert**. Distance virtuelle de 50 cm à
3 m, volume, basses, amplification et enveloppement mémorisés localement.

L'application utilise Web Audio HRTF dans Microsoft WebView2. Une entrée stéréo
est répartie entre 26 positions virtuelles : trois couronnes de huit positions
et deux pôles. Ce ne sont pas 26 canaux originaux : aucun décodage Dolby Atmos,
aucun suivi de tête, aucune garantie de distance physique perçue.
Le programme Windows ne nécessite pas Node.js à l'exécution.

## Installation et utilisation

Version de développement **non signée** : Smart App Control peut la bloquer.
Aucune signature SignPath n'est obtenue à ce jour.

Installer les prérequis depuis leurs éditeurs :
- [Microsoft WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).
- [VB-CABLE](https://vb-audio.com/Cable/), puis redémarrer Windows.

VB-CABLE est un produit séparé de VB-Audio, donationware ; les contributions
sont les bienvenues sur https://shop.vb-audio.com/. Il n'est pas inclus ici.

Dans Windows, sélectionner CABLE Input comme sortie. Dans Immersion Sound,
autoriser l'accès audio, sélectionner CABLE Output en entrée et le casque en
sortie, puis Démarrer le son. Ne pas activer « Écouter ce périphérique ».
La croix réduit la fenêtre ; Application > Quitter complètement ferme le logiciel.
L'application ne démarre pas la capture automatiquement à sa réouverture.

## Compilation

Sur Windows avec PowerShell et le compilateur .NET Framework 4.x :

```powershell
./build-public.ps1
```

Le script télécharge le SDK WebView2 1.0.2365.46 de NuGet, vérifie son SHA-256,
et compile les sources. Les fichiers sont générés dans `Immersion Sound Windows`.
Pour fabriquer l'installateur, compiler `installer/ImmersionSound.iss` avec Inno
Setup 7.1.1. Le workflow GitHub Actions effectue ces étapes et conserve les
artefacts non signés ; il ne publie pas de release et n'envoie pas de demande de
signature. Les tests utilisent une entrée simulée, pas un microphone réel.

## Code signing policy

Voir [CODE_SIGNING.md](CODE_SIGNING.md). Préparation d'une candidature uniquement.
La présence du dépôt public ne garantit pas l'acceptation par SignPath Foundation.

## Licence et confidentialité

Code du projet sous [licence MIT](LICENSE). Les dépendances conservent leurs
[licences propres](THIRD_PARTY.md). Voir [PRIVACY.md](PRIVACY.md).

## Vidéo / POV

Le profil renforce la présence des voix et ajoute une réverbération courte de
petite pièce. Le curseur Ambiance de pièce (0–100 %, initialement 25 %) est
mémorisé. Le traitement concerne le mix complet de la vidéo, sans séparation
automatique de la voix. Il ne traite pas le microphone.

## Concert

Simulation d'une salle de concert, avec scène frontale et ambiance latérale et
arrière. Le curseur Ambiance de salle (0–100 %, initialement 35 %) règle une
réverbération stéréo de 1,6 seconde, indépendante de celle du mode POV. Le réglage
est mémorisé. Aucun bruit de public n'est ajouté. L'effet traite le mix complet ;
une musique déjà très réverbérée peut nécessiter une ambiance plus faible.
