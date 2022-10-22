import { Sermon, Service } from "../models";
import { Link } from "../apiBase/models"
import { ArrayHelper } from "../apiBase";

export class ConfigHelper {

  static generateJson = (churchId: string, tabs: Link[], links: Link[], services: Service[], sermons: Sermon[]) => {
    const result: any = {};
    result.churchId = churchId;
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
        providerKey: s.providerKey,
        sermon: this.getSermon(s.sermonId, sermons)
      });
    });

    return result;
  }

  static getSermon = (sermonId: string, sermons: Sermon[]) => {
    let result = ArrayHelper.getOne(sermons, "id", sermonId);
    if (!result && sermons.length > 0) result = sermons[0];
    return result;
  }

  static formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds - (min * 60);
    return min.toString() + ":" + sec.toString().padStart(2, "0");
  }

}