import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-mobile';

interface ComboboxOption {
  value: string;
  label: string;
  searchText?: string;
}

interface ComboboxCreateProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxCreate({
  options,
  value,
  onValueChange,
  onCreate,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado encontrado',
  className,
  disabled = false,
}: ComboboxCreateProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter options (limit to 50)
  const filteredOptions = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return options
      .filter((option) => {
        const textToSearch = option.searchText || option.label;
        return textToSearch.toLowerCase().includes(searchLower);
      })
      .slice(0, 50);
  }, [options, debouncedSearch]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    if (onCreate && search.trim()) {
      onCreate(search.trim());
      setSearch('');
      setOpen(false);
    }
  };

  const content = (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder={searchPlaceholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
            {onCreate && search.trim() && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" />
                Criar "{search}"
              </Button>
            )}
          </div>
        </CommandEmpty>
        <CommandGroup>
          {filteredOptions.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => handleSelect(option.value)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  value === option.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="h-full w-full p-0 sm:h-auto sm:max-w-lg">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle>Selecionar</DialogTitle>
              <DialogDescription className="sr-only">
                Selecione uma opção ou crie uma nova
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">{content}</div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {content}
      </PopoverContent>
    </Popover>
  );
}
