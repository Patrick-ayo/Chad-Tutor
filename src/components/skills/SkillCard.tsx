/**
 * SkillCard Component
 * 
 * Displays a skill with expandable subskills.
 * - Main skill shown in darker shade (selectable as whole)
 * - Expand to see and select individual subskills
 * - Visual hierarchy with color differentiation
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import type { SkillWithSubskills, Difficulty } from '@/types/skill';

interface SkillCardProps {
  skill: SkillWithSubskills;
  isSelected: boolean;
  selectedSubskillIds: string[];
  onSelectSkill: (skillId: string, includeAllSubskills: boolean) => void;
  onSelectSubskill: (parentId: string, subskillId: string, selected: boolean) => void;
  onDeselectSkill: (skillId: string) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ADVANCED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const difficultyLabels: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

export function SkillCard({
  skill,
  isSelected,
  selectedSubskillIds,
  onSelectSkill,
  onSelectSubskill,
  onDeselectSkill,
}: SkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasSubskills = skill.subskills && skill.subskills.length > 0;
  const allSubskillsSelected = hasSubskills && selectedSubskillIds.length === skill.subskills.length;
  const someSubskillsSelected = selectedSubskillIds.length > 0 && !allSubskillsSelected;
  
  // Count of selected subskills
  const selectedCount = selectedSubskillIds.length;
  const totalSubskills = skill.subskills?.length ?? 0;
  
  const handleParentClick = () => {
    if (isSelected) {
      onDeselectSkill(skill.id);
    } else {
      // Select parent with all subskills
      onSelectSkill(skill.id, true);
    }
  };
  
  const handleSubskillToggle = (subskillId: string, checked: boolean) => {
    onSelectSubskill(skill.id, subskillId, checked);
  };
  
  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : someSubskillsSelected
          ? 'border-primary/50 bg-primary/3'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      {/* Main Skill Header - Darker shade when selected */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 cursor-pointer rounded-t-lg transition-colors',
          isSelected
            ? 'bg-primary/15 dark:bg-primary/25'
            : 'hover:bg-accent/50'
        )}
        onClick={handleParentClick}
      >
        {/* Expand/Collapse Button */}
        {hasSubskills && (
          <button
            onClick={handleExpandToggle}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            aria-label={isExpanded ? 'Collapse subskills' : 'Expand subskills'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        
        {/* Selection Indicator */}
        <div
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors',
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </div>
        
        {/* Skill Icon */}
        {skill.icon && (
          <span className="text-xl flex-shrink-0">{skill.icon}</span>
        )}
        
        {/* Skill Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'font-semibold truncate',
              isSelected ? 'text-primary' : 'text-foreground'
            )}>
              {skill.name}
            </span>
            <Badge 
              variant="secondary" 
              className={cn('text-xs', difficultyColors[skill.difficulty])}
            >
              {difficultyLabels[skill.difficulty]}
            </Badge>
          </div>
          {skill.description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {skill.description}
            </p>
          )}
        </div>
        
        {/* Subskill Count Badge */}
        {hasSubskills && (
          <Badge variant="outline" className="flex-shrink-0">
            {someSubskillsSelected || isSelected
              ? `${selectedCount}/${totalSubskills}`
              : `${totalSubskills} subtopics`}
          </Badge>
        )}
      </div>
      
      {/* Expandable Subskills Section */}
      {hasSubskills && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="border-t border-border/50 bg-muted/30 rounded-b-lg">
              <div className="p-3 space-y-1">
                {/* Select All / Deselect All */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Subtopics
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (allSubskillsSelected || isSelected) {
                        onDeselectSkill(skill.id);
                      } else {
                        onSelectSkill(skill.id, true);
                      }
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {allSubskillsSelected || isSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                
                {/* Subskill List */}
                {skill.subskills.map((subskill) => {
                  const isSubskillSelected = selectedSubskillIds.includes(subskill.id) || isSelected;
                  
                  return (
                    <label
                      key={subskill.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors',
                        isSubskillSelected
                          ? 'bg-primary/10'
                          : 'hover:bg-accent/50'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSubskillSelected}
                        onCheckedChange={(checked) => {
                          handleSubskillToggle(subskill.id, checked as boolean);
                        }}
                        disabled={isSelected} // Disabled when parent is fully selected
                      />
                      
                      {subskill.icon && (
                        <span className="text-sm">{subskill.icon}</span>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          'text-sm',
                          isSubskillSelected ? 'font-medium' : 'text-foreground'
                        )}>
                          {subskill.name}
                        </span>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', difficultyColors[subskill.difficulty])}
                      >
                        {difficultyLabels[subskill.difficulty]}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
