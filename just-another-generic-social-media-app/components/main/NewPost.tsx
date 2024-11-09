// src/components/main/NewPost.tsx
"use client";

import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { User } from "@/types/User"; // Adjust the import path as necessary

interface Article {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
}

interface NewPostProps {
  addNewPost: (newPost: Article) => void;
  currentUser: User;
}

export default function NewPost({ addNewPost, currentUser }: NewPostProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const handleSubmit = () => {
    if (title.trim() === "" || body.trim() === "") return;

    const newPost: Article = {
      id: Math.floor(Math.random() * 100000), // Generate a random ID
      userId: currentUser.id, // Current user's ID
      title,
      body,
      createdAt: new Date().toISOString(), // Current timestamp
      author: currentUser.username, // Current user's username
    };

    // Add the new post to the list (appear on top)
    addNewPost(newPost);

    // Clear the form fields
    setTitle("");
    setBody("");
  };

  return (
    <div>
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
          />
          <Textarea
            placeholder="Write your post here..."
            className="w-full mb-4"
            value={body}
            onChange={handleBodyChange}
          />
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !body.trim()}
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}
