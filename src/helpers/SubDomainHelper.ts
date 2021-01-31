import got from 'got';

export class SubDomainHelper {

    static subDomains: any = {};
    static churchIds: any = {};

    public static async get(churchId: number) {
        let result = "";
        if (this.subDomains[churchId] !== undefined) result = this.subDomains[churchId];
        else {
            const apiUrl = process.env.ACCESS_MANAGEMENT_API;
            const url = apiUrl + "/churches/lookup/?id=" + churchId.toString();
            const json: any = await got.get(url).json();
            result = json.subDomain;
            this.subDomains[churchId] = result;
            this.churchIds[result] = churchId;
        }
        return result;
    }

    public static async getId(subDomain: string) {
        let result = 0;
        if (this.churchIds[subDomain] !== undefined) result = this.churchIds[subDomain];
        else {
            const apiUrl = process.env.ACCESS_MANAGEMENT_API;
            const url = apiUrl + "/churches/lookup/?subDomain=" + subDomain;
            const json: any = await got.get(url).json();
            result = parseInt(json.id, 0);
            this.subDomains[result] = subDomain;
            this.churchIds[subDomain] = result;
        }
        return result;
    }



}