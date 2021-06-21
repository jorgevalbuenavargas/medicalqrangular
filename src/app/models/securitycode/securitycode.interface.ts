import { Guid } from "guid-typescript"

export interface SecurityCodeI {
    id?: string;
    securityNumber: string;
    expirationDate: Date;
    doctorId: string;
}