"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, Lightbulb, Target, TrendingUp, Shield, Sparkles, Award, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  title: string;
  content: string;
  icon?: React.ReactNode;
  color?: string;
}

interface HealthRating {
  score: number;
  verdict: string;
}

function extractHealthRating(text: string): HealthRating | null {
  // Ensure text is always a string to prevent .match() errors
  if (typeof text !== 'string') {
    text = text ? String(text) : '';
  }
  // Look for patterns like "Health Rating: 7/10" or "Rating: 7/10"
  const ratingMatch = text.match(/(?:Health\s+)?Rating[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i);
  if (ratingMatch) {
    const score = parseFloat(ratingMatch[1]);

    // Extract verdict text (usually the first line or paragraph)
    const verdictMatch = text.match(/OVERALL VERDICT:?\s*([^\n]+)/i);
    const verdict = verdictMatch ? verdictMatch[1].trim() : '';

    return { score, verdict };
  }
  return null;
}

function parseAnalysisText(text: string): Section[] {
  // Ensure text is always a string to prevent .match() errors
  if (typeof text !== 'string') {
    text = text ? String(text) : '';
  }
  const sections: Section[] = [];

  // Define section patterns with their icons and colors
  // Common lookahead to stop at the start of any other section or end of string
  const nextHeader = "(?:SUMMARY|KEY RISKS|POSITIVE HIGHLIGHTS|RECOMMENDATION|MARKETING TRAPS|OVERALL VERDICT)";
  const lookahead = `(?=\\n\\s*${nextHeader}|$)`;

  const sectionPatterns = [
    {
      pattern: new RegExp(`SUMMARY:?\\s*([\\s\\S]*?)${lookahead}`, 'i'),
      title: 'Summary',
      icon: <Award className="h-5 w-5" />,
      color: 'purple'
    },
    {
      pattern: new RegExp(`KEY RISKS:?\\s*([\\s\\S]*?)${lookahead}`, 'i'),
      title: 'Key Risks',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'red'
    },
    {
      pattern: new RegExp(`POSITIVE HIGHLIGHTS:?\\s*([\\s\\S]*?)${lookahead}`, 'i'),
      title: 'Positive Highlights',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green'
    },
    {
      pattern: new RegExp(`RECOMMENDATION:?\\s*([\\s\\S]*?)${lookahead}`, 'i'),
      title: 'Recommendation',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'yellow'
    },
    {
      pattern: new RegExp(`MARKETING TRAPS:?\\s*([\\s\\S]*?)${lookahead}`, 'i'),
      title: 'Marketing Traps',
      icon: <Target className="h-5 w-5" />,
      color: 'orange'
    },
  ];

  sectionPatterns.forEach(({ pattern, title, icon, color }) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const content = match[1].trim();
      if (content) {
        sections.push({ title, content, icon, color });
      }
    }
  });

  return sections;
}

function formatContent(content: string): string[] {
  return content
    .replace(/\\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function getColorClasses(color?: string) {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500'
      };
    case 'purple':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-500'
      };
    case 'red':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/30',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-500'
      };
    case 'green':
      return {
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-500'
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: 'text-yellow-500'
      };
    case 'orange':
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        border: 'border-orange-500/30',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-500'
      };
    default:
      return {
        bg: 'bg-secondary/50',
        border: 'border-border/60',
        text: 'text-foreground',
        icon: 'text-primary'
      };
  }
}

function HealthRatingCircle({ rating }: { rating: HealthRating }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (rating.score / 10) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = rating.score / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= rating.score) {
          setAnimatedScore(rating.score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [rating.score]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return { color: 'text-green-500', bg: 'from-green-500 to-emerald-500', ring: 'ring-green-500/20' };
    if (score >= 6) return { color: 'text-yellow-500', bg: 'from-yellow-500 to-orange-500', ring: 'ring-yellow-500/20' };
    if (score >= 4) return { color: 'text-orange-500', bg: 'from-orange-500 to-red-500', ring: 'ring-orange-500/20' };
    return { color: 'text-red-500', bg: 'from-red-500 to-rose-500', ring: 'ring-red-500/20' };
  };

  const scoreColors = getScoreColor(rating.score);

  return (
    <div className="relative flex flex-col items-center gap-6 p-8 animate-scaleIn">
      {/* Circular Progress */}
      <div className="relative">
        {/* Background circle */}
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-secondary/30"
          />
          {/* Animated progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
            className="transition-all duration-1000 ease-out drop-shadow-lg"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={cn("transition-all", scoreColors.color)} stopOpacity="1" />
              <stop offset="100%" className={cn("transition-all", scoreColors.color)} stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("text-6xl font-bold transition-all", scoreColors.color)}>
            {animatedScore.toFixed(1)}
          </div>
          <div className="text-2xl text-muted-foreground font-medium">/10</div>
          <Heart className={cn("h-6 w-6 mt-2 animate-pulse", scoreColors.color)} />
        </div>

        {/* Glow effect */}
        <div className={cn("absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse", scoreColors.ring)} />
      </div>

      {/* Score Label */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Health Rating</h3>
      </div>

      {/* Score Indicator Bars */}
      <div className="flex gap-2 w-full max-w-xs">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-500",
              i < Math.round(rating.score)
                ? `bg-gradient-to-r ${scoreColors.bg} shadow-lg`
                : "bg-secondary/30"
            )}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

interface AnalysisDisplayProps {
  analysisText?: string;
  analysisSections?: string[];
}

export default function AnalysisDisplay({ analysisText = '', analysisSections = [] }: AnalysisDisplayProps) {
  // Map section names to display information
  const sectionConfig = [
    {
      name: 'Overall Verdict',
      title: 'Overall Verdict',
      icon: <Award className="h-5 w-5" />,
      color: 'purple'
    },
    {
      name: 'Summary',
      title: 'Summary',
      icon: <Award className="h-5 w-5" />,
      color: 'purple'
    },
    {
      name: 'Key Risks',
      title: 'Key Risks',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'red'
    },
    {
      name: 'Positive Highlights',
      title: 'Positive Highlights',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green'
    },
    {
      name: 'Recommendation',
      title: 'Recommendation',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'yellow'
    },
    {
      name: 'Marketing Traps',
      title: 'Marketing Traps',
      icon: <Target className="h-5 w-5" />,
      color: 'orange'
    }
  ];

  // Convert analysisSections array to Section objects
  const sectionsFromArray: Section[] = analysisSections
    .map((content, index): Section | null => {
      if (!content || content.trim().length === 0) return null;
      const config = sectionConfig[index];
      return {
        title: config?.title || `Section ${index + 1}`,
        content: content,
        icon: config?.icon,
        color: config?.color
      };
    })
    .filter((s): s is Section => s !== null);

  // Use sections from array if available, otherwise parse text
  const sections = sectionsFromArray.length > 0 ? sectionsFromArray : parseAnalysisText(analysisText);
  const healthRating = extractHealthRating(analysisText || analysisSections.join('\n'));
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: true }), {})
  );
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Stagger section animations
    sections.forEach((section, index) => {
      setTimeout(() => {
        setVisibleSections(prev => ({ ...prev, [section.title]: true }));
      }, index * 150);
    });
  }, [sections]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  if (sections.length === 0) {
    return (
      <div className="rounded-lg bg-secondary/50 p-6 leading-relaxed">
        <p className="whitespace-pre-wrap text-base">{analysisText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Health Rating Display */}
      {healthRating && (
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <HealthRatingCircle rating={healthRating} />
        </div>
      )}

      {/* Analysis Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const colors = getColorClasses(section.color);
          const isVisible = visibleSections[section.title];

          return (
            <div
              key={section.title}
              className={cn(
                "rounded-xl border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform",
                colors.border,
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center justify-between p-6 transition-all duration-300 group",
                  colors.bg,
                  "hover:brightness-110"
                )}
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <div className={cn(
                    "rounded-lg p-3 transition-all duration-300 group-hover:scale-110",
                    colors.bg,
                    "ring-2 ring-offset-2 ring-offset-background",
                    colors.border
                  )}>
                    <div className={colors.icon}>
                      {section.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-xl transition-colors", colors.text)}>
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {expandedSections[section.title] ? 'Click to collapse' : 'Click to expand'}
                    </p>
                  </div>
                </div>
                <div className={cn("transition-transform duration-300", colors.text, expandedSections[section.title] && "rotate-180")}>
                  <ChevronDown className="h-6 w-6" />
                </div>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-500 ease-in-out",
                  expandedSections[section.title] ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="border-t border-border/40 bg-card/50 backdrop-blur p-6">
                  <div className="space-y-4">
                    {formatContent(section.content).map((line, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-3 items-start transition-all duration-300 hover:translate-x-1",
                          expandedSections[section.title] ? "opacity-100" : "opacity-0"
                        )}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        {line.match(/^[-•*]/) ? (
                          <>
                            <Sparkles className={cn("flex-shrink-0 mt-1 h-4 w-4", colors.icon)} />
                            <p className="text-foreground leading-relaxed flex-1">
                              {line.replace(/^[-•*]\s*/, '')}
                            </p>
                          </>
                        ) : (
                          <p className="text-foreground leading-relaxed flex-1 pl-7">
                            {line}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="relative mt-12 rounded-xl border border-border/40 bg-secondary/20 p-6 backdrop-blur">
        <div className="flex items-start gap-4">
          <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Important Disclaimer</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-generated analysis may contain errors. Please verify information independently and consult with healthcare professionals for personalized dietary advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
