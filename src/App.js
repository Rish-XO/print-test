import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

function App() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = "wss://localhost:12345";
 
    socketRef.current = io(socketUrl, {
      secure: true,
      rejectUnauthorized: false,
      // transports: ["websocket"], 
    });

    socketRef.current.on("connect", () => {
      setStatus("Connected");
      socketRef.current.emit("listPrinters");
    });

    socketRef.current.on("printers", (data) => {
      setPrinters(data);
    });

    socketRef.current.on("printStatus", (response) => {
      setMessage(
        response.status === "success"
          ? "Print job sent successfully"
          : `Error: ${response.message}`
      );
    });

    socketRef.current.on("disconnect", (reason) => {
      setStatus("Disconnected");
    });

    socketRef.current.on("connect_error", (error) => {
      setStatus("Error");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handlePrint = () => {
    if (!selectedPrinter) {
      alert("Please select a printer");
      return;
    }

    const printData = "^XA^FO50,50^ADN,36,20^FDHello, PrintEase!^FS^XZ";

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("print", {
        printerName: selectedPrinter,
        printData: printData,
        printerType: "ZPL",
      });
    } else {
      setStatus("Disconnected");
      setMessage("Unable to send print command: Socket.IO is not connected.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PrintEase Testing</h1>
      <p>Status: {status}</p>

      <div>
        <label>Select Printer:</label>
        <select
          value={selectedPrinter}
          onChange={(e) => setSelectedPrinter(e.target.value)}
        >
          <option value="">-- Select Printer --</option>
          {printers && printers.length > 0 ? (
            printers.map((printer, index) => (
              <option key={index} value={printer}>
                {printer}
              </option>
            ))
          ) : (
            <option value="">No printers available</option>
          )}
        </select>
      </div>

      <button onClick={handlePrint} style={{ marginTop: "20px" }}>
        Print Test Label
      </button>

      {message && (
        <p style={{ color: message.includes("Error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
