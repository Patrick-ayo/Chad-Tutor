import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StartSessionButtonProps {
  taskId: string;
  taskName?: string;
  onClick?: () => void;
}

export function StartSessionButton({ taskId, taskName, onClick }: StartSessionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/session/${taskId}`);
  };

  return (
    <Button 
      size="lg" 
      className="w-full gap-2 text-lg font-semibold py-6"
      onClick={handleClick}
    >
      <Play className="h-5 w-5" />
      Start Session
      {taskName && (
        <span className="sr-only">: {taskName}</span>
      )}
    </Button>
  );
}
