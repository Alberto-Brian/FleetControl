//src/helpers/service-auth-helpers.ts
import { 
    ILogin,
    ICreateFirstUser,
    IChangePassword,
    IUpdateProfile,
 } from "@/lib/types/auth";
 import { IUser } from "@/lib/types/user";


export async function login(loginData: ILogin): Promise<IUser | null> {
    try {
        const result = await window._service_auth.login(loginData);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function logout(userId: string): Promise<string> {
    const result = await window._service_auth.logout(userId);

    return result as string;
}

export async function hasUsers(): Promise<boolean> {
    const result = await window._service_auth.hasUsers();
    return result;
}

export async function createFirstUser(userInfo: ICreateFirstUser) {
    const result = await window._service_auth.createFirstUser(userInfo);
    return result;
}

export async function changePassword(changePasswordData: IChangePassword) {
    const result = await window._service_auth.changePassword(changePasswordData);
    return result;
}

export async function updateProfile(userId: string, profileData: IUpdateProfile) {
    const result = await window._service_auth.updateProfile(userId, profileData);
    return result;
}