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

export enum __GroupMemberRole {
    CREATOR = 'CREATOR',
    CONTROLLER = 'CONTROLLER',
    MEMBER = 'MEMBER',
}
export interface __EditMemberBody {
    id: string;
    role?: __GroupMemberRole;
}

export interface __UpdateGroupBody {
    id: string;
    name?: string;
    description?: string;
    members?: string[];
}
