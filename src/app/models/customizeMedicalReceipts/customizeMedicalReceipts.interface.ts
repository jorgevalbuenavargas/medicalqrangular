import { Guid } from "guid-typescript"

export interface CustomizeMedicalReceiptI {
    scanDate : Date;
    validationResult: string;
    pharmacyCompanyName: string;
    pharmacyBusinessName: string;
    doctorName: string;    
    applicationMessage: string;    
}