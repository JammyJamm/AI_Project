import React, { useEffect, useState } from "react";
import OfficeTime from "./officeTime/index";
import ModelAIBloom from "./modelBloom";
import DailyData from "./dailyData";

function App() {
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  // Onlad events Starts //
  // Office time

  // Onlad events Ends //

  const checkName = async () => {
    const response = await fetch("http://127.0.0.1:8000/check_name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    setResult(`${data.status} ${data.message}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {/* <h2 style={{ marginTop: "20px", color: "blue" }}>{result}</h2>
      <OfficeTime />
      <ModelAIBloom /> */}
      <DailyData />
    </div>
  );
}

export default App;
