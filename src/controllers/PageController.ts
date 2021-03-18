import { httpGet, requestParam, controller, httpPost } from "inversify-express-utils";
import express from "express";
import { SubDomainHelper } from "../helpers"
import { Page, File } from "../apiBase/models";
import { PageController as BasePageController } from "../apiBase/controllers";

@controller("/pages")
export class PageControllerExtended extends BasePageController {

    @httpPost("/write")
    public async writeToDisk(req: express.Request<{}, {}, Page>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            const page: Page = req.body;
            if (page.content !== undefined) {
                const subDomain = await SubDomainHelper.get(au.churchId);
                const wrappedContent = this.wrapContent(subDomain, page.content);
                // const tempBase64 = Buffer.from(wrappedContent, 'binary').toString('base64');
                const fileId = page?.path?.split('/')[2];
                const newFile: File = { id: fileId, churchId: au.churchId, type: "text/html", content: wrappedContent }
                await this.baseRepositories.file.save(newFile).then(file => page.path = "/files/pages/" + file.id);
            }
            return page;

        });
    }

    private wrapContent(keyName: string, content: string) {
        const cssLink = "<link href=\"/data/" + keyName + "/data.css\" rel=\"stylesheet\" /><link href=\"/css/page.css\" rel=\"stylesheet\" />";
        return "<html><head>" + cssLink + "</head><body>" + content + "</body></html>";
    }

}


