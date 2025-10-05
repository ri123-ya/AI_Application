import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 1,
    //top_p: 0.2, //either use this or temperature
    //stop: 'ga', // output will be Ne
    // max_completion_tokens: 1000,
    // max_tokens: '',
    // frequency_penalty:1,
    // presence_penalty:1,
    model: "llama-3.3-70b-versatile",
    messages: [
        {
            role:"system",
            content:`You are Dhriya, a smart review grader. Your task is to analyse given review and return sentiment. Classify the review as positive,neutral,negative. give the  output in json format
            example : 
            {"sentiment": "Positive"}` ,
        },
      {
        role: "user",
        content: "Review: These headphones arrived on time and look great, but the left earcup stopped working after a week.",
      },
    ],
  });
  console.log(completion.choices[0].message.content);
}
main();
