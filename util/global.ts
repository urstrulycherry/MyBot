import { TEST_FLAG } from "../conf";

export const testPrefix = "test_";

export const isTest = process.argv[2] === TEST_FLAG;

export interface Config {
    [key: string]: {
        name: string;
        info: string;
        usage: string;
        example: string;
        available: string;
    }
}
export interface Settings {
    [key: string]: string | string[]
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

export const Status = {
    public: "public",
    admin: "admin",
    restricted: "restricted",
    private: "private",
    none: "none"
};
