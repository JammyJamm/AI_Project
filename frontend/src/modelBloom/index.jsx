import { useState } from "react";

const ModelAIBloom = ()=>{
    const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askGoldRate = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "What is today gold rate in India?" }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer("Error fetching answer.");
    }
    setLoading(false);
  };
    return(
        <div style={{ textAlign: "center", marginTop: "100px" }}>
     <form>
     <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", fontSize: "16px" }}
      />
      <button type="button"
        onClick={askGoldRate}
        style={{ padding: "10px 20px", marginLeft: "10px", fontSize: "16px" }}
      >
        Check
      </button>
      <p>{loading==true?"thinking":answer}</p>
     </form>
    </div>
    )
}
export default ModelAIBloom;