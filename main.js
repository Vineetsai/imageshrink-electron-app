const path = require("path");
const os = require("os");
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const imagmin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const slash = require("slash");
const imagemin = require("imagemin");

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
  msg.dest = path.join(os.homedir(), "imageshrink");
  console.log(msg);
  shrinkImage(msg);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    // shell.openItem(dest);
    shell.openItem(dest);
  } catch (err) {
    console.log(err);
  }
}

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
