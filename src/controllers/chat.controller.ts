import { Request, Response } from 'express';
import prisma from '../db';
import { generateReply, type LLMProvider } from '../services/llm.service';

export const handleChatMessage = async (req: Request, res: Response) => {
    const { message, sessionId, provider = 'groq' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required and must be a string.' });
    }

    // Validate provider
    const validProviders: LLMProvider[] = ['openai', 'groq'];
    const selectedProvider: LLMProvider = validProviders.includes(provider) ? provider : 'groq';

    try {
        let conversation;
        if (sessionId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: sessionId },
                include: { messages: { orderBy: { timestamp: 'asc' } } },
            });
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {},
                include: { messages: true },
            });
        }

        // Save user message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                sender: 'user',
                text: message,
            },
        });

        // Prepare history for LLM
        const history = conversation.messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text,
        }));

        // Generate AI reply with selected provider
        const reply = await generateReply(history, message, selectedProvider);

        // Save AI message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                sender: 'ai',
                text: reply,
            },
        });

        res.json({ reply, sessionId: conversation.id, provider: selectedProvider });
    } catch (error: any) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};

export const getChatHistory = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { timestamp: 'asc' } } },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found.' });
        }

        res.json({ messages: conversation.messages });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};

export const clearConversation = async (req: Request, res: Response) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required.' });
    }

    try {
        // Delete all messages for this conversation
        await prisma.message.deleteMany({
            where: { conversationId: sessionId },
        });

        res.json({ success: true, message: 'Conversation cleared.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};
