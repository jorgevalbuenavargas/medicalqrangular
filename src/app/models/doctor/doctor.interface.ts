import { Guid } from "guid-typescript"

export interface DoctorI {
    id?: string;
    name: string;
    lastName: string;
    medicalLicense: string;
    Status: string;
    email: string;
}