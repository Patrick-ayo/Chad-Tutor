import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StickyNote, Search, Plus, Trash2, Edit, Clock, Save, FileText } from "lucide-react";
import { mockUserNotes } from "@/data/mockSessionData";
import type { UserNote } from "@/types/session";

export function MyNotesPage() {
  const [notes, setNotes] = useState<UserNote[]>(mockUserNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setNewNoteContent("");
    setIsAddDialogOpen(false);
  };

  const handleEditNote = () => {
    if (!editingNote || !newNoteContent.trim()) return;
    
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...note, content: newNoteContent, lastModified: new Date().toISOString() }
        : note
    ));
    setEditingNote(null);
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const openEditDialog = (note: UserNote) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const date = formatShortDate(note.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
    return groups;
  }, {} as Record<string, UserNote[]>);

  return (
    <div className="py-8 px-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <StickyNote className="h-8 w-8 text-primary" />
            Notes
          </h1>
          <p className="text-muted-foreground mt-2">
            Personal notes and insights captured during your learning journey
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Write your thoughts, insights, or key learnings..."
                value={newNoteContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!newNoteContent.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-primary">{notes.length}</div>
            <div className="text-xs text-muted-foreground">Total Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {notes.filter(n => {
                const created = new Date(n.createdAt);
                const now = new Date();
                return created.toDateString() === now.toDateString();
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {notes.filter(n => {
                const created = new Date(n.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <ScrollArea className="h-[calc(100vh-450px)]">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No notes match your search" : "No notes yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start capturing your learning insights and key takeaways
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">{date}</h3>
                <div className="space-y-3">
                  {dateNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(note.lastModified)}
                              </span>
                              {note.timestamp !== undefined && (
                                <Badge variant="outline" className="text-xs font-mono">
                                  {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                                </Badge>
                              )}
                              {note.createdAt !== note.lastModified && (
                                <Badge variant="secondary" className="text-xs">
                                  Edited
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Dialog 
                              open={editingNote?.id === note.id} 
                              onOpenChange={(open) => !open && setEditingNote(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(note)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Edit Note</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    value={newNoteContent}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                                    rows={8}
                                    className="resize-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingNote(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleEditNote} disabled={!newNoteContent.trim()}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="mt-4 text-sm text-muted-foreground text-center">
        {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""} 
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  );
}
