'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

// ✅ ĐỊNH NGHĨA PROPS với defaultValue
interface AdminSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export default function AdminSearchBar({ 
  onSearch, 
  placeholder = "Tìm kiếm...",
  defaultValue = ''
}: AdminSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  // ✅ Sync state với URL khi defaultValue thay đổi
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleSearch = () => {
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        className="pr-20"
      />
      {query && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8" 
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button 
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8" 
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
