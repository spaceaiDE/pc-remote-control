const express = require("express")
const path = require("path")
const fs = require("fs")
const childprocess = require("child_process")
const robot = require("robotjs")

const application = express()

application.use(express.json())
application.use(express.urlencoded({
    extended: false
}))

String.prototype.replaceAll = function(old, newRep) {
    var string = this
    while(string.includes(old)) {
        string = string.replace(old, newRep)
    }
    return string
}

const whitelist = new Array()

application.use("/", express.static(path.join(__dirname, "public")))

application.get("/", (request, response) => {
    const {ip} = request
    if(!whitelist.includes(ip)) {
        response.sendFile(path.join(__dirname, "page", "login.html"))
        return
    }
    response.sendFile(path.join(__dirname, "page", "index.html"))
})

application.post("/login", (req,res) => {
    if(!req.body) {
        res.json({
            error: "No content provided"
        })
        return
    }
    const {pass} = req.body
    if(!pass) {
        res.json({
            error: "No password provided"
        })
        return
    }
    if(pass == "17Leon04") {
        whitelist.push(req.ip)
        res.json({
            success: true
        })
    } else {
        res.json({
            error: "Password is incorrect"
        })
    }
})

application.post("/command", (request, response) => {
    const {ip} = request
    if(!whitelist.includes(ip)) {
        response.json({
            error: "You're not allowed to do that"
        })
        return
    }
    if(!request.body) return
    if(!request.body.command) return
    const {command} = request.body

    switch(command.toLowerCase()) {
        case "shutdown": {
            response.json({
                success: true
            })
            childprocess.execSync("shutdown /s")
            break;
        }
        case "login": {
            response.json({
                success: true
            })
            ;(async () => {
                async function sleep(ms) {
                    return new Promise(res => setTimeout(res, ms))
                }
                const {height, width} = robot.getScreenSize()

                robot.moveMouseSmooth(Math.floor(Math.random()*width), Math.floor(Math.random()*height), 1)
            })()
            break;
        }
        case "openapp": {
            if(!request.body.app_name) {
                response.json({
                    error: "No app_name provided"
                })
                return
            }
            const {app_name} = request.body
            childprocess.execSync(`start ${app_name}`)
            break;
        }
        case "closeapp": {
            if(!request.body.app_name) {
                response.json({
                    error: "No app_name provided"
                })
                return
            }
            const {app_name} = request.body
            childprocess.execSync(`taskkill /F /IM ${app_name}.exe`)
            break;
        }
    }

})

application.listen(9090, () => {
    console.log("Web Server started at port 9090")
})