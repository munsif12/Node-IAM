import fs from "fs/promises"

const data = {
    users: [], groups: [], roles: [], permissions: []
};

const loadRBACDataInMemory = async () => {
    const paths = [
        fs.readFile("./IAM/Users.json"),
        fs.readFile("./IAM/Groups.json"),
        fs.readFile("./IAM/Roles.json"),
        fs.readFile("./IAM/Permissions.json")
    ];

    const [
        user, groups, roles, permissions
    ] = await Promise.all(paths);

    data.users = JSON.parse(user);
    data.groups = JSON.parse(groups);
    data.roles = JSON.parse(roles);
    data.permissions = JSON.parse(permissions);
}

export default data;
export { loadRBACDataInMemory }
