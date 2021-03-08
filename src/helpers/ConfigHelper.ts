import { Setting, Service } from "../models";
import { Link } from "../apiBase/models"

export class ConfigHelper {

    static generateCss = (settings: Setting) => {
        return ":root { --primaryColor: " + settings.primaryColor + "; --contrastColor: " + settings.contrastColor + "; --headerColor: " + settings.primaryColor + " }"
    }

    static generateJson = (settings: Setting, tabs: Link[], links: Link[], services: Service[]) => {
        const result: any = {};
        result.churchId = settings.churchId;
        result.buttons = [];
        result.tabs = [];
        result.services = [];

        tabs.forEach(t => {
            result.tabs.push({ text: t.text, url: t.url, type: t.linkType, data: t.linkData, icon: t.icon });
        });

        links.forEach(l => {
            result.buttons.push({ text: l.text, url: l.url });
        });

        services.forEach(s => {
            result.services.push({
                videoUrl: s.videoUrl,
                serviceTime: s.serviceTime,
                duration: ConfigHelper.formatTime(s.duration),
                earlyStart: ConfigHelper.formatTime(s.earlyStart),
                chatBefore: ConfigHelper.formatTime(s.chatBefore),
                chatAfter: ConfigHelper.formatTime(s.chatAfter),
                provider: s.provider,
                providerKey: s.providerKey
            });
        });

        return result;
    }

    static formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds - (min * 60);
        return min.toString() + ":" + sec.toString().padStart(2, "0");
    }

}