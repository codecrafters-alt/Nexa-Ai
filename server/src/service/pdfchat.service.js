import "dotenv/config";

// 🔥 LLM
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// 🔥 Loader
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// 🔥 Splitter
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 🔥 Embeddings
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// 🔥 Prompt
import { PromptTemplate } from "@langchain/core/prompts";

// 🔥 Output parser
import { StringOutputParser } from "@langchain/core/output_parsers";

// 🔥 Pinecone
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "../config/pinecone.js";

// ==============================
// 🔥 EMBEDDINGS
// ==============================
const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2",
  apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
});

// ==============================
// 🔥 PROCESS PDF
// ==============================
export const processPdf = async (chatId, filePath) => {
  try {
    // 🔹 Load PDF
    const loader = new PDFLoader(filePath);

    const docs = await loader.load();

    // 🔹 Split PDF into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(docs);

    // 🔹 Add metadata
    const docsWithMetadata = chunks.map((doc) => ({
      ...doc,
      metadata: {
        chatId,
      },
    }));

    // 🔹 Store in Pinecone
    await PineconeStore.fromDocuments(docsWithMetadata, embeddings, {
      pineconeIndex,
    });

    return {
      success: true,
      message: "PDF processed successfully",
    };
  } catch (error) {
    console.error("PDF Processing Error:", error);

    throw error;
  }
};

// ==============================
// 🔥 GET ANSWER
// ==============================
export const getPdfAnswer = async (chatId, question) => {
  try {
    // 🔹 Gemini Model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3-flash-preview",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.2,
    });

    // 🔹 Connect existing Pinecone index
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    // 🔥 Retriever with MMR
    const retriever = vectorStore.asRetriever({
      searchType: "mmr",

      k: 6,

      searchKwargs: {
        fetchK: 20,
        lambda: 0.5,
      },

      filter: {
        chatId,
      },
    });

    // 🔹 Retrieve relevant documents
    const relevantDocs = await retriever.invoke(question);

    // 🔹 Build context
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    // 🔹 Prompt
    const prompt = PromptTemplate.fromTemplate(`
You are an intelligent AI assistant.

Answer the user's question using ONLY the provided context.

IMPORTANT RULES:
- Speak directly to the user using "you" and "your"
- NEVER refer to the user in third person like:
  "He", "She", "Anik", "The candidate"
- Do NOT make up information
- Do NOT use knowledge outside the context
- If the answer is not present in the context, say:
  "I don't know."

RESPONSE GUIDELINES:
- Give clear, human-like responses
- Keep answers concise but informative
- Organize information into logical categories when helpful
- Combine information from multiple context sections if needed
- Explain concepts briefly and clearly
- Do NOT dump raw text from the context
- Avoid unnecessary repetition
- Do NOT use markdown formatting like **, ##, or bullet symbols unless necessary
- Return clean plain-text responses
- Do NOT include "\\n" in the response
- Format the response naturally like a real conversation

---------------------
Context:
{context}
---------------------

Question:
{question}

Answer:
`);

    // 🔹 Parser
    const parser = new StringOutputParser();

    // 🔹 Chain
    const chain = prompt.pipe(model).pipe(parser);

    // 🔹 Invoke chain
    const result = await chain.invoke({
      context,
      question,
    });

    return result;
  } catch (error) {
    console.error("PDF Answer Error:", error);

    return "Error processing PDF question";
  }
};
