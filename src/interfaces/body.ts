export interface __SignupBody {
    email: string;
    password: string;
    name: string;
}

export interface __LoginBody {
    email: string;
    password: string;
}

export interface __CreateGroupBody {
    id: string;
    name: string;
    description?: string;
}
