import { useEffect, useState } from "react";
import OfficeTime from "../officeTime";

import TelegramTrigger from "../saveData/index";
import RouteMap from "../map";

const DailyData = () => {
  const [error, setError] = useState(null);
  const [dailyData, SetDailyData] = useState(null);
  const [fullData, setFulldata] = useState(null);
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          // setLocation({ lat, lon });
          setError(null);
          // Get location
          getCity(lat, lon);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const getCity = async (lat, lon) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    const payload = {
      lat: lat,
      lon: lon,
      pincode: data.address.postcode,
      place: data.address.suburb,
      city: data.address.city,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };

    // Send daily data to server
    try {
      const response = await fetch("http://127.0.0.1:8000/addData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Data saved:", result);
      checkSameDay(result.data);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };
  // Control overlapping of daily data - Get Daily data
  const getDataFunc = () => {
    try {
      fetch("http://127.0.0.1:8000/getData", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        // .then((data) => getDatas(data.data))
        .then((data) => {
          console.log("✅ Response:", data.data);
          checkSameDay(data);
        })
        .catch((err) => console.error("❌ Error:", err));
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };
  function checkSameDay(todayData) {
    const today = new Date().toLocaleDateString();
    const sameDayEntry = Array.isArray(todayData.data)
      ? todayData.data.find((item) => item.date === today)
      : todayData;

    if (sameDayEntry) {
      console.log("✅ Same day found:", sameDayEntry);
      SetDailyData(sameDayEntry.time); // will trigger OfficeTime update
    } else {
      console.log("🆕 New day detected — fetching location...");
      getLocation(); // save new entry for today
    }
  }

  // One time Trigger
  useEffect(() => {
    getDataFunc();
  }, []);

  return (
    <>
      <RouteMap />
      <TelegramTrigger />
      <OfficeTime date={dailyData} />
    </>
  );
};
export default DailyData;
