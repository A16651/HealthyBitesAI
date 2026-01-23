"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  content: string;
  icon?: string;
}

function parseAnalysisText(text: string): Section[] {
  const sections: Section[] = [];

  // Define section patterns and their icons
  const sectionPatterns = [
    { pattern: /OVERALL VERDICT:?\s*([^]*?)(?=\n\n[A-Z]|$)/i, title: 'Overall Verdict', icon: '⚖️' },
    { pattern: /SUMMARY:?\s*([^]*?)(?=\n\n[A-Z]|$)/i, title: 'Summary', icon: '📋' },
    { pattern: /KEY RISKS:?\s*([^]*?)(?=\n\n[A-Z]|$)/i, title: 'Key Risks', icon: '⚠️' },
    { pattern: /POSITIVE HIGHLIGHTS:?\s*([^]*?)(?=\n\n[A-Z]|$)/i, title: 'Positive Highlights', icon: '✨' },
    { pattern: /RECOMMENDATION:?\s*([^]*?)(?=\n\n[A-Z]|$)/i, title: 'Recommendation', icon: '💡' },
    { pattern: /MARKETING TRAPS:?\s*([^]*?)$/i, title: 'Marketing Traps', icon: '🎯' },
  ];

  sectionPatterns.forEach(({ pattern, title, icon }) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const content = match[1].trim();
      if (content) {
        sections.push({ title, content, icon });
      }
    }
  });

  return sections;
}

function formatContent(content: string): string[] {
  // Split by line breaks and filter empty lines
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

interface AnalysisDisplayProps {
  analysisText: string;
}

export default function AnalysisDisplay({ analysisText }: AnalysisDisplayProps) {
  const sections = parseAnalysisText(analysisText);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: true }), {})
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  if (sections.length === 0) {
    // Fallback to plain text display if parsing fails
    return (
      <div className="rounded-lg bg-secondary/50 p-6 leading-relaxed">
        <p className="whitespace-pre-wrap text-base">{analysisText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-lg border border-border/60 bg-card overflow-hidden hover:shadow-md transition-shadow"
        >
          <button
            onClick={() => toggleSection(section.title)}
            className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-left flex-1">
              <span className="text-xl">{section.icon}</span>
              <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
            </div>
            <div className="text-muted-foreground">
              {expandedSections[section.title] ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </button>

          {expandedSections[section.title] && (
            <div className="border-t border-border/40 bg-secondary/20 p-5">
              <div className="space-y-3">
                {formatContent(section.content).map((line, idx) => (
                  <div key={idx} className="flex gap-3">
                    {/* Bullet point for list items */}
                    {line.match(/^[-•*]/) ? (
                      <>
                        <span className="text-primary font-bold flex-shrink-0">•</span>
                        <p className="text-sm text-foreground leading-relaxed">
                          {line.replace(/^[-•*]\s*/, '')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed flex-1">
                        {line}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
