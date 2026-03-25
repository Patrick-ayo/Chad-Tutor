import type { GoalDefinition, GoalType } from "@/types/goal";
import type { SkillSelection } from "@/types/skill";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { skills } from "@/data/skills";
import { roles } from "@/data/roles";
import { GraduationCap, Sparkles, Briefcase, ArrowRight, Search, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface GoalTypeStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
}

interface SkillCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

const CANONICAL_CATEGORY_NAMES = [
  "Programming Languages",
  "Frontend Frameworks",
  "Backend Frameworks",
  "Databases",
  "DevOps & Cloud",
  "Data Science & AI",
  "Testing & QA",
  "Security & Cybersecurity",
  "Mobile Development",
  "Design & UX",
  "Product Management",
  "Soft Skills",
  "Tools & IDEs",
  "Blockchain",
  "Game Development",
];

const normalizeCategoryKey = (value: string): string =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "").trim();

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  // Canonical category variants
  programminglanguages: "Programming Languages",
  frontendframeworks: "Frontend Frameworks",
  backendframeworks: "Backend Frameworks",
  databases: "Databases",
  devopscloud: "DevOps & Cloud",
  devopsandcloud: "DevOps & Cloud",
  datascienceai: "Data Science & AI",
  datascienceandai: "Data Science & AI",
  testingqa: "Testing & QA",
  testingandqa: "Testing & QA",
  securitycybersecurity: "Security & Cybersecurity",
  securityandcybersecurity: "Security & Cybersecurity",
  mobiledevelopment: "Mobile Development",
  designux: "Design & UX",
  designandux: "Design & UX",
  productmanagement: "Product Management",
  softskills: "Soft Skills",
  toolsides: "Tools & IDEs",
  toolsandides: "Tools & IDEs",
  blockchain: "Blockchain",
  gamedevelopment: "Game Development",

  // Frontend local fallback category variants
  webdevelopment: "Frontend Frameworks",
  programming: "Programming Languages",
  backend: "Backend Frameworks",
  data: "Databases",
  computerscience: "Programming Languages",
  devops: "DevOps & Cloud",
  cloud: "DevOps & Cloud",
  workflow: "Tools & IDEs",
  quality: "Testing & QA",
  aiml: "Data Science & AI",
};

const toCanonicalCategory = (rawCategory?: string): string => {
  const category = String(rawCategory ?? "General");
  const normalized = normalizeCategoryKey(category);
  return CATEGORY_ALIAS_MAP[normalized] ?? category;
};

const goalTypeConfig: Record<GoalType, { icon: typeof GraduationCap; label: string; description: string }> = {
  exam: {
    icon: GraduationCap,
    label: "Exam",
    description: "Prepare for a specific test or certification",
  },
  skill: {
    icon: Sparkles,
    label: "Skill",
    description: "Master a specific technology or concept",
  },
  role: {
    icon: Briefcase,
    label: "Role",
    description: "Prepare for a job role (combines multiple skills)",
  },
};

export function GoalTypeStep({ data, onUpdate, onNext }: GoalTypeStepProps) {
  const [selectedType, setSelectedType] = useState<GoalType | undefined>(data.type);
  const [availableSkills, setAvailableSkills] = useState<SkillCatalogItem[]>(
    skills.map((skill) => ({
      ...skill,
      category: toCanonicalCategory(skill.category),
      difficulty: skill.difficulty as SkillCatalogItem["difficulty"],
    }))
  );
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    data.selectedSkills?.map((selection) => selection.skillId) ?? []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    data.selectedRoles ?? (data.goalId ? [data.goalId] : [])
  );
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const normalizeDifficulty = (value?: string): SkillCatalogItem["difficulty"] => {
      switch (value) {
        case "BEGINNER":
          return "Beginner";
        case "INTERMEDIATE":
          return "Intermediate";
        case "ADVANCED":
          return "Advanced";
        case "EXPERT":
          return "Expert";
        default:
          return "Beginner";
      }
    };

    const fetchAllSkills = async () => {
      try {
        setIsLoadingSkills(true);

        const pageSize = 100;
        let offset = 0;
        let total = Number.POSITIVE_INFINITY;
        const collected: SkillCatalogItem[] = [];

        while (offset < total) {
          const response = await fetch(`/api/skills?limit=${pageSize}&offset=${offset}&includeUnpublished=true`);
          if (!response.ok) {
            throw new Error("Failed to fetch skills catalog");
          }

          const payload = await response.json();
          const pageSkills = Array.isArray(payload?.skills) ? payload.skills : [];

          const mappedPage: SkillCatalogItem[] = pageSkills.map((skill: any) => ({
            id: String(skill.id),
            name: String(skill.name ?? "Unnamed Skill"),
            description: String(skill.description ?? "No description available."),
            category: toCanonicalCategory(skill.category?.name),
            difficulty: normalizeDifficulty(skill.difficulty),
          }));

          collected.push(...mappedPage);

          const reportedTotal = typeof payload?.total === "number" ? payload.total : mappedPage.length;
          total = Number.isFinite(reportedTotal) ? reportedTotal : mappedPage.length;
          offset += mappedPage.length;

          if (mappedPage.length === 0) {
            break;
          }
        }

        if (!isMounted) {
          return;
        }

        const deduped = Array.from(new Map(collected.map((item) => [item.id, item])).values());
        if (deduped.length > 0) {
          setAvailableSkills(deduped);
        }
      } catch (error) {
        console.warn("Falling back to local skill catalog:", error);
      } finally {
        if (isMounted) {
          setIsLoadingSkills(false);
        }
      }
    };

    void fetchAllSkills();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    const query = skillSearchQuery.trim().toLowerCase();
    const selectedCategoryKey = normalizeCategoryKey(selectedCategory);

    return availableSkills.filter((skill) => {
      const matchesSearch =
        query.length === 0 ||
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query);
      const skillCategoryKey = normalizeCategoryKey(toCanonicalCategory(skill.category));
      const matchesCategory = selectedCategory === "all" || skillCategoryKey === selectedCategoryKey;
      return matchesSearch && matchesCategory;
    });
  }, [availableSkills, selectedCategory, skillSearchQuery]);

  const orderedCategoryNames = useMemo(() => {
    const existing = new Set(availableSkills.map((skill) => skill.category));
    const extras = Array.from(existing).filter((name) => !CANONICAL_CATEGORY_NAMES.includes(name)).sort();

    // Always show the complete expected categories list first, then append any unknown categories from API.
    return [...CANONICAL_CATEGORY_NAMES, ...extras];
  }, [availableSkills]);

  const skillCountByCategory = useMemo(() => {
    return availableSkills.reduce<Record<string, number>>((acc, skill) => {
      const category = toCanonicalCategory(skill.category);
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {});
  }, [availableSkills]);

  const filteredRoles = useMemo(() => {
    const query = roleSearchQuery.trim().toLowerCase();
    return roles.filter((role) => role.name.toLowerCase().includes(query));
  }, [roleSearchQuery]);

  const handleTypeChange = (type: GoalType) => {
    setSelectedType(type);
    setSelectedSkills([]);
    setSelectedRoles([]);
    onUpdate({ type, goalId: undefined });
  };

  const handleNext = () => {
    // For exams, just proceed with type selected (no goalId needed)
    if (selectedType === "exam") {
      onUpdate({ type: "exam" });
      onNext();
      return;
    }
    // For skills, use selected skills
    if (selectedType === "skill" && selectedSkills.length > 0) {
      const mappedSelections: SkillSelection[] = selectedSkills
        .map((skillId) => {
          const skill = availableSkills.find((entry) => entry.id === skillId);
          if (!skill) return null;
          return {
            skillId,
            name: skill.name,
            includeSubskills: false,
            sourceType: "USER_SELECTED",
          };
        })
        .filter((selection): selection is SkillSelection => selection !== null);

      onUpdate({ type: "skill", selectedSkills: mappedSelections });
      onNext();
      return;
    }
    // For roles, use selected roles and anchor the goalId to first selection
    if (selectedType === "role" && selectedRoles.length > 0) {
      const roleNames = selectedRoles
        .map((roleId) => roles.find((role) => role.id === roleId)?.name)
        .filter((roleName): roleName is string => Boolean(roleName));

      onUpdate({
        type: "role",
        goalId: selectedRoles[0],
        selectedRoles,
        customName: roleNames.join(", "),
      });
      onNext();
    }
  };

  const canProceed = selectedType === "exam" || 
    (selectedType === "skill" && selectedSkills.length > 0) ||
    (selectedType === "role" && selectedRoles.length > 0);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Goal Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">What are you working towards?</h3>
          <p className="text-sm text-muted-foreground">
            Select the type of goal you want to achieve
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.entries(goalTypeConfig) as [GoalType, typeof goalTypeConfig.exam][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              const isSelected = selectedType === type;

              return (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div
                      className={`rounded-full p-3 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mt-3 font-semibold">{config.label}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Step 2: Select Skills */}
      {selectedType === "skill" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Select Skills to Master</h3>
            <p className="text-sm text-muted-foreground">
              Search, filter, and select the specific skills you want to learn
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold">Skills</h4>
              <Button type="button" onClick={() => setIsSkillsModalOpen(true)}>
                + Add Skills
              </Button>
            </div>

            <div className="space-y-2">
              {selectedSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills selected yet. Click Add Skills to get started.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skillId) => {
                    const skill = availableSkills.find((entry) => entry.id === skillId);
                    if (!skill) return null;

                    return (
                      <div
                        key={skillId}
                        className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm"
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleSkill(skillId)}
                          className="rounded-full p-0.5 hover:bg-primary/15"
                          aria-label={`Remove ${skill.name}`}
                        >
                          x
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {isSkillsModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-background rounded-2xl border shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b space-y-4 bg-gradient-to-b from-muted/40 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold">Select Skills</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pick skills by category or search directly. Selections shape your goal plan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSkillsModalOpen(false)}
                      className="text-muted-foreground hover:text-foreground rounded-full border px-3 py-1.5"
                      aria-label="Close skills selector"
                    >
                      x
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search skills by name or description..."
                      value={skillSearchQuery}
                      onChange={(event) => setSkillSearchQuery(event.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-background"
                    />
                    {skillSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSkillSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                        selectedCategory === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      All ({availableSkills.length})
                    </button>
                    {orderedCategoryNames.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {category} ({skillCountByCategory[category] ?? 0})
                      </button>
                    ))}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="rounded-xl border bg-primary/5 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Selected skills</span>
                        <button
                          type="button"
                          onClick={() => setSelectedSkills([])}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear selected
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.slice(0, 10).map((skillId) => {
                          const skill = availableSkills.find((entry) => entry.id === skillId);
                          if (!skill) return null;
                          return (
                            <span
                              key={skillId}
                              className="inline-flex items-center gap-1 rounded-full bg-background border px-2.5 py-1 text-xs"
                            >
                              {skill.name}
                            </span>
                          );
                        })}
                        {selectedSkills.length > 10 && (
                          <span className="inline-flex items-center rounded-full bg-background border px-2.5 py-1 text-xs">
                            +{selectedSkills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {isLoadingSkills && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Loading full skills catalog...
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id);

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`group p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-muted-foreground/50 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h5 className="font-medium leading-tight">{skill.name}</h5>
                            {isSelected ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-muted-foreground opacity-0 group-hover:opacity-100">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                            {skill.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {skill.difficulty}
                            </span>
                            <span className="text-xs text-muted-foreground">{skill.category}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {filteredSkills.length === 0 && (
                    <p className="text-center text-muted-foreground py-12">
                      No skills found matching your search.
                    </p>
                  )}
                </div>

                <div className="p-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button type="button" onClick={() => setIsSkillsModalOpen(false)} className="px-6">
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Roles (only for role) */}
      {selectedType === "role" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Target Roles</h3>
            <p className="text-sm text-muted-foreground">
              Pick one or more roles from Explore to shape your goal direction
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold">Target Roles</h4>
              <Button
                type="button"
                onClick={() => setIsRolesModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Add Roles
              </Button>
            </div>

            <div className="space-y-2">
              {selectedRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No target roles selected. Click Add Roles to choose your career goals.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedRoles.map((roleId) => {
                    const role = roles.find((entry) => entry.id === roleId);
                    if (!role) return null;

                    return (
                      <div
                        key={roleId}
                        className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{role.icon}</span>
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRole(roleId)}
                          className="text-muted-foreground hover:text-red-600"
                          aria-label={`Remove ${role.name}`}
                        >
                          x
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {isRolesModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold">Select Target Roles</h4>
                    <button
                      type="button"
                      onClick={() => setIsRolesModalOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close roles selector"
                    >
                      x
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearchQuery}
                    onChange={(event) => setRoleSearchQuery(event.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.id);

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          className={`p-4 rounded-lg border-2 flex items-center gap-3 text-left transition ${
                            isSelected
                              ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <span className="text-3xl">{role.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-medium">{role.name}</h5>
                          </div>
                          {isSelected && <span className="text-green-600 text-lg">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedRoles.length} role{selectedRoles.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button
                      type="button"
                      onClick={() => setIsRolesModalOpen(false)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* For exams, show a message that detailed selection comes next */}
      {selectedType === "exam" && (
        <Card>
          <CardContent className="p-6 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-primary mb-3" />
            <h4 className="font-semibold mb-2">University Exam Preparation</h4>
            <p className="text-sm text-muted-foreground">
              Next, you'll select your university, course, semester, and specific subjects
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
