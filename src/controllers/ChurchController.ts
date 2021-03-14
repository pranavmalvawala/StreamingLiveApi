import { controller, httpPost } from "inversify-express-utils";
import express from "express";
import { Service } from "../models";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Link } from "../apiBase/models"

@controller("/churches")
export class ChurchController extends StreamingLiveBaseController {

    @httpPost("/init")
    public async init(req: express.Request<{}, {}, {}>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
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

            const service: Service = {
                churchId: au.churchId, serviceTime: new Date(), earlyStart: 600, duration: 3600, chatBefore: 600, chatAfter: 600,
                provider: "youtube_watchparty", providerKey: "zFOfmAHFKNw",
                videoUrl: "https://www.youtube.com/embed/zFOfmAHFKNw?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1",
                timezoneOffset: 300, recurring: false, label: 'Sunday Service'
            };
            promises.push(this.repositories.service.save(service))

            await Promise.all(promises);

            return {};

        });
    }


}


