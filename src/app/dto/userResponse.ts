import { Authority } from "./authority";

export interface UserResponse{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    authorities: Authority;
}