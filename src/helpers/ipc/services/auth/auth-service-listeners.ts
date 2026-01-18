//src/helpers/services/auth/auth-service-listeners.ts
import { AuthService } from '@/lib/services/auth.service';
import { ipcMain } from "electron";
import { 
    LOGIN, 
    LOGOUT, 
    HAS_USERS, 
    CREATE_FIRST_USER, 
    CHANGE_PASSWORD, 
    UPDATE_PROFILE
 } from "./auth-service-channels";

import { IUser } from "@/lib/types/user";
import { ILogin, ICreateFirstUser, IChangePassword, IUpdateProfile } from "@/lib/types/auth";

export function addServiceAuthEventListeners() {
    ipcMain.handle(
        LOGIN,
        async (_, loginData: ILogin) => await loginEvent(loginData)
    );
    ipcMain.handle(LOGOUT, async (_, userId: string) => await logoutEvent(userId));
    ipcMain.handle(HAS_USERS, async (_) => await hasUsersEvent());
    ipcMain.handle(CREATE_FIRST_USER, async (_, userData: ICreateFirstUser) => await createFirstUserEvent(userData));
    ipcMain.handle(CHANGE_PASSWORD, async (_, changePasswordData: IChangePassword) => await changePasswordEvent(changePasswordData));
    ipcMain.handle(UPDATE_PROFILE, async (_, userId: string, updateProfileData: IUpdateProfile) => await updateProfileEvent(userId, updateProfileData));
}

async function loginEvent(loginData: ILogin): Promise<IUser> {
    return await AuthService.login(loginData.email, loginData.password);
}

async function logoutEvent(userId: string) {
    return await AuthService.logout(userId);
}

async function hasUsersEvent(): Promise<boolean> {
    const hasUsers = await AuthService.hasUsers();
    return hasUsers;
}

async function createFirstUserEvent(userData: ICreateFirstUser) {
    return await AuthService.createFirstUser(userData.username, userData.email, userData.password);
}

async function changePasswordEvent(changePasswordData: IChangePassword) {
    return await AuthService.changePassword(changePasswordData.userId, changePasswordData.currentPassword, changePasswordData.newPassword);
}

async function updateProfileEvent(userId: string, updateProfileData: IUpdateProfile) {
    return await AuthService.updateProfile(userId, updateProfileData);
}


