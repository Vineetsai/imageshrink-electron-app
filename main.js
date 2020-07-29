const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
} = require("electron");

process.env.NODE_ENV = "dev";

let mainWindow;
let aboutWindow;

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV === "dev";
console.log(process.env.NODE_ENV);

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: isDev ? 1000 : 500,
    height: 600,
    icon: "./app/assets/icons/Icon_256x256.png",
    resizable: false,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
    },
    allowRunningInsecureContent: true,
    webSecurity: false,
  });
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About",
    width: 300,
    height: 300,
    icon: "./app/assets/icons/Icon_256x256.png",
    resizable: false,
    backgroundColor: "white",
  });
  aboutWindow.loadFile("./app/about.html");
}

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  if (isDev) {
    globalShortcut.register("CmdOrCtrl+I", () => mainWindow.toggleDevTools());
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("ready", () => (mainWindow = null));
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+W",
        click: () => app.quit(),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
  // ...() => {
  //   if (isDev) {
  //     return [
  //       {
  //         label: "Developer",
  //       },
  //     ];
  //   } else {
  //     return [];
  //   }
  // },
];
ipcMain.on("min-image", (e, msg) => {
  console.log(msg);
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows.length === 0) {
    createMainWindow();
  }
});
