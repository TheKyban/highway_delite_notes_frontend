"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService, Note } from "@/lib/api";
import { isAxiosError } from "axios";

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
}

interface DashboardClientProps {
  initialUser: User;
}

export default function DashboardClient({ initialUser }: DashboardClientProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await apiService.getNotes();
      if (response.success && response.data) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push("/signin");
          return;
        }
        setError(error.response?.data.message || "Failed to load notes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newNoteTitle.trim() === "") {
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiService.createNote({
        title: newNoteTitle,
        content: newNoteContent,
      });

      if (response.success && response.data) {
        setNotes((prevNotes) => [response?.data?.note as Note, ...prevNotes]);
        setNewNoteTitle("");
        setNewNoteContent("");
        setIsDialogOpen(false);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push("/signin");
          return;
        }
        setError(error.response?.data.message || "Failed to create note");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await apiService.deleteNote(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push("/signin");
          return;
        }
        setError(error.response?.data.message || "Failed to delete note");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="flex w-full min-h-screen bg-gray-50 justify-center">
      <div className="flex flex-col w-full max-w-sm lg:max-w-4xl p-4 lg:p-8 bg-white lg:shadow-sm">
        {/* Header section */}
        <header className="flex items-center justify-between w-full py-4 border-b">
          <div className="flex items-center gap-3">
            <Loader className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl lg:text-2xl font-medium text-[#232323]">
              Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm lg:text-base font-semibold text-blue-500 underline hover:text-blue-600"
          >
            Sign Out
          </button>
        </header>

        {/* Welcome Card */}
        <Card className="w-full mt-8 shadow-md">
          <CardContent className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl">
              <span className="font-bold">Welcome, {initialUser.name}!</span>
            </div>
            <p className="text-base lg:text-lg text-gray-600">
              Email: {initialUser.email}
            </p>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <section className="w-full mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl lg:text-2xl font-medium text-[#232323]">
              Your Notes
            </h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full lg:w-auto mt-4 lg:mt-0 h-12 lg:h-14 px-6 text-base font-semibold bg-blue-500 hover:bg-blue-600 rounded-lg">
                  Create Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateNote}>
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>
                      Enter a title for your new note below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="col-span-3"
                        autoComplete="off"
                        disabled={isCreating}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="content" className="text-right">
                        Content
                      </Label>
                      <Input
                        id="content"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="col-span-3"
                        autoComplete="off"
                        disabled={isCreating}
                        placeholder="Optional note content"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={!newNoteTitle.trim() || isCreating}
                      variant={"secondary"}
                    >
                      {isCreating ? "Creating..." : "Save Note"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {notes.length > 0 ? (
              notes?.map((note) => (
                <Card
                  key={note.id}
                  className="w-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="flex flex-col p-4 lg:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="flex-1 text-base lg:text-lg font-medium text-[#232323]">
                        {note.title}
                      </h3>
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    {note.content && (
                      <p className="mt-2 text-sm text-gray-600">
                        {note.content}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">You have no notes yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
