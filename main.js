// Import Electron and Core Modules
const electron = require('electron');
const url = require('url');
const path = require('path');

// Pull App and BrowserWindow from Electron
const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set Environment 
process.env.NODE_ENV = 'production';

let mainWindow, addWindow;

//Listen for App Ready
app.on('ready', function(){

    //Create a new Window
    mainWindow = new BrowserWindow({});

    //Load HTML into the Window (file://dirname/mainWindow.html)
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'), //__dirname = current directory
        protocol: 'file:',
        slashes: true
    }));

    //Quit App When Closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //Build Menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //Insert Menu
    Menu.setApplicationMenu(mainMenu);

});

//Catch item:add
ipcMain.on('item:add', function(e, item){
    //Send Item to the Main Window
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create Menu Template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', //Shortcut: Darwin = Value on Mac, Otherwise Windows or Linux
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//If Mac, Add Empty Object to Menu to Account for Electron Button
if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
};

//Add Developer Tools Item if Not in Production
if (process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I', //Shortcut: Darwin = Value on Mac, Otherwise Windows or Linux
                //Make Dev Tools Pop Up for Focused Window
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
};

//Functions
function createAddWindow(){
    //Create a new Window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });

    //Load HTML into the Window (file://dirname/addWindow.html)
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'), //__dirname = current directory
        protocol: 'file:',
        slashes: true
    }));

    //Garbage Collection Handler
    addWindow.on('close', function(){
        addWindow = null;
    });
};