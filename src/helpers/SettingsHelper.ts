import { Repositories } from "../repositories";
import { Setting, Service } from "../models";
import { ConfigHelper, AwsHelper } from "./"
import { LoggingHelper } from "../apiBase/helpers";
import { Repositories as BaseRepsoitories } from "../apiBase/repositories"
import { SubDomainHelper } from "../helpers";
import { Link } from "../apiBase/models";

export class SettingsHelper {

    public static async publish(churchId: string, repositories: Repositories, baseRepositories: BaseRepsoitories) {
        let settings: Setting = null;
        let tabs: Link[] = null;
        let links: Link[] = null;
        let services: Service[] = null;

        console.log("SUBDOMAIN");
        const subDomain = await SubDomainHelper.get(churchId);

        console.log("SAVING")
        let promises: Promise<any>[] = [];
        promises.push(repositories.setting.loadAll(churchId).then(d => settings = d[0]));
        promises.push(baseRepositories.link.loadByCategory(churchId, "tab").then(d => tabs = d));
        promises.push(baseRepositories.link.loadByCategory(churchId, "link").then(d => links = d));
        promises.push(repositories.service.loadAll(churchId).then(d => services = d));
        await Promise.all(promises);
        console.log("SAVED")

        if (process.env.STORAGE_LOCATION === "S3") {
            promises = [];
            promises.push(this.publishData(subDomain, settings, tabs, links, services));
            LoggingHelper.getCurrent().info(JSON.stringify(promises));
            await Promise.all(promises);
        }
        console.log("S3 Done")
    }


    private static publishData(subDomain: string, settings: Setting, tabs: Link[], links: Link[], services: Service[]): Promise<any> {
        // console.log("publishing");
        const result = ConfigHelper.generateJson(settings, tabs, links, services);
        const path = "data/" + subDomain + '/data.json';
        const buffer = Buffer.from(JSON.stringify(result), 'utf8');
        return AwsHelper.S3Upload(path, "application/json", buffer)
    }

}