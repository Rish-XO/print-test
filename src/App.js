import React, { useEffect, useState } from "react";

function App() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Create a WebSocket connection to the PrintEase server
    const ws = new WebSocket("ws://localhost:12345");

    ws.onopen = () => {
      console.log("Connected to PrintEase WebSocket");
      setStatus("Connected");
      // Request the list of available printers
      ws.send(JSON.stringify({ action: "listPrinters" }));
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);

      if (response.type === "printers") {
        setPrinters(response.data);
      } else if (response.status) {
        setMessage(
          response.status === "success"
            ? "Print job sent successfully"
            : `Error: ${response.message}`
        );
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setStatus("Disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Error");
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const handlePrint = () => {
    if (!selectedPrinter) {
      alert("Please select a printer");
      return;
    }

    // Sample print data (this could be modified as needed)
    const printData = "^XA^FO50,50^ADN,36,20^FDHello, PrintEase!^FS^XZ";

    // Send print command to the WebSocket server
    const ws = new WebSocket("ws://localhost:12345");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: "print",
          data: {
            printerName: selectedPrinter,
            printData: printData,
            printerType: "ZPL", 
          },
        })
      );
    };
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PrintEase Test App</h1>
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
