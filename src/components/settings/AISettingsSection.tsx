import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Bot, Lightbulb, Gauge, Shield, Key, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authorizedFetch } from "@/lib/plannerApi";
import { registerLocalPasskey, verifyLocalPasskey } from "@/lib/webauthn";
import type { AISettings } from "@/types/settings";

interface AISettingsSectionProps {
  settings: AISettings;
  onChange: (field: keyof AISettings, value: unknown) => void;
}

export function AISettingsSection({ settings, onChange }: AISettingsSectionProps) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState("");
  const [hasPasskey, setHasPasskey] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const credentialId = localStorage.getItem("byok_passkey_id");
    if (credentialId) {
      setHasPasskey(true);
      setIsLocked(true);
    } else {
      setHasPasskey(false);
      setIsLocked(false);
    }

    if (!isLoaded) return;
    if (!isSignedIn) return;

    authorizedFetch("/api/settings/universal-key")
      .then(res => res.json())
      .then(data => {
        if (data.provider) setProvider(data.provider);
        if (data.hasKey && data.maskedKey) {
          setApiKey(data.maskedKey);
        }
      })
      .catch(err => console.error("Failed to fetch API key:", err));
  }, [isLoaded, isSignedIn]);

  const handleRegisterPasskey = async () => {
    try {
      const id = await registerLocalPasskey();
      localStorage.setItem("byok_passkey_id", id);
      setHasPasskey(true);
      setIsLocked(false);
      setKeyMessage("Passkey registered successfully.");
      setTimeout(() => setKeyMessage(""), 3000);
    } catch (err: any) {
      setKeyMessage("Failed to register passkey: " + err.message);
    }
  };

  const handleUnlock = async () => {
    const id = localStorage.getItem("byok_passkey_id");
    if (!id) {
      setIsLocked(false);
      return;
    }
    try {
      const success = await verifyLocalPasskey(id);
      if (success) {
        setIsLocked(false);
      } else {
        setKeyMessage("Verification failed.");
      }
    } catch (err: any) {
      setKeyMessage("Error unlocking: " + err.message);
    }
  };

  const handleSaveKey = async () => {
    setIsSavingKey(true);
    setKeyMessage("");
    try {
      const res = await authorizedFetch("/api/settings/universal-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, apiKey }),
      });
      if (res.ok) {
        setKeyMessage("API Key saved successfully!");
      } else {
        setKeyMessage("Failed to save API Key.");
      }
    } catch (err) {
      setKeyMessage("Error saving API Key.");
    } finally {
      setIsSavingKey(false);
      setTimeout(() => setKeyMessage(""), 3000);
    }
  };

  const handleDeleteKey = async () => {
    setIsSavingKey(true);
    setKeyMessage("");
    try {
      const res = await authorizedFetch("/api/settings/universal-key", {
        method: "DELETE",
      });
      if (res.ok) {
        setApiKey("");
        setKeyMessage("API Key deleted.");
      } else {
        setKeyMessage("Failed to delete API Key.");
      }
    } catch (err) {
      setKeyMessage("Error deleting API Key.");
    } finally {
      setIsSavingKey(false);
      setTimeout(() => setKeyMessage(""), 3000);
    }
  };
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Features
        </CardTitle>
        <CardDescription>
          Control how AI helps (or doesn't help) your learning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Explanations */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Explanations
            </Label>
            <p className="text-xs text-gray-500">
              Get AI-generated explanations for concepts
            </p>
          </div>
          <Switch
            checked={settings.aiExplanationsEnabled}
            onCheckedChange={(checked) => onChange("aiExplanationsEnabled", checked)}
          />
        </div>

        {/* AI Hints */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Hints
            </Label>
            <p className="text-xs text-gray-500">
              Offer hints when you're stuck on practice problems
            </p>
          </div>
          <Switch
            checked={settings.aiHintsEnabled}
            onCheckedChange={(checked) => onChange("aiHintsEnabled", checked)}
          />
        </div>

        {/* AI Difficulty Adjustment */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Adaptive Difficulty
            </Label>
            <p className="text-xs text-gray-500">
              AI adjusts problem difficulty based on your performance
            </p>
          </div>
          <Switch
            checked={settings.aiDifficultyAdjustment}
            onCheckedChange={(checked) => onChange("aiDifficultyAdjustment", checked)}
          />
        </div>

        {/* Data Sharing */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Improve AI with My Data
            </Label>
            <p className="text-xs text-gray-500">
              Allow anonymized learning patterns to improve AI
            </p>
          </div>
          <Switch
            checked={settings.shareDataForImprovement}
            onCheckedChange={(checked) => onChange("shareDataForImprovement", checked)}
          />
        </div>

        {/* Bring Your Own Key (BYOK) */}
        <div className="py-2 border-t space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 pr-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Universal Bring Your Own Key (BYOK)
              </Label>
              <p className="text-xs text-gray-500">
                Select your AI provider and provide your own API key to override system limits. Your key will be securely encrypted.
              </p>
            </div>
            {hasPasskey && isLocked && (
              <Button size="sm" variant="outline" onClick={handleUnlock}>
                <Lock className="w-4 h-4 mr-2" /> Unlock Vault
              </Button>
            )}
            {hasPasskey && !isLocked && (
              <Button size="sm" variant="ghost" onClick={() => setIsLocked(true)}>
                <Unlock className="w-4 h-4 mr-2" /> Lock
              </Button>
            )}
          </div>
          
          {!hasPasskey ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md space-y-2">
              <p className="text-sm text-amber-800">
                To protect your API keys locally, please enable Device Passkey (Windows Hello, Touch ID, etc.) before entering them.
              </p>
              <Button size="sm" onClick={handleRegisterPasskey}>
                <Shield className="w-4 h-4 mr-2" /> Secure with Passkey
              </Button>
            </div>
          ) : isLocked ? (
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-md flex flex-col items-center justify-center space-y-2">
              <Lock className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Vault is locked</p>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <Select value={provider} onValueChange={(val) => { setProvider(val); setApiKey(''); setKeyMessage(''); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="password" 
                placeholder={`Enter ${provider} API Key...`} 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveKey} disabled={isSavingKey || !apiKey}>Save</Button>
              {apiKey && apiKey.includes('*') && (
                <Button size="sm" variant="destructive" onClick={handleDeleteKey} disabled={isSavingKey}>Remove</Button>
              )}
            </div>
          )}
          {keyMessage && <p className="text-xs text-amber-600 font-medium">{keyMessage}</p>}
        </div>

        <p className="text-xs text-gray-500 pt-3 border-t italic">
          Disabling AI features won't affect your progress tracking or schedule.
          You can always enable them later.
        </p>
      </CardContent>
    </Card>
  );
}
