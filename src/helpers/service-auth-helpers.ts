//src/helpers/service-auth-helpers.ts
import { 
    ILogin,
    ICreateFirstUser,
    IChangePassword,
    IUpdateProfile,
 } from "@/lib/types/auth";
import { IUser } from "@/lib/types/user";
import { getIpcErrorKey } from "@/helpers/error-helpers";


export async function login(loginData: ILogin): Promise<IUser | null> {
    try {
        const result = await window._service_auth.login(loginData);
        return result;
    } catch (error) {
        const key = getIpcErrorKey(error, 'auth:errors.loginFailed');
        throw new Error(key);
    }
}

export async function logout(userId: string): Promise<string> {
    const result = await window._service_auth.logout(userId);

    return result as string;
}

export async function logoutAllUsers(): Promise<void> {
    await window._service_auth.logoutAllUsers();
}

export async function hasUsers(): Promise<boolean> {
    const result = await window._service_auth.hasUsers();
    return result;
}

export async function createFirstUser(userInfo: ICreateFirstUser) {
    try {
        const result = await window._service_auth.createFirstUser(userInfo);
        return result;
    } catch (error) {
        const key = getIpcErrorKey(error, 'auth:errors.userAlreadyExists');
        throw new Error(key);
    }
}

export async function changePassword(changePasswordData: IChangePassword) {
    try {
        const result = await window._service_auth.changePassword(changePasswordData);
        return result;
    } catch (error) {
        const key = getIpcErrorKey(error, 'auth:errors.wrongCurrentPassword');
        throw new Error(key);
    }
}

export async function updateProfile(userId: string, profileData: IUpdateProfile) {
    const result = await window._service_auth.updateProfile(userId, profileData);
    return result;
}
