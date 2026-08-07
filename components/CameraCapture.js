"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function CameraCapture({ reason, onCapture, onCancel }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const [mode,      setMode]      = useState("camera"); // "camera" | "preview"
  const [imgData,   setImgData]   = useState(null);
  const [imgBlob,   setImgBlob]   = useState(null);
  const [camErr,    setCamErr]    = useState("");
  const [starting,  setStarting]  = useState(true);

  const startCamera = useCallback(async () => {
    setStarting(true); setCamErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      // Fallback: front camera or any camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch (e) {
        setCamErr(`Camera not available (${e.name || "Error"}: ${e.message || "Unknown error"}). Please use the file picker below.`);
      }
    }
    setStarting(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [startCamera]);

  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImgData(dataUrl);
    // Convert to blob
    canvas.toBlob((blob) => setImgBlob(blob), "image/jpeg", 0.85);
    // Stop camera
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setMode("preview");
  };

  const retake = () => {
    setImgData(null); setImgBlob(null); setMode("camera");
    startCamera();
  };

  const confirm = () => {
    if (imgBlob) {
      const file = new File([imgBlob], `checkin_${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImgData(ev.target.result); setImgBlob(file); setMode("preview"); };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.92)",
      zIndex:2147483647, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"flex-start",
      overflowY:"auto", padding:"16px 0"
    }}>
      {/* Header */}
      <div style={{ width:"100%", maxWidth:"480px", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ color:"white", fontWeight:700, fontSize:"14px", margin:0 }}>📸 Check-in Photo Required</p>
          {reason && <p style={{ color:"#9ca3af", fontSize:"11px", margin:"3px 0 0" }}>{reason}</p>}
        </div>
        <button type="button" onClick={onCancel}
          style={{ color:"#9ca3af", background:"none", border:"none", fontSize:"24px", cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Camera / Preview area */}
      <div style={{ width:"100%", maxWidth:"480px", flex:1, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 16px" }}>
        {mode === "camera" ? (
          <div style={{ width:"100%", borderRadius:"16px", overflow:"hidden", background:"#111", position:"relative" }}>
            {starting && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, background:"rgba(0,0,0,0.5)" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:"32px", height:"32px", border:"3px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 8px" }} />
                  <p style={{ color:"white", fontSize:"12px" }}>Starting camera…</p>
                </div>
              </div>
            )}
            {camErr ? (
              <div style={{ padding:"32px 20px", textAlign:"center" }}>
                <p style={{ color:"#fca5a5", fontSize:"13px", marginBottom:"16px" }}>{camErr}</p>
                <label style={{ display:"inline-block", padding:"10px 20px", background:"#7c3aed", color:"white", borderRadius:"10px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                  📁 Choose Photo
                  <input type="file" accept="image/*" onChange={handleFileInput} style={{ display:"none" }} />
                </label>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width:"100%", maxHeight:"360px", display:"block", objectFit:"cover" }} />
            )}
          </div>
        ) : (
          <div style={{ width:"100%", borderRadius:"16px", overflow:"hidden" }}>
            <img src={imgData} alt="Preview"
              style={{ width:"100%", maxHeight:"360px", objectFit:"cover", display:"block" }} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display:"none" }} />

      {/* Action buttons */}
      <div style={{ width:"100%", maxWidth:"480px", padding:"16px 20px 24px" }}>
        {mode === "camera" && !camErr && (
          <div style={{ display:"flex", gap:"12px" }}>
            <button type="button" onClick={onCancel}
              style={{ flex:1, padding:"13px", border:"1.5px solid #374151", background:"transparent", color:"white", borderRadius:"12px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={capture} disabled={starting}
              style={{ flex:2, padding:"13px", background: starting ? "#374151" : "white", color: starting ? "#9ca3af" : "#111827", borderRadius:"12px", fontSize:"14px", fontWeight:800, cursor: starting ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              <span style={{ fontSize:"20px" }}>📷</span> Capture Photo
            </button>
          </div>
        )}
        {mode === "preview" && (
          <div style={{ display:"flex", gap:"12px" }}>
            <button type="button" onClick={retake}
              style={{ flex:1, padding:"13px", border:"1.5px solid #374151", background:"transparent", color:"white", borderRadius:"12px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              🔄 Retake
            </button>
            <button type="button" onClick={confirm}
              style={{ flex:2, padding:"13px", background:"#16a34a", color:"white", borderRadius:"12px", fontSize:"14px", fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              <span style={{ fontSize:"18px" }}>✓</span> Use this photo
            </button>
          </div>
        )}
        {/* File picker fallback always available */}
        {mode === "camera" && !camErr && (
          <div style={{ marginTop:"10px", textAlign:"center" }}>
            <label style={{ color:"#6b7280", fontSize:"11px", cursor:"pointer", textDecoration:"underline" }}>
              Or pick from gallery
              <input type="file" accept="image/*" onChange={handleFileInput} style={{ display:"none" }} />
            </label>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
