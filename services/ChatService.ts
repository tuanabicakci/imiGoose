import { ChatMessage } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const RESPONSES: Record<string, string> = {
    default: "I'm imi, your immigration assistant! I can help you understand CRS scores, immigration pathways, and document requirements. What would you like to know?",
    crs: "The Comprehensive Ranking System (CRS) is a points-based system used to assess and score profiles of candidates in the Express Entry pool. It considers factors like age, education, work experience, and language proficiency. Scores generally range from 400–500 for draws.",
    improve: "To improve your CRS score you can: 1) Improve your IELTS/CELPIP scores, 2) Gain Canadian work experience, 3) Get a provincial nomination (+600 points!), 4) Get a job offer, or 5) Upgrade your education credentials.",
    pnp: "The Provincial Nominee Program (PNP) allows Canadian provinces and territories to nominate immigrants who wish to settle there. A provincial nomination gives you an additional 600 CRS points, virtually guaranteeing an ITA in the next Express Entry draw.",
    ielts: "Both IELTS and CELPIP are accepted for Express Entry. IELTS is more widely available globally, while CELPIP is only available in Canada. Many test-takers find CELPIP slightly easier since it's computer-based and uses more casual Canadian English.",
    pool: "The Express Entry pool contains candidates who have submitted profiles and meet the minimum criteria. Draws happen roughly every 2 weeks. The IRCC invites the highest-scoring candidates (above the cutoff) to apply for permanent residence via an Invitation to Apply (ITA).",
};

function getResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('crs') || lower.includes('score') || lower.includes('points')) return RESPONSES.crs;
    if (lower.includes('improve') || lower.includes('increase') || lower.includes('higher')) return RESPONSES.improve;
    if (lower.includes('pnp') || lower.includes('provincial')) return RESPONSES.pnp;
    if (lower.includes('ielts') || lower.includes('celpip') || lower.includes('language')) return RESPONSES.ielts;
    if (lower.includes('pool') || lower.includes('express entry') || lower.includes('ita')) return RESPONSES.pool;
    return RESPONSES.default;
}

export const ChatService = {
    async sendMessage(messages: ChatMessage[], userMessage: string): Promise<ChatMessage> {
        await delay(1200 + Math.random() * 800);
        return {
            id: `msg-${Date.now()}`,
            content: getResponse(userMessage),
            isFromUser: false,
            timestamp: new Date(),
        };
    },
};
