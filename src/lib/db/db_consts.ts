// import { app } from 'electron'
// const isDev = process.env.NODE_ENV === 'development';
// const dbPath = isDev 
//   ? 'file:./database.db' 
//   : `${app.getPath('userData')}/database.db`;
// export const dbUrl = dbPath;


import { app } from 'electron';
import path from 'path';

// Usa a pasta userData do Electron para armazenar o banco
export const dbUrl = path.join(app.getPath('userData'), 'database.db');
console.log('📁 Database location:', dbUrl);