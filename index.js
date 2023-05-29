import mongoose from "mongoose";
import express from "express";

import data, { loadRBACDataInMemory } from "./loadInMemory.js";
import { RoleIds } from "./constants/index.js";
loadRBACDataInMemory();
const app = express();

const ENV = {
    PORT: 4000,
}

const getUserRoleAndPermissions = (userId) => {
    return (req, res, next) => {
        try {
            console.log(data.roles)
            const user = data.users.find(user => user.id === userId);

            if (!user) {
                throw new Error("User not found.")
            }
            if (!RoleIds.includes(user.role)) {
                throw new Error("Role not available.")
            }
            const userRole = data.roles.find(role => role.id === user.role)

            if (userRole.permissions <= 0) {
                throw new Error("you dont have any permissions attached to this role.")
            }

            const permissions = userRole.permissions.map(permId => {
                return data.permissions.find(per => per.id === permId);
            })
            const userPermissionsAndRoles = {
                ...user,
                ...userRole,
                permissions
            };;
            req.user = userPermissionsAndRoles;
            next();
        } catch (error) {
            next(error)
        }
    }
}

const validateUserRoleAndPermissions = (resourceName) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (user.permissions.some(permission => permission.resource !== resourceName)) {
                throw new Error("You dont have access to this resource.")
            }

            if (!user.permissions.some(permission => permission.actions.includes("GET"))) {
                throw new Error("You dont have permission to performe this action.")
            }
            next();
        } catch (error) {
            next(error)
        }
    }
}
// helloo
const dateDeployed = `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
app.get("/", (req, res) => {
    res.send(`Welcome to Stable IAM (${process.env.NODE_ENV})  LDA : ${dateDeployed} . Hello from worker: ${process.pid}`);
});

app.get("/data", (req, res) => {
    return res.status(200).json({
        data
    })
})

app.get("/role", getUserRoleAndPermissions("userId1"), validateUserRoleAndPermissions("accounts"), (req, res) => {
    try {
        // const user = getUserRoleAndPermissions("userId1");
        const user = req.user;
        return res.status(200).json({
            user
        })
    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: error.message
        })
    }
})

app.use((err, req, res, next) => {
    return res.status(err?.httpCode ?? 500).json({
        name: err.name || "Internal Server Error",
        status: err?.httpCode ?? 500,
        success: false,
        error: true,
        message: err?.message,
    });
});


app.listen(ENV.PORT, () => {
    console.log(`Stable IAM is running on port ${ENV.PORT}...`);
});
