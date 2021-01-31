import { controller, httpPost } from "inversify-express-utils";
import express from "express";
import { Setting, Service } from "../models";
import { SettingsHelper } from "../helpers";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Link } from "../apiBase/models"

@controller("/churches")
export class ChurchController extends StreamingLiveBaseController {

    async validateInit(churchId: number) {
        const errors = [];
        const setting = await this.repositories.setting.loadByChurchId(churchId);
        if (setting !== null) errors.push("Church already initialized");
        return errors;
    }

    @httpPost("/init")
    public async init(req: express.Request<{}, {}, {}>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {

            const errors = await this.validateInit(au.churchId);
            if (errors.length > 0) return this.denyAccess(errors);
            else {

                const promises: Promise<any>[] = [];

                const links: Link[] = [];
                links.push({ churchId: au.churchId, url: "about:blank", text: "Resources", sort: 1, category: "link", icon: "", linkData: "", linkType: "url" });
                links.push({ churchId: au.churchId, url: "about:blank", text: "Give", sort: 2, category: "link", icon: "", linkData: "", linkType: "url" });
                links.forEach(l => promises.push(this.baseRepositories.link.save(l)));

                const tabs: Link[] = [];
                tabs.push({ churchId: au.churchId, url: "", text: "Chat", sort: 1, icon: "far fa-comment", linkType: "chat", linkData: "", category: "tab" });
                tabs.push({ churchId: au.churchId, url: "https://www.bible.com/en-GB/bible/111/GEN.1.NIV", text: "Bible", sort: 2, icon: "fas fa-bible", linkType: "url", linkData: "", category: "tab" });
                tabs.push({ churchId: au.churchId, url: "", text: "Prayer", sort: 3, icon: "fas fa-praying-hands", linkType: "prayer", linkData: "", category: "tab" });
                tabs.forEach(t => promises.push(this.baseRepositories.link.save(t)));

                const setting: Setting = { churchId: au.churchId, homePageUrl: "https://livecs.org", logoUrl: "/images/default-site-logo.png", primaryColor: "#24B9FF", contrastColor: "#FFFFF;", registrationDate: new Date() };
                promises.push(this.repositories.setting.save(setting))

                const service: Service = {
                    churchId: au.churchId, serviceTime: new Date(), earlyStart: 600, duration: 3600, chatBefore: 600, chatAfter: 600,
                    provider: "youtube_watchparty", providerKey: "zFOfmAHFKNw",
                    videoUrl: "https://www.youtube.com/embed/zFOfmAHFKNw?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1",
                    timezoneOffset: 300, recurring: false, label: 'Sunday Service'
                };
                promises.push(this.repositories.service.save(service))

                await Promise.all(promises);

                await SettingsHelper.publish(au.churchId, this.repositories, this.baseRepositories);
                return {};
            }

        });
    }


}


