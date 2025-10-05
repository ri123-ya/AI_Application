import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 0,
    //top_p: 0.2, //either use this or temperature
    //stop: 'ga', // output will be Ne
    // max_completion_tokens: 1000,
    // max_tokens: '',
    // frequency_penalty:1,
    // presence_penalty:1,
    //response_format:{type: "json_object"},
    model: "llama-3.3-70b-versatile",
    messages: [
        {
            role:"system",
            content:"You smart personal assistant who answers the asked questions" ,
        },
      {
        role: "user",
        content: "When was iPhone 16 launched?",
      },
    ],
  });
  console.log(completion.choices[0].message.content);
}
main();
