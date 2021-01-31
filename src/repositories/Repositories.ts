import { ServiceRepository, SettingRepository } from ".";

export class Repositories {
    public service: ServiceRepository;
    public setting: SettingRepository;

    private static _current: Repositories = null;
    public static getCurrent = () => {
        if (Repositories._current === null) Repositories._current = new Repositories();
        return Repositories._current;
    }

    constructor() {
        this.service = new ServiceRepository();
        this.setting = new SettingRepository();
    }
}
