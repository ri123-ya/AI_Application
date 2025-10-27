import readline from "node:readline/promises";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

dotenv.config();

const tvly = tavily({ apiKey: process.env.TRAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); //delete the entry after 24hrs

export async function generate(userMsg, threadId) {
  const baseMessages = [
    {
      role: "system",
      content: `You are a smart personal assistant.
                    If you know the answer to a question, answer it directly in plain English.
                    If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
                    You have access to the following tool:
                    webSearch(query: string): Use this to search the internet for current or unknown information.
                    Decide when to use your own knowledge and when to use the tool.
                    Do not mention the tool unless needed.

                    Examples:
                    Q: What is the capital of France?
                    A: The capital of France is Paris.

                    Q: What’s the weather in Mumbai right now?
                    A: (use the search tool to find the latest weather)

                    Q: Who is the Prime Minister of India?
                    A: The current Prime Minister of India is Narendra Modi.

                    Q: Tell me the latest IT news.
                    A: (use the search tool to get the latest news)

                    current date and time: ${new Date().toUTCString()}`,
    },
    // {
    //   role: "user",
    //   content: "What is the current weather in Indore?",
    //   //"When was iPhone 16 launched?"
    // },
  ];

  const messages = myCache.get(threadId) ?? baseMessages;

  messages.push({
    role: "user",
    content: userMsg,
  });

  //for LLM to call tools multiple times if needed
  const MAX_RETRIES = 10;//to stop infinte loop of calling tools 
  let count = 0;

  while (true) {
    if (count > MAX_RETRIES) {
      return "I cannot find the answer. Can you please try again";
    }
    count++;
    const completion = await groq.chat.completions.create({
      temperature: 0,
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "websearch",
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

    messages.push(completion.choices[0].message);
    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      myCache.set(threadId, messages); //storing the history in cache
      console.log(myCache);
      return completion.choices[0].message.content; //return the final ans to user
    }

    for (const tool of toolCalls) {
      //console.log("Tool Name: ", tool);
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;

      if (functionName === "websearch") {
        const toolResult = await webSearch(JSON.parse(functionArgs));
        //console.log("Tool result: ", toolResult);

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
}

async function webSearch({ query }) {
  //use Travily Api to search the web

  console.log("Searching the Web.....");
  const response = await tvly.search(query);

  //console.log("Response : ", response);

  const final = response.results.map((item) => item.content).join("\n\n");

  //console.log("Final Answer : ", final);

  return final;
}
