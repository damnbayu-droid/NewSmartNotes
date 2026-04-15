import OpenAI from 'openai';

// Tool Definitions for the Neural Mesh
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "create_note",
            description: "Create a new note in the user's notebook.",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "The title of the note." },
                    content: { type: "string", description: "The body content of the note." },
                    folder: {
                        type: "string",
                        enum: ["Main", "Archive", "Research"],
                        description: "The cluster to place the note in."
                    }
                },
                required: ["title", "content"]
            }
        }
    }
];

export async function askAI(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    
    // In Next.js, we use environment variables for security
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
        return {
            role: 'assistant',
            content: "Neural link offline. OpenAI API Key is missing in the environment configuration.",
            refusal: null
        } as any;
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Allowed for prototype, ideally moved to API routes in Edge
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo", // Optimized for speed in neural hubs
            tools: tools,
            tool_choice: "auto",
        });

        return completion.choices[0].message;
    } catch (error: any) {
        console.error("Neural Sync Error:", error);
        return { role: 'assistant', content: `Sync Error: ${error.message}`, refusal: null } as any;
    }
}

/**
 * Formats raw intelligence (dictation) into structured nodes.
 */
export async function formatDictation(rawText: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return rawText;

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert transcription editor. Your job is to take raw, unpunctuated voice dictation text and format it perfectly with punctuation and structure. Preserve the original language and meaning exactly.`
                },
                { role: "user", content: rawText }
            ],
            temperature: 0.2,
        });

        return completion.choices[0]?.message?.content || rawText;
    } catch (error) {
        console.error("Neural Transcription Error:", error);
        return rawText;
    }
}
