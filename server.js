import express from "express";
import { generate } from "./bot.js";
import cors from "cors";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Welcome to Bot server");
})

app.post("/chat",async(req,res)=>{
     const { message, threadId } = req.body;
    

    if (!message || !threadId) {
        res.status(400).json({ message: 'All fields are required!' });
        return;
    }
    //console.log(message);

    const botMsg = await generate(message, threadId );

    res.json({message: botMsg});
})

app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
})