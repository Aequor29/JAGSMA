"use client";

import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { apiFetch } from "@/utils/api";

interface Article {
  id: string;
  text: string;
  title: string;
  author: string;
  date: string;
  image?: string;
}

interface NewPostProps {
  addNewPost: (newPost: Article) => void;
  currentUser: {
    username: string;
  };
}

export default function NewPost({ addNewPost, currentUser }: NewPostProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSubmit = async () => {
    if (title.trim() === "" || text.trim() === "") return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch({
        endpoint: "/articles",
        method: "POST",
        body: {
          title: title.trim(),
          text: text.trim(),
        },
      });

      if (response.status === 201 && response.data.articles?.[0]) {
        const newPost = response.data.articles[0];
        addNewPost(newPost);
        setTitle("");
        setText("");
      } else {
        throw new Error(response.data?.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !text.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Submit"}
        </Button>
      </div>
    </Card>
  );
}
