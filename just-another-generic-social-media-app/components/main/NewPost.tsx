// components/main/NewPost.tsx

"use client";

import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { toast } from "react-toastify"; // Ensure react-toastify is installed

interface NewPostProps {
  addNewPost: (title: string, text: string, image?: string) => Promise<void>;
  currentUser: {
    username: string;
  };
}

export default function NewPost({ addNewPost }: NewPostProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async () => {
    if (title.trim() === "" || text.trim() === "") return;
    setIsSubmitting(true);

    let imageBase64;
    if (imageFile) {
      try {
        // Convert file to base64 data URL for uploading
        imageBase64 = await fileToBase64(imageFile);
      } catch (error) {
        console.error("Error converting image:", error);
        toast.error("Failed to process the image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await addNewPost(title.trim(), text.trim(), imageBase64);
      setTitle("");
      setText("");
      setImageFile(null);
      toast.success("Post created successfully!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("FileReader result is not a string"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const handleClear = () => {
    setTitle("");
    setText("");
    setImageFile(null);
  };

  return (
    <Card className="w-full md:w-auto p-3">
      <CardHeader>
        <h2 className="text-lg font-semibold">Create a New Post</h2>
      </CardHeader>
      <div className="w-full md:w-auto p-3">
        <Input
          type="text"
          placeholder="Title"
          className="w-full mb-4"
          value={title}
          onChange={handleTitleChange}
          disabled={isSubmitting}
        />
        <Textarea
          placeholder="Write your post here..."
          className="w-full mb-4"
          value={text}
          onChange={handleTextChange}
          disabled={isSubmitting}
        />
        <Input
          type="file"
          accept="image/*"
          className="w-full mb-4"
          onChange={handleImageChange}
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !text.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Submit"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isSubmitting}
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
