'use client';
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function Uploader({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('${process.env.NEXT_PUBLIC_API_URL}/analyze', {
        method: 'POST',
        body: formData,
      });
      onUploadSuccess(); // Refresh the list after upload
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-10 p-8 border-2 border-dashed border-zinc-700 rounded-xl hover:border-blue-500 transition group text-center cursor-pointer relative">
      <input 
        type="file" 
        onChange={handleUpload} 
        className="absolute inset-0 opacity-0 cursor-pointer"
        accept="audio/*"
      />
      <UploadCloud className="mx-auto mb-4 text-zinc-500 group-hover:text-blue-500" size={48} />
      <p className="text-zinc-400">
        {uploading ? "Analyzing Sound Waves..." : "Drag & Drop or Click to Upload Music"}
      </p>
    </div>
  );
}