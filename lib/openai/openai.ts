import OpenAI from "openai";

const openaiclient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export default openaiclient;
