import { useEffect, useState } from "react";

const TelegramTrigger = () => {
  const sendNotification = async () => {
    const res = await fetch("http://127.0.0.1:8000/telegramNotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Weather Alert 🌧️" }),
    });
    const data = await res.json();
    console.log("Response:", data);
    alert("Message sent!");
  };
  /////////////////
  const [weather, setWeather] = useState(null);
  const fetchWeather = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/latestWeather");
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };
  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <h1>{weather?.city}</h1>
      <button onClick={sendNotification}>Send Telegram Alert</button>
    </>
  );
};

export default TelegramTrigger;
