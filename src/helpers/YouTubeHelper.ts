import axios from 'axios'
import { Environment } from '.';

export class YouTubeHelper {

  public static async getSermon(sermonId: string) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2C+snippet&id=${sermonId}&key=${Environment.youTubeApiKey}`;
    const result = { title: "", thumbnail: "", description: "", duration: 0 }
    const json: any = (await axios.get(url)).data;
    if (json.items?.length > 0) {
      const snippet = json.items[0].snippet;
      const details = json.items[0].contentDetails;
      result.duration = this.parseDuration(details.duration);
      result.title = snippet.title;
      result.description = snippet.description;
      result.thumbnail = snippet.thumbnails?.maxres?.url || "";
    }
    return result;
  }

  private static parseDuration(duration: string) {
    let result = 0;
    const hours = parseInt(duration.split('T')[1].split('H')[0], 0);
    const minutes = parseInt(duration.split('H')[1].split('M')[0], 0);
    const seconds = parseInt(duration.split('M')[1].split('S')[0], 0);
    result = hours * 3600 + minutes * 60 + seconds;
    return result;
  }



}