import { Search, Scale, FileText, Link2, BookOpen } from "lucide-react";

export const SUGGESTIONS = [
  { icon: Search, label: "Search Cases", prefill: "Show me cases similar to " },
  { icon: Scale, label: "Bail Cases", prefill: "How many bail cases are in the database?" },
  { icon: FileText, label: "Case Lookup", prefill: "Give me details of case number " },
  { icon: Link2, label: "Citations", prefill: "Which cases cite " },
  { icon: BookOpen, label: "Legal Research", prefill: "What is the legal standard for " },
];
