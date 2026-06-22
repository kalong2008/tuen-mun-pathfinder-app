import * as DropdownMenu from 'zeego/dropdown-menu';

import type { MenuOption } from '@/lib/header-menu-options';

type RenderMenuCheckboxItemOptions<T extends string> = {
  itemKey: string;
  option: MenuOption<T>;
  selected: boolean;
  onSelect: (value: T) => void;
};

export function renderMenuCheckboxItem<T extends string>({
  itemKey,
  option,
  selected,
  onSelect,
}: RenderMenuCheckboxItemOptions<T>) {
  return (
    <DropdownMenu.CheckboxItem
      key={itemKey}
      value={selected}
      onValueChange={() => onSelect(option.value)}
    >
      <DropdownMenu.ItemIndicator />
      <DropdownMenu.ItemIcon
        ios={{ name: option.icon.ios as never }}
        androidIconName={option.icon.android}
      />
      <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
    </DropdownMenu.CheckboxItem>
  );
}
