/**
 * SkillSelector Component
 * 
 * Search-enabled hierarchical skill selector.
 * - Search skills by name/description
 * - Shows skills with expandable subskill boxes
 * - Select entire skill (darker shade) or specific subskills
 * - Tracks selections with visual feedback
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillCard } from './SkillCard';
import type { SkillWithSubskills, Skill, SkillSelection } from '@/types/skill';

interface SkillSelectorProps {
  onSelectionChange?: (selections: SkillSelection[]) => void;
  maxHeight?: string;
  placeholder?: string;
  apiBaseUrl?: string;
}

interface SkillState {
  skill: SkillWithSubskills;
  selectedSubskillIds: string[];
  includeAllSubskills: boolean;
}

export function SkillSelector({
  onSelectionChange,
  maxHeight = '500px',
  placeholder = 'Search skills, languages, frameworks...',
  apiBaseUrl = 'http://localhost:3001',
}: SkillSelectorProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SkillWithSubskills[]>([]);
  
  // Root skills (shown when no search)
  const [rootSkills, setRootSkills] = useState<SkillWithSubskills[]>([]);
  const [isLoadingRoots, setIsLoadingRoots] = useState(true);
  
  // Selection state: Map of skillId -> selection details
  const [selections, setSelections] = useState<Map<string, SkillState>>(new Map());
  
  // Fetch root skills on mount
  useEffect(() => {
    async function fetchRootSkills() {
      try {
        setIsLoadingRoots(true);
        const res = await fetch(`${apiBaseUrl}/api/skills/roots`);
        if (!res.ok) throw new Error('Failed to fetch skills');
        
        const data = await res.json();
        
        // Fetch subskills for each root skill
        const skillsWithSubskills = await Promise.all(
          data.skills.map(async (skill: Skill) => {
            try {
              const detailRes = await fetch(`${apiBaseUrl}/api/skills/${skill.id}?maxDepth=1`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                return detailData.skill;
              }
            } catch {
              // Fallback to skill without subskills
            }
            return { ...skill, subskills: [], computedDepth: 0 };
          })
        );
        
        setRootSkills(skillsWithSubskills);
      } catch (error) {
        console.error('Failed to fetch root skills:', error);
      } finally {
        setIsLoadingRoots(false);
      }
    }
    
    fetchRootSkills();
  }, [apiBaseUrl]);
  
  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const debounceTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `${apiBaseUrl}/api/skills?search=${encodeURIComponent(searchQuery)}`
        );
        
        if (!res.ok) throw new Error('Search failed');
        
        const data = await res.json();
        
        // Fetch subskills for search results
        const skillsWithSubskills = await Promise.all(
          data.skills.map(async (skill: Skill) => {
            try {
              const detailRes = await fetch(`${apiBaseUrl}/api/skills/${skill.id}?maxDepth=1`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                return detailData.skill;
              }
            } catch {
              // Fallback
            }
            return { ...skill, subskills: [], computedDepth: 0 };
          })
        );
        
        setSearchResults(skillsWithSubskills);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, apiBaseUrl]);
  
  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectionList: SkillSelection[] = Array.from(selections.values()).map((state) => ({
        skillId: state.skill.id,
        name: state.skill.name,
        includeSubskills: state.includeAllSubskills,
        sourceType: 'USER_SELECTED',
      }));
      onSelectionChange(selectionList);
    }
  }, [selections, onSelectionChange]);
  
  // Handle selecting a skill (with all subskills)
  const handleSelectSkill = useCallback((skillId: string, includeAllSubskills: boolean) => {
    const skillsToSearch = searchQuery.trim() ? searchResults : rootSkills;
    const skill = skillsToSearch.find((s) => s.id === skillId);
    
    if (!skill) return;
    
    setSelections((prev) => {
      const next = new Map(prev);
      next.set(skillId, {
        skill,
        selectedSubskillIds: includeAllSubskills
          ? skill.subskills?.map((s) => s.id) ?? []
          : [],
        includeAllSubskills,
      });
      return next;
    });
  }, [searchResults, rootSkills, searchQuery]);
  
  // Handle selecting a specific subskill
  const handleSelectSubskill = useCallback((parentId: string, subskillId: string, selected: boolean) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const existing = next.get(parentId);
      
      if (!existing) {
        // Need to find the parent skill first
        const skillsToSearch = searchQuery.trim() ? searchResults : rootSkills;
        const parentSkill = skillsToSearch.find((s) => s.id === parentId);
        if (!parentSkill) return prev;
        
        next.set(parentId, {
          skill: parentSkill,
          selectedSubskillIds: selected ? [subskillId] : [],
          includeAllSubskills: false,
        });
      } else {
        const newSubskillIds = selected
          ? [...existing.selectedSubskillIds, subskillId]
          : existing.selectedSubskillIds.filter((id) => id !== subskillId);
        
        // If no subskills selected, remove the selection entirely
        if (newSubskillIds.length === 0) {
          next.delete(parentId);
        } else {
          next.set(parentId, {
            ...existing,
            selectedSubskillIds: newSubskillIds,
            includeAllSubskills: false,
          });
        }
      }
      
      return next;
    });
  }, [searchResults, rootSkills, searchQuery]);
  
  // Handle deselecting a skill entirely
  const handleDeselectSkill = useCallback((skillId: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      next.delete(skillId);
      return next;
    });
  }, []);
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Skills to display
  const displaySkills = searchQuery.trim() ? searchResults : rootSkills;
  const totalSelections = selections.size;
  
  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-md"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Selection Summary */}
      {totalSelections > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Badge variant="default" className="text-sm">
            {totalSelections} skill{totalSelections !== 1 ? 's' : ''} selected
          </Badge>
          <div className="flex-1 flex flex-wrap gap-1">
            {Array.from(selections.values()).slice(0, 3).map((state) => (
              <Badge
                key={state.skill.id}
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                {state.skill.icon && <span>{state.skill.icon}</span>}
                {state.skill.name}
                {state.includeAllSubskills && state.skill.subskills?.length > 0 && (
                  <span className="text-muted-foreground">
                    ({state.skill.subskills.length})
                  </span>
                )}
                <button
                  onClick={() => handleDeselectSkill(state.skill.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {totalSelections > 3 && (
              <Badge variant="outline" className="text-xs">
                +{totalSelections - 3} more
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelections(new Map())}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        </div>
      )}
      
      {/* Skills List */}
      <ScrollArea className="flex-1" style={{ maxHeight }}>
        <div className="space-y-3 pr-4">
          {/* Loading State */}
          {(isLoadingRoots || isSearching) && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search Results Loading Indicator */}
          {isSearching && searchQuery && (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching for "{searchQuery}"...</span>
            </div>
          )}
          
          {/* No Results */}
          {!isLoadingRoots && !isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No skills found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
          
          {/* Skills Grid */}
          {!isLoadingRoots && !isSearching && displaySkills.map((skill) => {
            const selection = selections.get(skill.id);
            const isSelected = selection?.includeAllSubskills ?? false;
            const selectedSubskillIds = selection?.selectedSubskillIds ?? [];
            
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isSelected={isSelected}
                selectedSubskillIds={selectedSubskillIds}
                onSelectSkill={handleSelectSkill}
                onSelectSubskill={handleSelectSubskill}
                onDeselectSkill={handleDeselectSkill}
              />
            );
          })}
          
          {/* Empty State */}
          {!isLoadingRoots && !searchQuery && rootSkills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No skills available</p>
              <p className="text-sm mt-1">Skills will appear here once configured</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
