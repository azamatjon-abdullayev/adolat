import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";


// ========================================
// GEMINI API
// ========================================

if (!process.env.GEMINI_API_KEY) {

    console.error(
        "❌ GEMINI_API_KEY topilmadi!"
    );

    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    express.json({
        limit: "1mb"
    })
);


app.use(
    cors({
        origin: true,

        methods: [
            "GET",
            "POST",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type"
        ]
    })
);


// ========================================
// RATE LIMIT
// ========================================

const aiLimiter = rateLimit({

    windowMs: 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,

        error:
            "Juda ko‘p so‘rov yuborildi. " +
            "Birozdan keyin urinib ko‘ring."
    }

});


// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {

    res.json({

        name:
            "Adolat 2.0 Gemini API",

        status:
            "online",

        version:
            "2.0.0",

        ai:
            "Google Gemini",

        model:
            GEMINI_MODEL

    });

});


// ========================================
// HEALTH
// ========================================

app.get("/health", (req, res) => {

    res.json({

        status:
            "ok",

        ai:
            "connected",

        provider:
            "Google Gemini",

        model:
            GEMINI_MODEL

    });

});


// ========================================
// SYSTEM PROMPT
// ========================================

const SYSTEM_PROMPT = `

Siz "Adolat 2.0" platformasining
huquqiy AI yordamchisisiz.

Siz O‘zbekiston Respublikasi qonunchiligi
bo‘yicha foydalanuvchilarga tushunarli
tilda huquqiy ma'lumot berishga harakat qilasiz.

MUHIM QOIDALAR:

1. Foydalanuvchiga o‘zbek tilida javob bering.

2. Javobni sodda va tushunarli yozing.

3. Aniq bilmagan huquqiy ma'lumotni
   fakt sifatida aytmang.

4. Qonun yoki modda raqamini bilmasangiz,
   uni o‘ylab topmang.

5. O‘zingizni advokat deb tanishtirmang.

6. Zarur bo‘lsa foydalanuvchiga advokat,
   sud yoki tegishli davlat organiga
   murojaat qilishni tavsiya qiling.

7. Javobni imkon qadar quyidagi shaklda bering:

Qisqa javob:
...

Huquqiy asos:
...

Nima qilish mumkin:
1. ...
2. ...
3. ...

Muhim:
...

8. Agar foydalanuvchi aniq qonun yoki
   modda haqida so‘rasa va ishonchli
   ma'lumot bo‘lmasa, modda raqamini
   taxmin qilmang.

9. Keraksiz shaxsiy ma'lumotlarni
   so‘ramang.

10. Jinoyat, zo‘ravonlik, katta moliyaviy
    zarar yoki boshqa jiddiy holatlarda
    tegishli mutaxassis yoki vakolatli
    tashkilotga murojaat qilishni tavsiya qiling.

11. Javoblar umumiy va tavsiyaviy
    huquqiy ma'lumot ekanini kerak
    bo‘lganda eslatib o‘ting.

`;


// ========================================
// AI CHAT
// ========================================

app.post(
    "/api/chat",
    aiLimiter,
    async (req, res) => {

        try {

            const {
                message,
                history = []
            } = req.body;


            // ================================
            // MESSAGE CHECK
            // ================================

            if (
                !message ||
                typeof message !== "string"
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Savol yuborilmadi."

                });

            }


            const cleanMessage =
                message
                    .trim()
                    .slice(0, 6000);


            if (!cleanMessage) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Savol bo‘sh."

                });

            }


            // ================================
            // HISTORY
            // ================================

            const safeHistory =

                Array.isArray(history)

                    ? history.slice(-10)

                    : [];


            // ================================
            // PROMPT YARATISH
            // ================================

            let prompt =
                SYSTEM_PROMPT + "\n\n";


            // Oldingi suhbat
            for (
                const item of safeHistory
            ) {

                if (
                    !item ||
                    !item.role
                ) {
                    continue;
                }


                if (
                    item.role === "user"
                ) {

                    prompt +=
                        `Foydalanuvchi: ` +
                        `${String(
                            item.content || ""
                        ).slice(0, 4000)}\n`;

                }


                if (
                    item.role === "assistant"
                ) {

                    prompt +=
                        `Adolat AI: ` +
                        `${String(
                            item.content || ""
                        ).slice(0, 4000)}\n`;

                }

            }


            prompt +=
                `\nFoydalanuvchining yangi savoli:\n` +
                cleanMessage;


            // ================================
            // LOG
            // ================================

            console.log("");
            console.log(
                "================================"
            );

            console.log(
                "🤖 GEMINI SAVOL:"
            );

            console.log(
                cleanMessage
            );

            console.log(
                "🤖 MODEL:",
                GEMINI_MODEL
            );

            console.log(
                "================================"
            );


            // ================================
            // GEMINI REQUEST
            // ================================

            const response =
                await ai.models.generateContent({

                    model:
                        GEMINI_MODEL,

                    contents:
                        prompt

                });


            // ================================
            // ANSWER
            // ================================

            const answer =
                response.text ||
                "Kechirasiz, javob olishda muammo yuz berdi.";


            console.log(
                "✅ GEMINI JAVOB QAYTARDI"
            );


            // ================================
            // RESPONSE
            // ================================

            return res.json({

                success:
                    true,

                answer:
                    answer,

                model:
                    GEMINI_MODEL,

                provider:
                    "Google Gemini"

            });

        }

        catch (error) {

            console.error("");

            console.error(
                "================================"
            );

            console.error(
                "❌ GEMINI XATOSI"
            );

            console.error(
                "================================"
            );

            console.error(
                "Name:",
                error?.name
            );

            console.error(
                "Message:",
                error?.message
            );

            console.error(
                "Status:",
                error?.status
            );

            console.error(
                "Code:",
                error?.code
            );

            console.error(
                "================================"
            );


            return res.status(500).json({

                success:
                    false,

                error:
                    "Gemini AI xizmatida xatolik yuz berdi.",

                details:
                    error?.message ||
                    "Noma'lum xatolik"

            });

        }

    }
);


// ========================================
// SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "⚖️ ADOLAT 2.0 BACKEND"
        );

        console.log(
            "================================"
        );

        console.log(
            `🚀 Server: http://localhost:${PORT}`
        );

        console.log(
            "🤖 AI: Google Gemini"
        );

        console.log(
            `🧠 Model: ${GEMINI_MODEL}`
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);