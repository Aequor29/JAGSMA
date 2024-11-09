// components/main/Post.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";

interface Article {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
}

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
}

interface PostProps {
  article: Article;
}

const Post = ({ article }: PostProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when showComments is true
  useEffect(() => {
    if (showComments && comments.length === 0) {
      setIsLoading(true);
      fetch(
        `https://jsonplaceholder.typicode.com/comments?postId=${article.id}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch comments.");
          }
          return res.json();
        })
        .then((data: Comment[]) => {
          setComments(data);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          console.error("Error fetching comments:", err);
          setError("Unable to load comments.");
          setIsLoading(false);
        });
    }
  }, [showComments, article.id, comments.length]);

  // Handle adding a new comment (non-persistent)
  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    const comment: Comment = {
      id: Math.floor(Math.random() * 100000),
      name: "Current User",
      email: "currentuser@example.com",
      body: newComment,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  // Format the timestamp for better readability
  const formattedDate = new Date(article.createdAt).toLocaleString();

  return (
    <Card className="w-full md:w-auto p-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {article.author} - {formattedDate}
          </p>
        </div>
      </CardHeader>
      <CardContent>{article.body}</CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </Button>
        <Button variant="outline">Edit</Button>
      </CardFooter>
      {showComments && (
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Comments</h4>
          <div className="mb-4">
            <Textarea
              placeholder="Add a comment..."
              className="w-full mb-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </div>
          {isLoading ? (
            <p>Loading comments...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : comments.length > 0 ? (
            <ul className="space-y-2">
              {comments.map((comment) => (
                <li key={comment.id} className="border p-2 rounded">
                  <p className="font-semibold">{comment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default Post;
