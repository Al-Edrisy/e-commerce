import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, Tag, X } from 'lucide-react';
import { products, categories } from '@/data/mockData';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
}

interface SearchSuggestion {
  type: 'history' | 'product' | 'category' | 'trending';
  text: string;
  score: number;
  productId?: string;
}

export const SearchAutocomplete = ({ className, placeholder = "Search products..." }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const { history, addToHistory, removeFromHistory } = useSearchHistory();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ML-like scoring algorithm
  const calculateRelevanceScore = (searchTerm: string, target: string): number => {
    const search = searchTerm.toLowerCase();
    const text = target.toLowerCase();
    
    let score = 0;
    
    // Exact match
    if (text === search) score += 100;
    
    // Starts with
    if (text.startsWith(search)) score += 50;
    
    // Contains
    if (text.includes(search)) score += 25;
    
    // Word boundary match
    const words = text.split(/\s+/);
    if (words.some(word => word.startsWith(search))) score += 40;
    
    // Fuzzy match (character proximity)
    let matchCount = 0;
    let lastIndex = -1;
    for (const char of search) {
      const index = text.indexOf(char, lastIndex + 1);
      if (index > lastIndex) {
        matchCount++;
        lastIndex = index;
      }
    }
    if (matchCount === search.length) score += 10;
    
    return score;
  };

  useEffect(() => {
    if (!query.trim()) {
      // Show recent history and trending when no query
      const recentSuggestions: SearchSuggestion[] = history.slice(0, 5).map(item => ({
        type: 'history',
        text: item,
        score: 100
      }));
      
      const trending: SearchSuggestion[] = [
        { type: 'trending', text: 'wireless headphones', score: 90 },
        { type: 'trending', text: 'smart watch', score: 85 },
        { type: 'trending', text: 'yoga mat', score: 80 }
      ];
      
      setSuggestions([...recentSuggestions, ...trending]);
      return;
    }

    // ML-powered prediction
    const allSuggestions: SearchSuggestion[] = [];

    // Match from history
    history.forEach(item => {
      const score = calculateRelevanceScore(query, item);
      if (score > 0) {
        allSuggestions.push({
          type: 'history',
          text: item,
          score: score + 20 // Boost history items
        });
      }
    });

    // Match products
    products.forEach(product => {
      const nameScore = calculateRelevanceScore(query, product.name);
      const descScore = calculateRelevanceScore(query, product.description);
      const tagScore = Math.max(...product.tags.map(tag => calculateRelevanceScore(query, tag)));
      
      const maxScore = Math.max(nameScore, descScore, tagScore);
      
      if (maxScore > 10) {
        allSuggestions.push({
          type: 'product',
          text: product.name,
          score: maxScore,
          productId: product.id
        });
      }
    });

    // Match categories
    categories.forEach(category => {
      const score = calculateRelevanceScore(query, category.name);
      if (score > 10) {
        allSuggestions.push({
          type: 'category',
          text: category.name,
          score: score + 15 // Boost categories slightly
        });
      }
    });

    // Sort by score and deduplicate
    const uniqueSuggestions = Array.from(
      new Map(allSuggestions.map(s => [s.text.toLowerCase(), s])).values()
    );
    
    setSuggestions(
      uniqueSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
    );
  }, [query, history]);

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return;
    
    addToHistory(searchText);
    navigate(`/products?search=${encodeURIComponent(searchText)}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.productId) {
      navigate(`/product/${suggestion.productId}`);
      setQuery('');
      setIsOpen(false);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'history': return <Clock className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left group",
                  highlightedIndex === index && "bg-accent"
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {getIcon(suggestion.type)}
                </span>
                <span className="flex-1 text-sm text-foreground">
                  {suggestion.text}
                </span>
                {suggestion.type === 'history' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(suggestion.text);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {suggestion.type === 'trending' && (
                  <span className="text-xs text-muted-foreground">Trending</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
