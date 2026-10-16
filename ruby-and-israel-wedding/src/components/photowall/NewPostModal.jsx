import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "../../firebase";

const STAMP_TEXT = "Ruby & Israel · 12.04.26";
const MAX_DIMENSION = 1600;

// Draws the uploaded photo onto a canvas and stamps the wedding name/date
// into the corner, so every photo posted to the wall carries it automatically.
// Also downsizes the image first — phone photos can be 8-12MB at full
// resolution. Capping the longest side at 1600px keeps it sharp on screen
// but a fraction of the size, which is what makes uploads fast.
function stampImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const fontSize = Math.max(16, Math.round(canvas.width * 0.028));
        ctx.font = `italic 600 ${fontSize}px Georgia, "Times New Roman", serif`;
        const textWidth = ctx.measureText(STAMP_TEXT).width;

        const paddingX = fontSize * 0.7;
        const paddingY = fontSize * 0.5;
        const boxW = textWidth + paddingX * 2;
        const boxH = fontSize + paddingY * 2;
        const margin = fontSize * 0.8;
        const x = canvas.width - boxW - margin;
        const y = canvas.height - boxH - margin;
        const radius = boxH / 2;

        ctx.fillStyle = "rgba(22, 35, 63, 0.55)";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, boxW, boxH, radius);
        } else {
          ctx.rect(x, y, boxW, boxH);
        }
        ctx.fill();

        ctx.fillStyle = "#fdf6e3";
        ctx.textBaseline = "middle";
        ctx.fillText(STAMP_TEXT, x + paddingX, y + boxH / 2 + 1);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error("Could not process image"));
          },
          "image/jpeg",
          0.85
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };

    img.src = url;
  });
}

export default function NewPostModal({ profile, onClose, onPosted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    setPreview("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file && !caption.trim()) {
      setError("Add a photo, write something, or both.");
      return;
    }
    setPosting(true);
    setError("");
    try {
      const user = auth.currentUser;

      let imageUrl = "";
      if (file) {
        let uploadBlob = file;
        try {
          uploadBlob = await stampImage(file);
        } catch (err) {
          console.warn("Could not stamp image, uploading original:", err);
        }

        const path = `posts/${user.uid}-${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, uploadBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "posts"), {
        authorName: profile.name || "Guest",
        authorAvatarUrl: profile.avatarUrl || "",
        imageUrl,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
        uid: user.uid,
        commentCount: 0,
        likeCount: 0,
      });

      onPosted();
    } catch (err) {
      console.error(err);
      setError("Something went wrong posting. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="pw-modal-backdrop">
      <div className="pw-modal">
        <h2>Share with the wall</h2>
        <p className="pw-modal-sub">Post a photo, a message, or both.</p>

        <form onSubmit={handleSubmit}>
          <div className="pw-field">
            <label>Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          {preview && (
            <div className="pw-preview-wrap">
              <img src={preview} alt="Preview" className="pw-preview" />
              <button
                type="button"
                className="pw-preview-remove"
                onClick={clearFile}
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          )}

          <div className="pw-field">
            <label>{file ? "Caption (optional)" : "Say something"}</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about this moment..."
            />
          </div>

          {error && <p className="pw-error">{error}</p>}

          <div className="pw-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={posting}>
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
