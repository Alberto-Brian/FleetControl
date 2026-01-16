import {
    LOGIN,
    LOGOUT,
    HAS_USERS,
    CREATE_FIRST_USER,
    CHANGE_PASSWORD,
    UPDATE_PROFILE,
} from "./auth-service-channels";

import {
    ICreateFirstUser,
    IChangePassword,
    IUpdateProfile,
    ILogin
} from '@/lib/types/auth'

export function exposeServiceAuthContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_service_auth", {
        login: (credentials: ILogin) => ipcRenderer.invoke(LOGIN, credentials),
        logout: () => ipcRenderer.invoke(LOGOUT),
        hasUsers: () => ipcRenderer.invoke(HAS_USERS),
        createFirstUser: (userData: ICreateFirstUser) => ipcRenderer.invoke(CREATE_FIRST_USER, userData),
        changePassword: (changePasswordData: IChangePassword) => ipcRenderer.invoke(CHANGE_PASSWORD, changePasswordData),
        updateProfile: (userId: string, profileData: IUpdateProfile) => ipcRenderer.invoke(UPDATE_PROFILE, userId, profileData),
    })
}