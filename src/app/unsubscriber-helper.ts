import { Subject } from "rxjs";

export abstract class Unsubscriber {
    protected destroy$ = new Subject<void>();

    protected subClean(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}