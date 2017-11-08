export default class Git {
    private git : any;

    constructor(path : string) {
        this.git = require("simple-git")(path);
    }

    public filterBranchesRegex(pattern : RegExp) : Promise<any[]> {
        return new Promise<any[]>((resolveCb, errorCb) => {
            this.git.branch((error, summary) => {
                if (error) {
                    return errorCb(error);
                }

                return resolveCb(summary.all.filter(s => pattern.test(s)));
            })
        });
    }

    public filterBranches(pattern : string) : Promise<any[]> {
        return new Promise<any[]>((resolveCb, errorCb) => {
            this.git.branch((error, summary) => {
                if (error) {
                    return errorCb(error);
                }

                return resolveCb(summary.all.filter(s => s.indexOf(pattern) > -1));
            })
        });
    }

    public doesBranchExist(pattern : string) : Promise<boolean> {
        return new Promise<boolean>((resolveCb, errorCb) => {
            this.git.branch((error, summary) => {
                if (error) {
                    return errorCb(error);
                }

                return resolveCb(summary.all.some(s => s == pattern));
            })
        });
    }

    public createBranchAndCheckout(branch : string, parent : string) : Promise<void> {
        return new Promise<void>((resolveCb, errorCb) => {
            this.git.checkoutBranch(branch, parent, (error) => {
                if (error) {
                    return errorCb(error);
                }

                return resolveCb();
            });
        });
    }

    public checkout(branch : string) : Promise<void> {
        return new Promise<void>((resolveCb, errorCb) => {
            this.git.checkout(branch, (error) => {
                if (error) {
                    return errorCb(error);
                }

                return resolveCb();
            });
        });
    }
}