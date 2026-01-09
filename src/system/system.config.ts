import path from "path";

const isDev = process.env.NODE_ENV === 'development';
const MIGRATIONS_FOLDER_PATH = isDev
    ? './drizzle'
    : path.join(process.resourcesPath, 'drizzle');

export {
    MIGRATIONS_FOLDER_PATH
}
