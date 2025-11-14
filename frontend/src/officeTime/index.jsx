import { useEffect, useState } from "react";

const OfficeTime = ({ date }) => {
  const [futureTime, setFutureTime] = useState("");

  useEffect(() => {
    if (!date) return;
    if (typeof date !== "string") {
      console.error("Expected 'date' as a string, got:", date);
      return;
    }
    if (!date.includes(" ")) {
      console.error("GivenTime must include AM/PM, e.g. '08:40:05 am'");
      return;
    }
    const [time, modifier] = date.split(" ");
    let [hours, minutes, seconds] = time.split(":").map(Number);
    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

    const now = new Date();
    now.setHours(hours, minutes, seconds, 0);

    const future = new Date(now.getTime() + (8 * 60 + 30) * 60 * 1000);

    const formattedFuture = future.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setFutureTime(formattedFuture);
  }, [date]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p
        style={{
          position: "fixed",
          right: "5px",
          bottom: "5px",
          border: "1px solid #eee",
          padding: "6px 12px",
          backgroundColor: "#f1f2f3",
          borderRadius: "50px",
          fontSize: "12px",
        }}
      >
        End Time: {futureTime || "Calculating..."}
      </p>
      {/* <SaveData /> */}
    </div>
  );
};

export default OfficeTime;
