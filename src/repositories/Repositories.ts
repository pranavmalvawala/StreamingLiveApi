import { ServiceRepository } from ".";

export class Repositories {
    public service: ServiceRepository;

    private static _current: Repositories = null;
    public static getCurrent = () => {
        if (Repositories._current === null) Repositories._current = new Repositories();
        return Repositories._current;
    }

    constructor() {
        this.service = new ServiceRepository();
    }
}
