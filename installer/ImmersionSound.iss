#define AppSource "..\Immersion Sound Windows"

[Setup]
AppId={{AF48F36F-4204-4E36-B6EF-F7DB4205B1DE}
AppName=Immersion Sound
AppVersion=0.1.0
AppPublisher=Immersion Sound
DefaultDirName={localappdata}\Programs\Immersion Sound
DefaultGroupName=Immersion Sound
PrivilegesRequired=lowest
ArchitecturesAllowed=x64os
ArchitecturesInstallIn64BitMode=x64os
MinVersion=10.0.22000
OutputDir=..\dist
OutputBaseFilename=ImmersionSound-OpenSource-Setup
SetupIconFile=..\windows-app\immersion.ico
UninstallDisplayIcon={app}\immersion.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
InfoBeforeFile=INFORMATIONS.txt
CloseApplications=yes
RestartApplications=no
DisableProgramGroupPage=yes

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "Créer un raccourci sur le Bureau"; GroupDescription: "Raccourcis :"

[Files]
Source: "{#AppSource}\ImmersionSound.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\ImmersionSound.exe.config"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\Microsoft.Web.WebView2.Core.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\Microsoft.Web.WebView2.WinForms.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\WebView2Loader.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\immersion.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\assets\index.html"; DestDir: "{app}\assets"; Flags: ignoreversion
Source: "{#AppSource}\assets\sphere-audio.js"; DestDir: "{app}\assets"; Flags: ignoreversion
Source: "INFORMATIONS.txt"; DestDir: "{app}"; Flags: ignoreversion

Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\THIRD_PARTY.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSource}\WebView2-LICENSE.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Immersion Sound"; Filename: "{app}\ImmersionSound.exe"; WorkingDir: "{app}"; IconFilename: "{app}\immersion.ico"
Name: "{autodesktop}\Immersion Sound"; Filename: "{app}\ImmersionSound.exe"; WorkingDir: "{app}"; IconFilename: "{app}\immersion.ico"; Tasks: desktopicon
Name: "{group}\Guide de démarrage"; Filename: "{app}\INFORMATIONS.txt"
