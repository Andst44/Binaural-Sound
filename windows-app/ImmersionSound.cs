using System;
using System.IO;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: System.Reflection.AssemblyProduct("Immersion Sound")]
[assembly: System.Reflection.AssemblyTitle("Immersion Sound")]
[assembly: System.Reflection.AssemblyVersion("0.1.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("0.1.0.0")]

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        bool test = Array.IndexOf(args, "--self-test") >= 0;
        bool fresh;
        using (var mutex = new Mutex(true, test ? "Local\\ImmersionSoundTest" : "Local\\ImmersionSound", out fresh))
        {
            if (!fresh) { MessageBox.Show("Immersion Sound est déjà ouvert. Utilise sa fenêtre existante.", "Immersion Sound"); return; }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new ImmersionWindow(test));
        }
    }
}

internal sealed class ImmersionWindow : Form
{
    private readonly WebView2 view = new WebView2();
    private readonly bool selfTest;
    private readonly string root = AppDomain.CurrentDomain.BaseDirectory;
    private readonly System.Windows.Forms.Timer timeout = new System.Windows.Forms.Timer();
    private bool quitRequested;
    private const string Origin = "https://immersion.local";
    public ImmersionWindow(bool test)
    {
        selfTest = test;
        Text = "Immersion Sound — Film · Musique · Communication · Jeu";
        Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        ClientSize = new Size(1180, 850); MinimumSize = new Size(760, 600);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(10,16,26);
        view.Dock = DockStyle.Fill; Controls.Add(view);
        var menu = new MenuStrip();
        var applicationMenu = new ToolStripMenuItem("Application");
        var soundSettings = new ToolStripMenuItem("Choisir la sortie Windows…");
        soundSettings.Click += delegate { System.Diagnostics.Process.Start("ms-settings:sound"); };
        applicationMenu.DropDownItems.Add(soundSettings);
        var quit = new ToolStripMenuItem("Quitter complètement");
        quit.Click += delegate { quitRequested = true; Close(); };
        applicationMenu.DropDownItems.Add(quit);menu.Items.Add(applicationMenu);
        MainMenuStrip = menu;Controls.Add(menu);
        if (test) { ShowInTaskbar = false; Opacity = 0; }
        Shown += async delegate { await Initialize(); };
        FormClosed += delegate { timeout.Stop(); view.Dispose(); };
    }
    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        // Keep Windows shutdown and explicit Quit working normally.
        if (!selfTest && !quitRequested && e.CloseReason == CloseReason.UserClosing)
        {
            e.Cancel = true;
            WindowState = FormWindowState.Minimized;
        }
        base.OnFormClosing(e);
    }
    private async Task Initialize()
    {
        try
        {
            var profile = Path.Combine(root, selfTest ? "test-profile" : "profile");
            var environment = await CoreWebView2Environment.CreateAsync(null, profile);
            await view.EnsureCoreWebView2Async(environment);
            var core = view.CoreWebView2;
            core.SetVirtualHostNameToFolderMapping("immersion.local", Path.Combine(root,"assets"), CoreWebView2HostResourceAccessKind.DenyCors);
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.IsWebMessageEnabled = selfTest;
            core.NavigationStarting += delegate(object sender, CoreWebView2NavigationStartingEventArgs e) {
                Uri uri;
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out uri) || uri.Scheme != "https" || uri.Host != "immersion.local") e.Cancel = true;
            };
            core.NewWindowRequested += delegate(object sender, CoreWebView2NewWindowRequestedEventArgs e) { e.Handled = true; };
            core.PermissionRequested += delegate(object sender, CoreWebView2PermissionRequestedEventArgs e) {
                Uri uri;
                bool local = Uri.TryCreate(e.Uri, UriKind.Absolute, out uri) && uri.Scheme == "https" && uri.Host == "immersion.local";
                e.State = CoreWebView2PermissionState.Deny;
                if (!selfTest && local && e.PermissionKind == CoreWebView2PermissionKind.Microphone)
                {
                    var answer = MessageBox.Show(this,
                        "Autoriser Immersion Sound à accéder aux entrées audio ?\n\nCela permet de lire CABLE Output pour traiter le son des films, jeux et musiques. Le son est traité localement, sans enregistrement ni envoi. La recherche peut ouvrir brièvement l’entrée par défaut avant de trouver le câble.",
                        "Accès audio", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                    e.State = answer == DialogResult.Yes ? CoreWebView2PermissionState.Allow : CoreWebView2PermissionState.Deny;
                }
            };
            if (selfTest)
            {
                timeout.Interval = 30000;
                timeout.Tick += delegate { FinishTest("{\"ok\":false,\"error\":\"timeout\"}", false); };
                timeout.Start();
                core.WebMessageReceived += async delegate(object sender, CoreWebView2WebMessageReceivedEventArgs e) {
                    string json=e.TryGetWebMessageAsString();
                    using (var preview=File.Create(Path.Combine(root,"windows-preview.png")))
                        await core.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,preview);
                    FinishTest(json, json.Contains("\"ok\":true"));
                };
                core.NavigationCompleted += async delegate(object sender, CoreWebView2NavigationCompletedEventArgs e) {
                    if (!e.IsSuccess) { FinishTest("{\"ok\":false,\"error\":\"navigation\"}", false); return; }
                    await core.ExecuteScriptAsync(File.ReadAllText(Path.Combine(root,"self-test.js")));
                };
            }
            core.Navigate(Origin + "/index.html#film");
        }
        catch (Exception error)
        {
            if (selfTest) FinishTest("{\"ok\":false,\"error\":\""+error.Message.Replace("\\","/").Replace("\"","'")+"\"}", false);
            else MessageBox.Show(this, "Impossible de démarrer Immersion Sound.\n\n" + error.Message, "Immersion Sound", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
    private void FinishTest(string json, bool ok)
    {
        timeout.Stop();
        File.WriteAllText(Path.Combine(root,"self-test-result.json"), json);
        Environment.ExitCode = ok ? 0 : 1;
        Close();
    }
}
