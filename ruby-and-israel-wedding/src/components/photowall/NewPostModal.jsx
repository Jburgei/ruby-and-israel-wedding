import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "../../firebase";

const STAMP_TEXT = "Ruby & Israel · 4 Dec 2026";
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

        ctx.fillStyle = "rgba(27, 42, 74, 0.6)";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, boxW, boxH, radius);
        } else {
          ctx.rect(x, y, boxW, boxH);
        }
        ctx.fill();

        ctx.fillStyle = "#FBF8F3";
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
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    const withPreviews = picked.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...withPreviews]);
    e.target.value = "";
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!files.length && !caption.trim()) {
      setError("Add a photo, a blessing, or both.");
      return;
    }
    setPosting(true);
    setError("");
    try {
      const user = auth.currentUser;
      const trimmedCaption = caption.trim();

      if (files.length === 0) {
        // No photo at all — this is a text-only blessing.
        await addDoc(collection(db, "posts"), {
          type: "blessing",
          authorName: profile.name || "Guest",
          imageUrl: "",
          caption: trimmedCaption,
          createdAt: serverTimestamp(),
          uid: user.uid,
          commentCount: 0,
          likeCount: 0,
        });
      } else {
        // One or more photos — each becomes its own Moment post so the
        // feed stays a simple one-photo-per-card scroll. The blessing
        // text, if any, rides along with just the first photo so it
        // isn't repeated across every card.
        for (let i = 0; i < files.length; i++) {
          const { file } = files[i];
          let uploadBlob = file;
          try {
            uploadBlob = await stampImage(file);
          } catch (err) {
            console.warn("Could not stamp image, uploading original:", err);
          }

          const path = `posts/${user.uid}-${Date.now()}-${i}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, uploadBlob);
          const imageUrl = await getDownloadURL(storageRef);

          await addDoc(collection(db, "posts"), {
            type: "moment",
            authorName: profile.name || "Guest",
            imageUrl,
            caption: i === 0 ? trimmedCaption : "",
            createdAt: serverTimestamp(),
            uid: user.uid,
            commentCount: 0,
            likeCount: 0,
          });
        }
      }

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
        <h2>Share a moment.</h2>
        <p className="pw-modal-sub">Add a photo, a blessing, or both.</p>

        <form onSubmit={handleSubmit}>
          <label className="pw-upload-box">
            <div className="pw-upload-box-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div className="pw-upload-box-text">Tap to add photos</div>
            <div className="pw-upload-box-sub">You can select more than one</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
            />
          </label>

          {files.length > 0 && (
            <div className="pw-preview-grid">
              {files.map((f, i) => (
                <div className="pw-preview-thumb" key={i}>
                  <img src={f.preview} alt="" />
                  <button
                    type="button"
                    className="pw-preview-remove"
                    onClick={() => removeFile(i)}
                    aria-label="Remove photo"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pw-field">
            <label>Message</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something for Ruby and Israel"
            />
          </div>

          {error && <p className="pw-error">{error}</p>}

          <div className="pw-modal-actions">
            <button type="submit" className="btn-primary" disabled={posting}>
              {posting ? "Sharing..." : "Share."}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
