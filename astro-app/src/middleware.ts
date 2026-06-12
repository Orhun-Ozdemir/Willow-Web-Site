import { defineMiddleware } from "astro:middleware";
import crypto from "node:crypto";
import { getServiceClient, hasSupabaseEnv } from "./lib/supabase";

const aiBots = [
  { name: "GPTBot (OpenAI Training)", pattern: /GPTBot/i },
  { name: "OAI-SearchBot (OpenAI Search)", pattern: /OAI-SearchBot/i },
  { name: "ChatGPT-User (OpenAI User)", pattern: /ChatGPT-User/i },
  { name: "ClaudeBot (Anthropic Training)", pattern: /ClaudeBot/i },
  { name: "Claude-Web (Anthropic User)", pattern: /Claude-Web|Claude-SearchBot/i },
  { name: "Google-Extended (Google Gemini)", pattern: /Google-Extended/i },
  { name: "Applebot-Extended (Apple Intelligence)", pattern: /Applebot-Extended/i },
  { name: "PerplexityBot (Perplexity)", pattern: /PerplexityBot/i },
  { name: "Meta-ExternalAgent (Meta Llama)", pattern: /Meta-ExternalAgent/i },
  { name: "Bytespider (ByteDance)", pattern: /Bytespider/i },
  { name: "CCBot (Common Crawl)", pattern: /CCBot/i },
  { name: "cohere-ai (Cohere)", pattern: /cohere-ai/i },
  { name: "Amazonbot (Amazon)", pattern: /Amazonbot/i }
];

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (hasSupabaseEnv) {
    const userAgent = context.request.headers.get("user-agent") || "";
    if (userAgent) {
      const matchedBot = aiBots.find(bot => bot.pattern.test(userAgent));
      if (matchedBot) {
        try {
          const supabase = getServiceClient();
          
          let ipHint = getClientIp(context.request);
          try {
            ipHint = ipHint || context.clientAddress || "";
          } catch {
            // clientAddress is not available on all adapters
          }
          
          const newEvent = {
            id: crypto.randomUUID(),
            bot_name: matchedBot.name,
            path: new URL(context.request.url).pathname,
            user_agent: userAgent.slice(0, 250),
            ip_hint: ipHint.replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.x"),
            created_at: new Date().toISOString()
          };
          
          // Fire and forget
          supabase.from("bot_events").insert(newEvent).then(({ error }) => {
            if (error) console.error("Failed to log bot access to Supabase:", error.message);
          });
        } catch (err) {
          console.error("Failed to setup bot access logging", err);
        }
      }
    }
  }

  return next();
});
