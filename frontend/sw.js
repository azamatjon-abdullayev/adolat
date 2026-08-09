async function askAI(message, history = []) {

    const response = await fetch(
        "https://adolat-4siq.onrender.com/api/chat",
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

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Server xatosi"
        );
    }

    return data.answer;
}const answer = await askAI(
    "Ish beruvchi oyligimni bermasa nima qilishim mumkin?"
);

console.log(answer);
