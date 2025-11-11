import { FormEvent, useState } from "react";
import api from "../api/client";

interface Props {
  onCreated?: () => void;
}

const PostCreator = ({ onCreated }: Props) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setStatus("Please choose an image");
      return;
    }

    const form = new FormData();
    form.append("caption", caption);
    form.append("image", file);

    try {
      setStatus("Uploading...");
      await api.post("/api/posts", form, { headers: { "Content-Type": "multipart/form-data" } });
      setCaption("");
      setFile(null);
      setStatus("Post created! Processing image...");
      onCreated?.();
    } catch (error) {
      console.error(error);
      setStatus("Failed to create post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Create Post</h2>
      <div>
        <label className="block text-sm font-medium">Caption</label>
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      {status && <p className="text-sm text-slate-600">{status}</p>}
      <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
        Post
      </button>
    </form>
  );
};

export default PostCreator;


