async function askAI(message, history = []) {
    const response = await fetch(
        "http://localhost:3000",
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
        throw new Error(data.error || "Server xatosi");
    }

    return data.answer;
}
