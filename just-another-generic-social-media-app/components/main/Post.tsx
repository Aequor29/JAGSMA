// /components/main/Post.tsx

"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify"; // Ensure react-toastify is installed

interface Comment {
  _id: string;
  author: string;
  text: string;
  date: string;
}

interface Article {
  id: string;
  title: string;
  text: string;
  author: string;
  date: string;
  image?: string;
  comments?: Comment[];
}

interface PostProps {
  article: Article;
  currentUser: { username: string };
}

const Post = ({ article: initialArticle, currentUser }: PostProps) => {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [comments, setComments] = useState<Comment[]>(article.comments || []);
  const [showComments, setShowComments] = useState<boolean>(false);

  const [newComment, setNewComment] = useState<string>("");

  // Editing states for the article
  const [isEditingArticle, setIsEditingArticle] = useState<boolean>(false);
  const [editedArticleText, setEditedArticleText] = useState<string>(
    article.text
  );

  // Editing states for comments
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>("");

  const formattedDate = new Date(article.date).toLocaleString();

  // Handle toggling comment visibility
  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  // Handle add new comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    console.log("Adding comment to article ID:", article.id); // Debugging line

    try {
      const response = await apiFetch({
        endpoint: `/articles/${article.id}`,
        method: "PUT",
        body: { comment: newComment.trim() },
      });

      const updatedArticle = response.data.articles[0];
      setArticle(updatedArticle);
      setComments(updatedArticle.comments);
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.message || "Failed to add comment. Please try again.");
    }
  };

  // Handle edit article
  const handleEditArticle = () => {
    if (article.author === currentUser.username) {
      setIsEditingArticle(true);
      setEditedArticleText(article.text);
    }
  };

  // Handle save edited article
  const handleSaveArticle = async () => {
    console.log("Saving article with ID:", article.id); // Debugging line
    try {
      const response = await apiFetch({
        endpoint: `/articles/${article.id}`,
        method: "PUT",
        body: { text: editedArticleText },
      });

      const updatedArticle = response.data.articles[0];
      setArticle(updatedArticle);
      setIsEditingArticle(false);
      toast.success("Article updated successfully!");
    } catch (error: any) {
      console.error("Error updating article:", error);
      toast.error(
        error.message || "Failed to update article. Please try again."
      );
    }
  };

  // Handle cancel edit article
  const handleCancelArticleEdit = () => {
    setIsEditingArticle(false);
    setEditedArticleText(article.text);
  };

  // Handle edit comment
  const handleEditComment = (commentId: string, currentText: string) => {
    // Ensure current user is either author of the post or author of the comment
    const comment = comments.find((c) => c._id === commentId);
    if (
      comment &&
      (comment.author === currentUser.username ||
        article.author === currentUser.username)
    ) {
      setEditingCommentId(commentId);
      setEditedCommentText(currentText);
    }
  };

  // Handle save edited comment
  const handleSaveComment = async () => {
    if (!editingCommentId) return;
    console.log("Saving comment with ID:", editingCommentId); // Debugging line
    try {
      const response = await apiFetch({
        endpoint: `/articles/${article.id}`,
        method: "PUT",
        body: { commentId: editingCommentId, comment: editedCommentText },
      });

      const updatedArticle = response.data.articles[0];
      setArticle(updatedArticle);
      setComments(updatedArticle.comments);
      setEditingCommentId(null);
      setEditedCommentText("");
      toast.success("Comment updated successfully!");
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast.error(
        error.message || "Failed to update comment. Please try again."
      );
    }
  };

  // Handle cancel edit comment
  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  // Check if current user can edit the article
  const canEditArticle = article.author === currentUser.username;

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
      <CardContent>
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="max-w-full mb-2"
          />
        )}
        {isEditingArticle ? (
          <div className="flex flex-col space-y-2">
            <Textarea
              value={editedArticleText}
              onChange={(e) => setEditedArticleText(e.target.value)}
            />
            <div className="space-x-2">
              <Button onClick={handleSaveArticle}>Save</Button>
              <Button variant="outline" onClick={handleCancelArticleEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p>{article.text}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="outline" onClick={handleToggleComments}>
          {showComments ? "Hide Comments" : "Show Comments"}
        </Button>
        {canEditArticle && !isEditingArticle && (
          <Button variant="outline" onClick={handleEditArticle}>
            Edit
          </Button>
        )}
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

          {comments.length > 0 ? (
            <ul className="space-y-2">
              {comments.map((comment) => {
                const canEditComment =
                  comment.author === currentUser.username ||
                  article.author === currentUser.username;
                const isEditingThisComment = editingCommentId === comment._id;

                return (
                  <li key={comment._id} className="border p-2 rounded">
                    <p className="font-semibold">{comment.author}</p>
                    {isEditingThisComment ? (
                      <div className="flex flex-col space-y-2 mt-2">
                        <Textarea
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                        />
                        <div className="space-x-2">
                          <Button onClick={handleSaveComment}>Save</Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelCommentEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {comment.text}
                      </p>
                    )}
                    {canEditComment && !isEditingThisComment && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          handleEditComment(comment._id, comment.text)
                        }
                      >
                        Edit Comment
                      </Button>
                    )}
                  </li>
                );
              })}
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
