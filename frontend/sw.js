// async function askAI(message, history = []) {

//    const response = await fetch(
//     "https://adolat-4siq.onrender.com/api/chat",
//     {
//         method: "POST",

//         headers: {
//             "Content-Type": "application/json"
//         },

//         body: JSON.stringify({
//             message: message,
//             history: history
//         })
//     }
// );

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.error || "Server xatosi"
//         );
//     }

//     return data.answer;
// }const answer = await askAI(
//     "Ish beruvchi oyligimni bermasa nima qilishim mumkin?"
// );

// console.log(answer);
async function askAI(message, history = []) {
    try {
        console.log("📤 Render'ga so'rov yuborilmoqda...");

        const response = await fetch(
            "https://adolat-4siq.onrender.com",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    history: history
                })
            }
        );

        console.log("📥 Status:", response.status);

        const data = await response.json();

        console.log("📦 Server javobi:", data);

        if (!response.ok) {
            throw new Error(
                data.error || "Server xatosi"
            );
        }

        return data.answer;

    } catch (error) {
        console.error("❌ AI ERROR:", error);
        throw error;
    }
}


// TEST
askAI("Ish beruvchi oyligimni bermasa nima qilishim mumkin?")
    .then(answer => {
        console.log("🤖 AI JAVOB:", answer);
    })
    .catch(error => {
        console.error("❌ AI ISHLAMADI:", error);
    });
