import { ValidatedLicense } from "@/lib/types/licence";

export async function validateLicense(licence: string): Promise<ValidatedLicense> {
    const result = await window.license.validateLicense(licence);
    return result;
}
export async function checkExistingLicense(): Promise<ValidatedLicense>  {
    const result = await window.license.checkExistingLicense();
    return result;
}
export async function getMachineId(): Promise<string> {
    const machineId = await window.license.getMachineId();
    return machineId;
}
export async function removeLicense(): Promise<void> {
     await window.license.removeLicense();
}
