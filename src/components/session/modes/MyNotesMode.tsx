import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenLine, Search, Plus, Trash2, Edit, Clock, Save } from "lucide-react";
import type { UserNote } from "@/types/session";

interface MyNotesModeProps {
  notes: UserNote[];
  onAddNote?: (content: string) => void;
  onEditNote?: (id: string, content: string) => void;
  onDeleteNote?: (id: string) => void;
}

export function MyNotesMode({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote
}: MyNotesModeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    onAddNote?.(newNoteContent);
    setNewNoteContent("");
    setIsAddDialogOpen(false);
  };

  const handleEditNote = () => {
    if (!editingNote || !newNoteContent.trim()) return;
    
    onEditNote?.(editingNote.id, newNoteContent);
    setEditingNote(null);
    setNewNoteContent("");
  };

  const openEditDialog = (note: UserNote) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              My Notes
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNoteContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                    rows={5}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-gray-600">
            Personal notes and insights from your learning sessions
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PenLine className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "No notes match your search" : "No notes yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Start taking notes to capture your learning insights
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(note.lastModified)}
                      </span>
                      {note.timestamp !== undefined && (
                        <span className="text-xs text-blue-500 font-mono">
                          at {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Dialog open={editingNote?.id === note.id} onOpenChange={(open) => !open && setEditingNote(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(note)}
                          className="text-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Note</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={newNoteContent}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                            rows={5}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingNote(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleEditNote}>
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteNote?.(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}