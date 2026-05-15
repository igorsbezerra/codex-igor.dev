import { BookOpen, Code2, FileCode2, Lightbulb, Rocket, Zap } from "lucide-react";

const iconByName = {
  book: BookOpen,
  code: Code2,
  fileCode: FileCode2,
  lightbulb: Lightbulb,
  rocket: Rocket,
  zap: Zap,
};

export function DocIcon({ name, size = 18 }) {
  const Icon = iconByName[name] ?? BookOpen;
  return <Icon size={size} />;
}
