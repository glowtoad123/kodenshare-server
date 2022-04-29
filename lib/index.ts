/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express"
import process from 'process'
import * as dotenv from "dotenv/config"
import {Server} from "socket.io"
import httpServer from "http"



const app = express()
const server = httpServer.createServer()
const io = new Server(server, {
    cors: {
        origin: ["https://kodenshare.vercel.app", "http://localhost:3000"]
    }
})



io.on("connection", (socket) => {
    const problemMap: object | any = {
    }

    socket.on("start", (msg) => {
        const problemId = msg.problemId
        Object.values(problemMap[problemId]).map((theUser: any | object) => {
            theUser.decision = "begun"
        })
    })

    socket.on("admit", (msg) => {
        const problemId = msg.problemId
        const user = msg.user
        problemMap[problemId][user] = {
            problemId: "",
            user: user,
            answer: "",
            typingToggle: false,
            decision: "begun",
            isAdmin: false
        }
        io.emit(`admit/${user}`, problemMap[problemId][user])
    })

    socket.on("reject", (msg) => {
        const problemId = msg.problemId
        const user = msg.user
        problemMap[problemId][user] = {
            problemId: "",
            user: user,
            answer: "",
            typingToggle: false,
            decision: "rejected",
            isAdmin: false
        }
        io.emit(`admit/${user}`, problemMap[problemId][user])
    })
    
    socket.on(`answer`, (msg) => {
        const problemId: string = msg.problemId
        const user: string = msg.user
        const answer: string = msg.answer
        const typingToggle: boolean = msg.typingToggle
        const decision: string = msg.decision
        const isAdmin: boolean = msg.isAdmin
    
        const userInfo = {
            problemId: problemId,
            user: user,
            answer: answer,
            typingToggle: typingToggle,
            decision: decision,
            isAdmin: isAdmin
        }
    
        problemMap[problemId][user] = userInfo
        io.emit(`problems/${problemId}`, problemMap[problemId])
        })

    socket.on("decide", (msg) => {
        const problemId: string = msg.problemId
        const user: string = msg.user
        const decision: boolean = msg.decision

        const problem = problemMap[problemId][user]
        problem.decision = decision
        problemMap[problemId][user] = problem

        io.emit(`problems/${problemId}/participants/${user}`, problemMap[problemId][user])
    })

    socket.on("typingToggle", (msg) => {
        const problemId: string = msg.problemId
        const user: string = msg.user
        const typingToggle: boolean = msg.typingToggle

        const problem = problemMap[problemId][user]
        problem.typingToggle = typingToggle
        problemMap[problemId][user] = problem

        io.emit(`problems/${problemId}/participants/${user}`, problemMap[problemId][user])
    })

    socket.on("giveAdmin", (msg) => {
        const problemId: string = msg.problemId
        const user: string = msg.user
        const isAdmin: boolean = msg.isAdmin

        const problem = problemMap[problemId][user]
        problem.isAdmin = isAdmin
        problemMap[problemId][user] = problem

        io.emit(`problems/${problemId}/participants/${user}`, problemMap[problemId][user])
    })
})






const port = process.env.PORT || 3000

app.listen(port, () => console.log("listening on port 3000"))

