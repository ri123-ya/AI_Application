import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";

dotenv.config();

const tvly = tavily({ apiKey: process.env.TRAVILY_API_KEY });
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
        role: "system",
        content: `You smart personal assistant who answers the asked questions
                   You have following tools:
                   1. get_search({query} : {query: string}) //Search the correct  latest information from the web`,
      },
      {
        role: "user",
        content: "When was iPhone 16 launched?",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_search",
          description: "Search the correct  latest information from the web",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The Search query to perform Search on",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const toolCalls = completion.choices[0].message.tool_calls;

  if (!toolCalls) {
    console.log(`Assistant: ${completion.choices[0].message.content}`);
    return;
  }

  for (const tool of toolCalls) {
    console.log("Tool Name: ", tool);
    const functionName = tool.function.name;
    const functionArgs = tool.function.arguments;

    if (functionName === "get_search") {
      const toolResult = await webSearch(JSON.parse(functionArgs));
      console.log("Tool result: ", toolResult);
    }
  }

  //console.log(JSON.stringify(completion.choices[0].message.content,null,2));
}
main();

async function webSearch({ query }) {
  //use Travily Api to search the web

  console.log("Searching the Web.....");
  const response = await tvly.search(query);

  console.log("Response : ",response);

  return "Iphone was Launched on 17th May 2002";
}
