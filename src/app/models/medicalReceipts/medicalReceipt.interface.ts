import { Guid } from "guid-typescript"

export interface MedicalReceiptI {
    id?: string;
    scanDate : Date;
    validationResult: string;
    pharmacyId: string;
    uicId: string;
    securityCodeId: string;
    applicationMessage: string;
    
}