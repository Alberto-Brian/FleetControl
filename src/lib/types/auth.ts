export interface ILogin {
    email: string;
    password: string;
}

export interface ICreateFirstUser {
    username: string;
    email: string;
    password: string;
}

export interface IChangePassword {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export interface IUpdateProfile {
    name?: string;
    email?: string;
    avatar?: string;
}
