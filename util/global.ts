export const testPrefix = "test_";

export interface Config {
    [key: string]: {
        name: string;
        info: string;
        usage: string;
        example: string;
        available: string;
    }
}

export const Available = {
    None: "none",
    Public: "public",
    Private: "private"
};

export const Executer = {
    TagAll: "!",
    TagAdmins: "#",
    TagNonAdmins: "$",
    TagNone: "."
};

