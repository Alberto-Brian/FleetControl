//src/helpers/services/auth/auth-service-listeners.ts
import { AuthService } from '@/lib/services/auth.service';
import { ipcMain } from "electron";
import { 
    LOGIN, 
    LOGOUT, 
    LOGOUT_ALL_USERS,
    HAS_USERS, 
    CREATE_FIRST_USER, 
    CHANGE_PASSWORD, 
    UPDATE_PROFILE
 } from "./auth-service-channels";

import { IUser } from "@/lib/types/user";
import { ILogin, ICreateFirstUser, IChangePassword, IUpdateProfile } from "@/lib/types/auth";
import { and, eq, isNull } from 'drizzle-orm';

export function addServiceAuthEventListeners() {
    ipcMain.handle(
        LOGIN,
        async (_, loginData: ILogin) => await loginEvent(loginData)
    );
    ipcMain.handle(LOGOUT, async (_, userId: string) => await logoutEvent(userId));
    ipcMain.handle(LOGOUT_ALL_USERS, async (_) => await logoutAllUsersEvent());
    ipcMain.handle(HAS_USERS, async (_) => await hasUsersEvent());
    ipcMain.handle(CREATE_FIRST_USER, async (_, userData: ICreateFirstUser) => await createFirstUserEvent(userData));
    ipcMain.handle(CHANGE_PASSWORD, async (_, changePasswordData: IChangePassword) => await changePasswordEvent(changePasswordData));
    ipcMain.handle(UPDATE_PROFILE, async (_, userId: string, updateProfileData: IUpdateProfile) => await updateProfileEvent(userId, updateProfileData));
}

async function loginEvent(loginData: ILogin): Promise<IUser> {
    const user = await AuthService.findUserByEmail(loginData.email);
    if (!user) {
        throw new Error('auth:errors.userNotFound');
    }
    const isPasswordValid = await AuthService.verifyPassword(loginData.password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('auth:errors.invalidPassword');
    }
    if (!AuthService.isUserActive(user)) {
        throw new Error('auth:errors.userInactive');
    }
    return await AuthService.finishLogin(user.id);
}

async function logoutEvent(userId: string) {
    return await AuthService.logout(userId);
}

async function logoutAllUsersEvent() {
    return await AuthService.logoutAllUsers();
}

async function hasUsersEvent(): Promise<boolean> {
    const hasUsers = await AuthService.hasUsers();
    return hasUsers;
}

async function createFirstUserEvent(userData: ICreateFirstUser) {
    const exists = await AuthService.hasUsers();
    if (exists) {
        throw new Error('auth:errors.userAlreadyExists');
    }
    return await AuthService.createFirstUser(userData.username, userData.email, userData.password);
}

async function changePasswordEvent(changePasswordData: IChangePassword) {
    const user = await AuthService.findUserById(changePasswordData.userId);
    if (!user) {
        throw new Error('auth:errors.userNotFound');
    }
    const ok = await AuthService.verifyPassword(changePasswordData.currentPassword, user.password_hash);
    if (!ok) {
        throw new Error('auth:errors.wrongCurrentPassword');
    }
    return await AuthService.changePassword(changePasswordData.userId, changePasswordData.newPassword);
}

async function updateProfileEvent(userId: string, updateProfileData: IUpdateProfile) {
    return await AuthService.updateProfile(userId, updateProfileData);
}


